import React, { useState } from 'react';
import { Classroom } from '../types';
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
  FileSpreadsheet
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
}

export const GoogleSheetConfigModal: React.FC<Props> = ({
  onClose,
  webAppUrl,
  setWebAppUrl,
  onSyncFromSheet,
  onSyncToSheet,
  isSyncing,
  lastSyncTime,
  classrooms
}) => {
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  // Google Apps Script Backend Database Code
  const appsScriptCode = `function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  return ContentService.createTextOutput(JSON.stringify({ status: "success", data: data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    function initHeader() {
      sheet.clearContents();
      sheet.appendRow(["【新北市立青山國民中小學 115學年度國小部班級教室桌椅清點與需求調查統計總表】"]);
      sheet.appendRow([
        "班級代號", "樓層", "班級名稱", "導師姓名", "分機", "學生人數",
        "填報狀態", "桌子總數", "桌子型號及數量 (型號:數量)", "椅子總數", "椅子型號及數量 (型號:數量)",
        "導師備註說明", "最後更新時間"
      ]);
    }

    if (sheet.getLastRow() === 0) {
      initHeader();
    }
    
    // 一鍵整批重設與同步全校班級
    if (contents.action === "syncAll" && contents.classrooms) {
      initHeader();
      contents.classrooms.forEach(function(item) {
        var deskStr = (item.deskEntries || []).map(function(d) { return "型號 " + d.model + ": " + d.quantity + "張"; }).join(" ; ");
        if (!deskStr) deskStr = "無紀錄";
        var chairStr = (item.chairEntries || []).map(function(c) { return "型號 " + c.model + ": " + c.quantity + "張"; }).join(" ; ");
        if (!chairStr) chairStr = "無紀錄";

        var totalDesks = (item.deskEntries || []).reduce(function(sum, d) { return sum + (d.quantity || 0); }, 0);
        var totalChairs = (item.chairEntries || []).reduce(function(sum, c) { return sum + (c.quantity || 0); }, 0);

        sheet.appendRow([
          item.id, item.floor, item.name, item.teacher, item.extension, item.studentCount || 0,
          item.reported ? "已填報" : "待填報", totalDesks, deskStr, totalChairs, chairStr,
          item.note || "", new Date().toLocaleString("zh-TW")
        ]);
      });
      return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 單一班級填報即時更新
    if (contents.action === "updateClassroom") {
      var item = contents.classroom;
      var data = sheet.getDataRange().getValues();
      var found = false;
      
      var deskStr = (item.deskEntries || []).map(function(d) { return "型號 " + d.model + ": " + d.quantity + "張"; }).join(" ; ");
      if (!deskStr) deskStr = "無紀錄";
      var chairStr = (item.chairEntries || []).map(function(c) { return "型號 " + c.model + ": " + c.quantity + "張"; }).join(" ; ");
      if (!chairStr) chairStr = "無紀錄";

      var totalDesks = (item.deskEntries || []).reduce(function(sum, d) { return sum + (d.quantity || 0); }, 0);
      var totalChairs = (item.chairEntries || []).reduce(function(sum, c) { return sum + (c.quantity || 0); }, 0);

      for (var i = 0; i < data.length; i++) {
        if (data[i][0] == item.id) {
          var rowIdx = i + 1;
          sheet.getRange(rowIdx, 6).setValue(item.studentCount || 0);
          sheet.getRange(rowIdx, 7).setValue(item.reported ? "已填報" : "待填報");
          sheet.getRange(rowIdx, 8).setValue(totalDesks);
          sheet.getRange(rowIdx, 9).setValue(deskStr);
          sheet.getRange(rowIdx, 10).setValue(totalChairs);
          sheet.getRange(rowIdx, 11).setValue(chairStr);
          sheet.getRange(rowIdx, 12).setValue(item.note || "");
          sheet.getRange(rowIdx, 13).setValue(new Date().toLocaleString("zh-TW"));
          found = true;
          break;
        }
      }
      
      if (!found) {
        sheet.appendRow([
          item.id, item.floor, item.name, item.teacher, item.extension, item.studentCount || 0,
          item.reported ? "已填報" : "待填報", totalDesks, deskStr, totalChairs, chairStr,
          item.note || "", new Date().toLocaleString("zh-TW")
        ]);
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

  const handleTestSync = async () => {
    if (!webAppUrl.trim()) {
      setTestResult({ success: false, msg: '請輸入 Google Apps Script Web App URL！' });
      return;
    }

    setTestResult(null);
    const ok = await onSyncToSheet();
    if (ok) {
      setTestResult({ success: true, msg: '連線成功！現有班級清點數據已同步至 Google Sheet！' });
    } else {
      setTestResult({ success: false, msg: '無法連線至 Google Sheet Web App，請檢查網址與部署權限是否改為「所有人 (Anyone)」。' });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-inner">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Google Sheet 雲端資料庫連線設定</h2>
              <p className="text-xs text-slate-400">連線您的 Google 試算表，直接作為即時資料庫進行寫入與更新</p>
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
            webAppUrl ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' : 'bg-amber-50/80 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg shrink-0 ${webAppUrl ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
                <Wifi className="w-4 h-4" />
              </div>
              <div>
                <strong className="block font-bold text-sm">
                  {webAppUrl ? 'Google Sheet 資料庫已連結' : '尚未連結 Google Sheet'}
                </strong>
                <span className="text-[11px] opacity-80">
                  {lastSyncTime ? `上次同步時間：${lastSyncTime}` : '貼上網址即可將 Google Sheet 當成小型資料庫作業'}
                </span>
              </div>
            </div>

            {webAppUrl && (
              <button
                onClick={onSyncFromSheet}
                disabled={isSyncing}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>立即從表格重整</span>
              </button>
            )}
          </div>

          {/* URL Input Box */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-900">
              請貼上您的 Google Apps Script 網頁應用程式 (Web App) URL：
            </label>
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
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 shrink-0 shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>測試並同步寫入</span>
              </button>
            </div>

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
                <span>一鍵設定：如何在 30 秒內建立您的 Google Sheet 資料庫？</span>
              </h3>
              <button
                onClick={handleCopyCode}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '已複製程式碼' : '複製 Apps Script 腳本'}</span>
              </button>
            </div>

            {/* Critical Alert Box */}
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>⚠️ 為什麼寫入格式沒有變更？（關鍵必看步驟）</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed pl-5">
                Google Apps Script 修改程式碼後，僅點擊「儲存 (磁碟圖示)」<strong>無效</strong>！舊的網址依然會繼續執行舊版格式。請務必點擊右上角 <strong>「部署」 → 「新建部署」 (New Deployment)</strong>，將存取權限設為 <strong>「所有人 (Anyone)」</strong> 並再次發佈，即可啟用全新中文格式！
              </p>
            </div>

            <ol className="space-y-2.5 list-decimal list-inside text-slate-700 leading-relaxed">
              <li>開啟您的 Google 試算表，點擊頂部選單 <strong>「擴充功能」 → 「Apps Script」</strong>。</li>
              <li>將開啟頁面中的舊程式碼全部刪除，貼上下方點選複製的 <strong>Apps Script 專屬腳本</strong>。</li>
              <li>點擊右上角藍色 <strong>「部署」 → 「新建部署 (New Deployment)」</strong>（⚠️ 注意：請勿直接選「管理部署」）。</li>
              <li>齒輪選擇 <strong>「網頁應用程式 (Web App)」</strong>，將「誰有存取權限 (Who has access)」設定為 <strong>「所有人 (Anyone)」</strong>，然後點擊「部署」。</li>
              <li>複製最新發佈出來的網頁應用程式 URL，貼回上方的輸入框並點擊「測試並同步寫入」即大功告成！</li>
            </ol>

            {/* Code Box Preview */}
            <div className="relative bg-slate-900 text-emerald-300 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-36 border border-slate-800">
              <pre>{appsScriptCode}</pre>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex justify-end">
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
