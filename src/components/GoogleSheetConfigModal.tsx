import React, { useState } from 'react';
import { Classroom, TransferLog } from '../types';
import { transformClassroomToSheetRow } from '../utils/sheetUtils';
import { DEFAULT_GOOGLE_APPS_SCRIPT_URL } from '../data/initialData';
import {
  X,
  Database,
  Copy,
  Check,
  ExternalLink,
  Wifi,
  Sparkles,
  Code2,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  FileSpreadsheet,
  Layers,
  ArrowRightLeft,
  Truck,
  RotateCcw
} from 'lucide-react';

interface Props {
  onClose: () => void;
  webAppUrl: string;
  setWebAppUrl: (url: string) => void;
  onSyncFromSheet: () => Promise<boolean>;
  onSyncToSheet: () => Promise<boolean>;
  isSyncing: boolean;
  lastSyncTime: string;
  classrooms: Classroom[];
  transferLogs?: TransferLog[];
}

export const GoogleSheetConfigModal: React.FC<Props> = ({
  onClose,
  webAppUrl,
  setWebAppUrl,
  onSyncFromSheet,
  onSyncToSheet,
  isSyncing,
  lastSyncTime,
  classrooms,
  transferLogs = []
}) => {
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  // Google Apps Script Backend Database Code (Dual-Storage: High-Speed Properties + 21-Column Human Sheet)
  const appsScriptCode = `/**
 * 新北市立青山國民中小學 115學年度課桌椅清點與搬運調配管理系統
 * Google Apps Script 雲端同步與自動排版後端腳本 (跨裝置雲端資料庫升級版)
 */

function doGet(e) {
  try {
    var props = PropertiesService.getScriptProperties();
    var classroomsJson = props.getProperty("CLASSROOMS_DATA");
    var logsJson = props.getProperty("TRANSFER_LOGS_DATA");
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var mainSheet = ss.getSheetByName("班級桌椅盤點總表") || ss.getActiveSheet();
    var data = mainSheet.getDataRange().getValues();

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      classrooms: classroomsJson ? JSON.parse(classroomsJson) : null,
      transferLogs: logsJson ? JSON.parse(logsJson) : null,
      data: data,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "No post data received" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var contents = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var props = PropertiesService.getScriptProperties();
    
    // 工作表 1：班級桌椅盤點與搬運調配總表
    var sheet = ss.getSheetByName("班級桌椅盤點總表");
    if (!sheet) {
      sheet = ss.insertSheet("班級桌椅盤點總表", 0);
    }
    
    function setupMainHeader() {
      sheet.clear();
      sheet.getRange(1, 1, 1, 21).merge()
        .setValue("【新北市立青山國民中小學 115學年度國小部班級教室桌椅清點與搬運調配統計總表】")
        .setBackground("#0f172a")
        .setFontColor("#ffffff")
        .setFontWeight("bold")
        .setFontSize(13)
        .setHorizontalAlignment("center")
        .setVerticalAlignment("middle");
      sheet.setRowHeight(1, 40);

      var headers = [
        "班級代號", "樓層", "班級名稱", "導師姓名", "分機", "學生人數",
        "填報狀態", "數量審核結果",
        "現有桌數", "桌數差額 (缺/多)", "現有桌子型號及數量",
        "現有椅數", "椅數差額 (缺/多)", "現有椅子型號及數量",
        "多餘/可釋出型號清單", "短缺/待撥補型號清單", "換型號/特殊調配需求",
        "【搬運】調度需求與配置明細", "搬運執行進度", "導師備註說明", "最後更新時間"
      ];
      
      sheet.getRange(2, 1, 1, headers.length)
        .setValues([headers])
        .setBackground("#1e293b")
        .setFontColor("#f8fafc")
        .setFontWeight("bold")
        .setFontSize(10)
        .setHorizontalAlignment("center")
        .setVerticalAlignment("middle")
        .setWrap(true);
      sheet.setRowHeight(2, 36);
      sheet.setFrozenRows(2);
    }

    // 工作表 2：跨班調配與搬運派工清單
    function setupTransferLogsSheet(logs) {
      if (!logs) return;
      var logSheet = ss.getSheetByName("搬運調度派工清單");
      if (!logSheet) {
        logSheet = ss.insertSheet("搬運調度派工清單", 1);
      }
      logSheet.clear();

      logSheet.getRange(1, 1, 1, 9).merge()
        .setValue("【新北市立青山國民中小學 課桌椅跨班調配與搬運派工明細紀錄表】")
        .setBackground("#065f46")
        .setFontColor("#ffffff")
        .setFontWeight("bold")
        .setFontSize(13)
        .setHorizontalAlignment("center")
        .setVerticalAlignment("middle");
      logSheet.setRowHeight(1, 40);

      var logHeaders = [
        "派工單號", "登記時間", "調出班級 (來源)", "調入班級 (需求)",
        "搬運物品", "型號", "調配數量", "搬運執行狀態", "調配備註說明"
      ];

      logSheet.getRange(2, 1, 1, logHeaders.length)
        .setValues([logHeaders])
        .setBackground("#047857")
        .setFontColor("#ffffff")
        .setFontWeight("bold")
        .setFontSize(10)
        .setHorizontalAlignment("center")
        .setVerticalAlignment("middle");
      logSheet.setRowHeight(2, 32);
      logSheet.setFrozenRows(2);

      if (logs && logs.length > 0) {
        var logRows = logs.map(function(l) {
          return [
            l.id || "",
            l.timestamp || "",
            l.fromClassName || "",
            l.toClassName || "",
            (l.type === "desk" || l.itemType === "desk") ? "桌子" : "椅子",
            l.model || "",
            (l.quantity || 0) + " 張",
            l.status === "completed" ? "已搬運完成" : "待搬運",
            l.note || ""
          ];
        });
        logSheet.getRange(3, 1, logRows.length, 9).setValues(logRows)
          .setFontSize(10)
          .setVerticalAlignment("middle");
        logSheet.getRange(2, 1, logRows.length + 1, 9).setBorder(true, true, true, true, true, true, "#cbd5e1", SpreadsheetApp.BorderStyle.SOLID);
      }
      logSheet.autoResizeColumns(1, 9);
    }

    function formatRow(r) {
      if (Array.isArray(r)) return r;
      return [
        r.id || "",
        r.floor || "",
        r.name || "",
        r.teacher || "",
        r.extension || "",
        r.studentCount || 0,
        r.reportedStatus || (r.reported ? "已填報" : "待填報"),
        r.auditResult || "",
        r.totalDesks !== undefined ? r.totalDesks : (r.reported ? 0 : "-"),
        r.deskDiffText || "",
        r.deskListText || (r.deskEntries ? r.deskEntries.map(function(d){ return d.model + "(" + d.quantity + "張)"; }).join("、") : ""),
        r.totalChairs !== undefined ? r.totalChairs : (r.reported ? 0 : "-"),
        r.chairDiffText || "",
        r.chairListText || (r.chairEntries ? r.chairEntries.map(function(ch){ return ch.model + "(" + ch.quantity + "張)"; }).join("、") : ""),
        r.surplusItemsText || "",
        r.shortageItemsText || "",
        r.exchangeNeedText || "",
        r.logisticsPlanText || "",
        r.logisticsStatusText || (r.isCompleted ? "已完成" : "處理中"),
        r.note || "",
        r.lastUpdated || new Date().toLocaleString("zh-TW")
      ];
    }

    // 1. 一鍵全校整批重設與完整同步
    if (contents.action === "syncAll") {
      setupMainHeader();
      var rawItems = contents.rows || contents.classrooms || [];
      var rows = rawItems.map(formatRow);

      if (rows.length > 0) {
        sheet.getRange(3, 1, rows.length, 21).setValues(rows)
          .setFontSize(10)
          .setVerticalAlignment("middle");
        
        sheet.getRange(2, 1, rows.length + 1, 21).setBorder(true, true, true, true, true, true, "#cbd5e1", SpreadsheetApp.BorderStyle.SOLID);
        sheet.getRange(3, 1, rows.length, 2).setHorizontalAlignment("center");
        sheet.getRange(3, 5, rows.length, 6).setHorizontalAlignment("center");
        sheet.getRange(3, 12, rows.length, 2).setHorizontalAlignment("center");
        sheet.getRange(3, 19, rows.length, 1).setHorizontalAlignment("center");
        sheet.getRange(3, 21, rows.length, 1).setHorizontalAlignment("center");
        sheet.getRange(3, 11, rows.length, 1).setWrap(true);
        sheet.getRange(3, 14, rows.length, 7).setWrap(true);
      }

      sheet.autoResizeColumns(1, 21);
      setupTransferLogsSheet(contents.transferLogs || []);

      // 同步備份至 Script Properties 供跨裝置秒開讀取
      if (contents.classrooms) {
        props.setProperty("CLASSROOMS_DATA", JSON.stringify(contents.classrooms));
      }
      if (contents.transferLogs) {
        props.setProperty("TRANSFER_LOGS_DATA", JSON.stringify(contents.transferLogs));
      }

      return ContentService.createTextOutput(JSON.stringify({ status: "success", count: rows.length }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 2. 單一班級填報即時更新
    if (contents.action === "updateClassroom") {
      var rawItem = contents.row || contents.classroom;
      if (rawItem) {
        var rowValues = formatRow(rawItem);
        var data = sheet.getDataRange().getValues();
        var found = false;

        for (var i = 2; i < data.length; i++) {
          if (data[i][0] == (rawItem.id || rowValues[0])) {
            var rowIdx = i + 1;
            sheet.getRange(rowIdx, 1, 1, 21).setValues([rowValues])
              .setVerticalAlignment("middle");
            sheet.getRange(rowIdx, 11, 1, 1).setWrap(true);
            sheet.getRange(rowIdx, 14, 1, 7).setWrap(true);
            found = true;
            break;
          }
        }

        if (!found) {
          if (sheet.getLastRow() < 2) setupMainHeader();
          sheet.appendRow(rowValues);
        }
      }

      if (contents.classrooms) {
        props.setProperty("CLASSROOMS_DATA", JSON.stringify(contents.classrooms));
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleResetToDefaultUrl = () => {
    setWebAppUrl(DEFAULT_GOOGLE_APPS_SCRIPT_URL);
    setTestResult({ success: true, msg: '已成功恢復為青山預設固定 Google Apps Script 資料庫端點！' });
  };

  const handleTestSync = async () => {
    if (!webAppUrl.trim()) {
      setTestResult({ success: false, msg: '請輸入 Google Apps Script Web App URL！' });
      return;
    }

    setTestResult(null);
    const ok = await onSyncToSheet();
    if (ok) {
      setTestResult({ success: true, msg: '連線成功！全新設計的 21 欄班級明細與搬運派工清單已完整同步至 Google Sheet！' });
    } else {
      setTestResult({ success: false, msg: '無法連線至 Google Sheet Web App，請檢查網址與部署權限是否改為「所有人 (Anyone)」。' });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-inner">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                Google Sheet 雲端資料庫後台同步設定
                <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-300 text-[10px] rounded-full border border-emerald-400/30">
                  全新 21 欄精密排版
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                同步數量正確性審核、多/少型號細節、換型號調配需求與【搬運】調度配置
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs text-slate-700">
          
          {/* Status Box */}
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
            webAppUrl ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950' : 'bg-amber-50/90 border-amber-300 text-amber-950'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg shrink-0 ${webAppUrl ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
                <Wifi className="w-4 h-4" />
              </div>
              <div>
                <strong className="block font-bold text-sm">
                  {webAppUrl ? 'Google Sheet 資料庫連線中' : '尚未連結 Google Sheet'}
                </strong>
                <span className="text-[11px] opacity-80">
                  {lastSyncTime ? `上次即時同步時間：${lastSyncTime}` : '貼上 Web App 網址即可實現前台填報與後台 Excel 雙向自動同步'}
                </span>
              </div>
            </div>

            {webAppUrl && (
              <button
                onClick={onSyncToSheet}
                disabled={isSyncing}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 shrink-0 shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>立即整批同步至表格</span>
              </button>
            )}
          </div>

          {/* New Excel Sheet Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1">
              <div className="font-bold text-indigo-950 flex items-center gap-1.5 text-xs">
                <Check className="w-4 h-4 text-indigo-600" />
                <span>1. 數量審核與差額分析</span>
              </div>
              <p className="text-[11px] text-indigo-800 leading-relaxed">
                包含「數量審核結果」、「桌數差額 (缺/多)」、「椅數差額 (缺/多)」，一秒看出符合或缺額。
              </p>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
              <div className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
                <ArrowRightLeft className="w-4 h-4 text-amber-600" />
                <span>2. 多/少型號與換型號</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                自動列出「多餘/可釋出型號清單」、「短缺/待撥補型號」以及導師登記的「換型號指定需求與原因」。
              </p>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
              <div className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>3. 【搬運】調度配置與派工</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                總表紀錄「【搬運】調度需求配置」，並在分頁 2 自動產生「搬運調度派工清單」，工友與行政一目瞭然！
              </p>
            </div>
          </div>

          {/* URL Input Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-900">
                Google Apps Script 雲端資料庫端點 (Web App URL)：
              </label>
              <button
                type="button"
                onClick={handleResetToDefaultUrl}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>恢復為青山預設固定資料庫</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={webAppUrl}
                onChange={e => setWebAppUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <button
                onClick={handleTestSync}
                disabled={isSyncing}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 shrink-0 shadow-xs cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>測試並同步寫入</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              系統預設已永久綁定青山國小部資料庫。每次老師在任何不同電腦開啟本網站，都會自動載入此試算表最新紀錄，並在填報或調配時即時寫回！
            </p>

            {testResult && (
              <div className={`p-3 rounded-xl border flex items-center gap-2 font-medium text-xs mt-2 ${
                testResult.success ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-rose-100 text-rose-900 border-rose-300'
              }`}>
                {testResult.success ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                <span>{testResult.msg}</span>
              </div>
            )}
          </div>

          {/* Quick Setup Instructions Accordion / Step List */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>升級步驟：如何套用全新排版的 Google Apps Script 腳本？</span>
              </h3>
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '已複製全新腳本！' : '複製最新 Apps Script 腳本'}</span>
              </button>
            </div>

            {/* Critical Alert Box */}
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-950 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>⚠️ 關鍵必看：如何讓 Google 試算表立即顯示 21 欄新版格式？</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed pl-5">
                在 Google 試算表貼上新程式碼後，請點擊右上角藍色 <strong>「部署」 → 「管理部署 (Manage Deployments)」或「新建部署」</strong>，將版本建立為新版本，存取權限維持 <strong>「所有人 (Anyone)」</strong>。部署完成後回到本系統點擊 <strong>「測試並同步寫入」</strong>，後台試算表便會自動排版出漂亮完整的 21 欄統計總表與分頁派工清單！
              </p>
            </div>

            <ol className="space-y-2 list-decimal list-inside text-slate-700 leading-relaxed text-[11.5px]">
              <li>開啟您的 Google 試算表，點擊頂部選單 <strong>「擴充功能」 → 「Apps Script」</strong>。</li>
              <li>清空編輯區舊程式碼，貼上上方複製的 <strong>全新 Apps Script 腳本</strong>。</li>
              <li>點擊右上角 <strong>「部署」 → 「管理部署」</strong> → 編輯為新版本（或直接選 <strong>「新建部署」</strong>），存取權限設為 <strong>「所有人」</strong> 並儲存。</li>
              <li>複製部署後的 Web App 網址貼入上方輸入框，點擊「測試並同步寫入」即完成升級！</li>
            </ol>

            {/* Code Box Preview */}
            <div className="relative bg-slate-900 text-emerald-300 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-44 border border-slate-800">
              <pre>{appsScriptCode}</pre>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-colors"
          >
            完成關閉
          </button>
        </div>

      </div>
    </div>
  );
};

