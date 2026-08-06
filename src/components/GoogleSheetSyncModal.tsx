import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  RefreshCw, 
  ExternalLink, 
  Info,
  Download,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { GoogleSheetConfig, ClassRoom } from '../types';
import { generateCSVData } from '../utils/inventory';

interface GoogleSheetSyncModalProps {
  sheetConfig: GoogleSheetConfig;
  onSaveConfig: (config: GoogleSheetConfig) => void;
  onManualSync: () => Promise<void>;
  classes: ClassRoom[];
  onClose: () => void;
}

export const GoogleSheetSyncModal: React.FC<GoogleSheetSyncModalProps> = ({
  sheetConfig,
  onSaveConfig,
  onManualSync,
  classes,
  onClose,
}) => {
  const [webAppUrl, setWebAppUrl] = useState(sheetConfig.webAppUrl || '');
  const [spreadsheetId, setSpreadsheetId] = useState(sheetConfig.spreadsheetId || '');
  const [autoSync, setAutoSync] = useState(sheetConfig.autoSync ?? true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const googleAppsScriptCode = `/**
 * 新北市青山國中小(小學部) 班級桌椅型號清點與需求調查 Google Sheet 後台 Apps Script
 * 請複製此代碼至 Google Sheet -> 擴充功能 -> Apps Script 中，並發佈為「Web 應用程式」(權限選擇：所有人/Anyone)。
 */

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    data: data
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var contents = JSON.parse(e.postData.contents);
    
    // 如果表格為空，建立表頭
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "樓層", "班級名稱", "導師姓名", "應備需求組數", 
        "桌子總數", "桌子型號與數量", "桌子需求狀態", 
        "椅子總數", "椅子型號與數量", "椅子需求狀態", 
        "填報狀態", "備註說明", "最後更新時間"
      ]);
    }
    
    if (contents.action === "updateClass") {
      var item = contents.payload;
      var data = sheet.getDataRange().getValues();
      var rowIndex = -1;
      
      for (var i = 1; i < data.length; i++) {
        if (data[i][1] === item.name) {
          rowIndex = i + 1;
          break;
        }
      }
      
      var rowData = [
        item.floor + "樓",
        item.name,
        item.teacher,
        item.studentsCount,
        item.totalDesks,
        item.deskDetails,
        item.deskStatus,
        item.totalChairs,
        item.chairDetails,
        item.chairStatus,
        item.status,
        item.notes || "",
        new Date().toLocaleString("zh-TW")
      ];
      
      if (rowIndex > 0) {
        sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
      } else {
        sheet.appendRow(rowData);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(googleAppsScriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      webAppUrl: webAppUrl.trim(),
      spreadsheetId: spreadsheetId.trim(),
      sheetName: '班級桌椅統計表',
      autoSync,
      lastSyncedAt: new Date().toLocaleTimeString('zh-TW'),
    });
    setSyncMessage('Google Sheet 連線設定已儲存！');
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      await onManualSync();
      setSyncMessage('同步成功！前台與 Google Sheet 已完全同步。');
    } catch (err: any) {
      setSyncMessage(`同步結果：前台資料已就緒 (若尚未貼上 Web App URL，前台會優先使用本機儲存)。`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownloadCSV = () => {
    const csvData = generateCSVData(classes);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `青山國中小_小學部_班級桌椅型號調查表_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-emerald-950 text-white p-5 flex items-center justify-between border-b border-emerald-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Google Sheet 後台串接與同步設定</h2>
              <p className="text-xs text-emerald-300">讓各班清點資料即時同步至總務處 Google 試算表</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-emerald-300 hover:text-white rounded-lg hover:bg-emerald-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Quick Setup Form */}
          <form onSubmit={handleSave} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              1. 貼上您的 Google Sheet Apps Script Web App 網址
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Google Apps Script Web App 網址 (https://script.google.com/macros/s/.../exec)
              </label>
              <input
                type="url"
                value={webAppUrl}
                onChange={(e) => setWebAppUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-xl p-3 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                導師填報完成時自動即時同步至 Google Sheet
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSyncNow}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  測試與即時同步
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  儲存連線網址
                </button>
              </div>
            </div>

            {syncMessage && (
              <div className="text-xs bg-emerald-100 text-emerald-800 p-3 rounded-xl border border-emerald-200 font-medium">
                ✅ {syncMessage}
              </div>
            )}
          </form>

          {/* Setup Instructions & Code Generator */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              2. 3分鐘簡易建立 Google Sheet 後台教學 (一鍵複製代碼)
            </h3>

            <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
              <li>
                開啟您的 <strong>Google Sheet (試算表)</strong>，點選上方選單 <strong>「擴充功能」 &gt; 「Apps Script」</strong>。
              </li>
              <li>刪除原本內容，將下方這段代碼直接貼上。</li>
              <li>
                點選右上角 <strong>「發布 / Deploy」 &gt; 「新部署 / New deployment」</strong>。
              </li>
              <li>
                選擇類型為 <strong>「Web 應用程式 (Web app)」</strong>，存取權限設定為 <strong>「所有人 (Anyone)」</strong> 並部署。
              </li>
              <li>複製產生的網址，貼回上方欄位即可！</li>
            </ol>

            <div className="relative">
              <div className="flex items-center justify-between bg-slate-900 text-slate-300 px-4 py-2 rounded-t-2xl border-b border-slate-800 text-xs font-mono">
                <span>Google Apps Script 腳本代碼</span>
                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-semibold bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 transition"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? '已複製代碼！' : '一鍵複製 Apps Script'}
                </button>
              </div>
              <textarea
                readOnly
                rows={8}
                value={googleAppsScriptCode}
                className="w-full text-xs font-mono bg-slate-950 text-slate-200 p-4 rounded-b-2xl focus:outline-none border border-slate-900"
              />
            </div>
          </div>

          {/* Backup Option: Download CSV */}
          <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-800">直接匯出為 Google Sheet / Excel 相容 CSV 檔案</div>
              <div className="text-xs text-slate-500">免設定網址，直接下載目前全校班級桌椅清點總表 CSV 檔</div>
            </div>

            <button
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              下載 Google Sheet 專用 CSV
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition"
          >
            完成並關閉
          </button>
        </div>
      </div>
    </div>
  );
};
