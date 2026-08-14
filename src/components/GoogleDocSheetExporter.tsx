import React, { useState } from 'react';
import { Classroom, TransferLog } from '../types';
import { calculateInventoryStatus, DESK_SPECS } from '../data/initialData';
import { transformClassroomToSheetRow, ClassroomSheetRow } from '../utils/sheetUtils';
import {
  FileText,
  Table,
  Copy,
  Download,
  Check,
  Building2,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Info,
  Truck,
  ArrowRightLeft,
  Layers,
  AlertCircle
} from 'lucide-react';

interface Props {
  classrooms: Classroom[];
  transferLogs?: TransferLog[];
}

export const GoogleDocSheetExporter: React.FC<Props> = ({ classrooms, transferLogs = [] }) => {
  const [activeFormat, setActiveFormat] = useState<'doc' | 'sheet'>('sheet');
  const [copiedDoc, setCopiedDoc] = useState(false);
  const [copiedSheet, setCopiedSheet] = useState(false);

  // Compute school-wide totals
  const totalStudents = classrooms.reduce((sum, c) => sum + c.studentCount, 0);
  const totalDesks = classrooms.reduce((sum, c) => sum + (c.reported ? calculateInventoryStatus(c).totalDesks : 0), 0);
  const totalChairs = classrooms.reduce((sum, c) => sum + (c.reported ? calculateInventoryStatus(c).totalChairs : 0), 0);
  const reportedCount = classrooms.filter(c => c.reported).length;

  let totalDeskShortage = 0;
  let totalDeskSurplus = 0;
  let totalChairShortage = 0;
  let totalChairSurplus = 0;

  classrooms.forEach(c => {
    if (c.reported) {
      const st = calculateInventoryStatus(c);
      if (st.deskDifference < 0) totalDeskShortage += Math.abs(st.deskDifference);
      if (st.deskDifference > 0) totalDeskSurplus += st.deskDifference;
      if (st.chairDifference < 0) totalChairShortage += Math.abs(st.chairDifference);
      if (st.chairDifference > 0) totalChairSurplus += st.chairDifference;
    }
  });

  // Transform all classrooms into structured 21-column sheet rows
  const sheetRows: ClassroomSheetRow[] = classrooms.map(c => transformClassroomToSheetRow(c));

  // Generate HTML for Google Doc / Clipboard
  const generateDocHTML = () => {
    const today = new Date().toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>青山國小115學年度班級教室桌椅型號清點與搬運調配統計總表</title>
<style>
  body { font-family: 'Microsoft JhengHei', 'PMingLiU', sans-serif; line-height: 1.6; color: #1e293b; padding: 20px; font-size: 12px; }
  h1 { font-size: 20px; text-align: center; color: #0f172a; margin-bottom: 4px; }
  h2 { font-size: 15px; text-align: center; color: #334155; margin-top: 0; font-weight: normal; }
  .meta-box { background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; margin: 16px 0; border-radius: 6px; }
  .main-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 20px; }
  .main-table th, .main-table td { border: 1px solid #64748b; padding: 6px 6px; }
  .main-table th { background-color: #0f172a; color: #ffffff; text-align: center; font-weight: bold; }
  .tag-ok { background-color: #d1fae5; color: #065f46; padding: 2px 4px; border-radius: 3px; font-weight: bold; font-size: 10px; }
  .tag-need { background-color: #ffe4e6; color: #9f1239; padding: 2px 4px; border-radius: 3px; font-weight: bold; font-size: 10px; }
  .tag-surplus { background-color: #dbeafe; color: #1e40af; padding: 2px 4px; border-radius: 3px; font-weight: bold; font-size: 10px; }
  .tag-unreported { background-color: #fef3c7; color: #92400e; padding: 2px 4px; border-radius: 3px; font-size: 10px; }
  .tag-exchange { background-color: #fef3c7; color: #b45309; padding: 2px 4px; border-radius: 3px; font-weight: bold; font-size: 10px; }
  .footer { margin-top: 24px; font-size: 11px; color: #64748b; text-align: right; }
</style>
</head>
<body>

<h1>新北市立青山國民中小學 (國小部)</h1>
<h2>115學年度 班級教室桌椅型號清點與搬運調配統計總表</h2>

<div class="meta-box">
  <table style="width: 100%; border: none; font-size: 12px;">
    <tr>
      <td><strong>清點統計日期：</strong>${today}</td>
      <td><strong>全校班級數：</strong>${classrooms.length} 班</td>
      <td><strong>填報完成班級：</strong>${reportedCount} 班</td>
    </tr>
    <tr>
      <td><strong>全校學生總數：</strong>${totalStudents} 人</td>
      <td><strong>桌子缺口總計：</strong><span style="color: #e11d48; font-weight: bold;">${totalDeskShortage} 張</span></td>
      <td><strong>椅子缺口總計：</strong><span style="color: #e11d48; font-weight: bold;">${totalChairShortage} 張</span></td>
    </tr>
    <tr>
      <td><strong>多餘桌子總數：</strong><span style="color: #2563eb; font-weight: bold;">${totalDeskSurplus} 張</span></td>
      <td><strong>多餘椅子總數：</strong><span style="color: #2563eb; font-weight: bold;">${totalChairSurplus} 張</span></td>
      <td><strong>調查承辦單位：</strong>總務處</td>
    </tr>
  </table>
</div>

<h3>【壹、各班級桌椅型號清點、數量審核與搬運調配總表】</h3>

<table class="main-table">
  <thead>
    <tr>
      <th style="width: 4%;">樓層</th>
      <th style="width: 7%;">班級</th>
      <th style="width: 8%;">導師(分機)</th>
      <th style="width: 4%;">學生</th>
      <th style="width: 10%;">數量審核結果</th>
      <th style="width: 5%;">現有桌數</th>
      <th style="width: 5%;">桌差額</th>
      <th style="width: 12%;">桌子型號及數量</th>
      <th style="width: 5%;">現有椅數</th>
      <th style="width: 5%;">椅差額</th>
      <th style="width: 12%;">椅子型號及數量</th>
      <th style="width: 13%;">換型號/調配需求</th>
      <th style="width: 10%;">【搬運】調度配置</th>
    </tr>
  </thead>
  <tbody>
    ${sheetRows.map(r => `
      <tr>
        <td style="text-align: center; font-weight: bold;">${r.floor}</td>
        <td><strong>${r.name}</strong></td>
        <td>${r.teacher} (${r.extension})</td>
        <td style="text-align: center; font-weight: bold;">${r.studentCount}</td>
        <td style="text-align: center;">${r.auditResult}</td>
        <td style="text-align: center;">${r.totalDesks}</td>
        <td style="text-align: center;">${r.deskDiffText}</td>
        <td>${r.deskListText}</td>
        <td style="text-align: center;">${r.totalChairs}</td>
        <td style="text-align: center;">${r.chairDiffText}</td>
        <td>${r.chairListText}</td>
        <td>${r.exchangeNeedText}</td>
        <td><strong>${r.logisticsPlanText}</strong></td>
      </tr>
    `).join('')}
  </tbody>
</table>

${transferLogs.length > 0 ? `
<h3>【貳、課桌椅跨班調配與搬運派工明細清單】</h3>
<table class="main-table">
  <thead>
    <tr style="background-color: #065f46;">
      <th>派工單號</th>
      <th>登記時間</th>
      <th>調出班級 (來源)</th>
      <th>調入班級 (需求)</th>
      <th>搬運物品</th>
      <th>型號</th>
      <th>調配數量</th>
      <th>執行狀態</th>
      <th>調配備註說明</th>
    </tr>
  </thead>
  <tbody>
    ${transferLogs.map(l => `
      <tr>
        <td style="text-align: center;">${l.id}</td>
        <td style="text-align: center;">${l.timestamp}</td>
        <td>${l.fromClassName}</td>
        <td>${l.toClassName}</td>
        <td style="text-align: center;">${l.type === 'desk' ? '桌子' : '椅子'}</td>
        <td style="text-align: center;">${l.model}</td>
        <td style="text-align: center; font-weight: bold;">${l.quantity} 張</td>
        <td style="text-align: center;">${l.status === 'completed' ? '<span class="tag-ok">已搬運完成</span>' : '<span class="tag-need">待搬運</span>'}</td>
        <td>${l.note || '-'}</td>
      </tr>
    `).join('')}
  </tbody>
</table>
` : ''}

<div class="footer">
  <p>青山國小總務處 謹製｜本檔案格式相容於 Google Docs、Google Sheets 與 Microsoft Office</p>
</div>

</body>
</html>
    `;
  };

  // Generate CSV for Google Sheet / Excel (Full 21 Columns)
  const generateCSV = () => {
    const title = ['【新北市立青山國民中小學 115學年度國小部班級教室桌椅清點與搬運調配統計總表】'];
    const headers = [
      '班級代號', '樓層', '班級名稱', '導師姓名', '分機', '學生人數',
      '填報狀態', '數量審核結果',
      '現有桌數', '桌數差額 (缺/多)', '現有桌子型號及數量',
      '現有椅數', '椅數差額 (缺/多)', '現有椅子型號及數量',
      '多餘/可釋出型號清單', '短缺/待撥補型號清單', '換型號/特殊調配需求',
      '【搬運】調度需求與配置明細', '搬運執行進度', '導師備註說明', '最後更新時間'
    ];
    
    const rows = sheetRows.map(r => [
      r.id,
      r.floor,
      r.name,
      r.teacher,
      r.extension,
      r.studentCount,
      r.reportedStatus,
      r.auditResult,
      r.totalDesks,
      r.deskDiffText,
      r.deskListText,
      r.totalChairs,
      r.chairDiffText,
      r.chairListText,
      r.surplusItemsText,
      r.shortageItemsText,
      r.exchangeNeedText,
      r.logisticsPlanText,
      r.logisticsStatusText,
      (r.note || '').replace(/"/g, '""'),
      r.lastUpdated
    ]);

    let csvContent = [title, headers, ...rows].map(row => row.map(v => `"${v}"`).join(',')).join('\n');

    if (transferLogs.length > 0) {
      csvContent += '\n\n';
      csvContent += '"【課桌椅跨班調配與搬運派工明細紀錄表】"\n';
      csvContent += '"派工單號","登記時間","調出班級 (來源)","調入班級 (需求)","搬運物品","型號","調配數量","搬運執行狀態","調配備註說明"\n';
      transferLogs.forEach(l => {
        csvContent += `"${l.id}","${l.timestamp}","${l.fromClassName}","${l.toClassName}","${l.type === 'desk' ? '桌子' : '椅子'}","${l.model}","${l.quantity} 張","${l.status === 'completed' ? '已搬運完成' : '待搬運'}","${(l.note || '').replace(/"/g, '""')}"\n`;
      });
    }

    return csvContent;
  };

  // Generate TSV for clipboard paste directly into Google Sheet
  const generateTSV = () => {
    const title = ['【新北市立青山國民中小學 115學年度國小部班級教室桌椅清點與搬運調配統計總表】'];
    const headers = [
      '班級代號', '樓層', '班級名稱', '導師姓名', '分機', '學生人數',
      '填報狀態', '數量審核結果',
      '現有桌數', '桌數差額 (缺/多)', '現有桌子型號及數量',
      '現有椅數', '椅數差額 (缺/多)', '現有椅子型號及數量',
      '多餘/可釋出型號清單', '短缺/待撥補型號清單', '換型號/特殊調配需求',
      '【搬運】調度需求與配置明細', '搬運執行進度', '導師備註說明', '最後更新時間'
    ];
    
    const rows = sheetRows.map(r => [
      r.id,
      r.floor,
      r.name,
      r.teacher,
      r.extension,
      r.studentCount,
      r.reportedStatus,
      r.auditResult,
      r.totalDesks,
      r.deskDiffText,
      r.deskListText,
      r.totalChairs,
      r.chairDiffText,
      r.chairListText,
      r.surplusItemsText,
      r.shortageItemsText,
      r.exchangeNeedText,
      r.logisticsPlanText,
      r.logisticsStatusText,
      r.note || '',
      r.lastUpdated
    ]);

    return [title, headers, ...rows].map(row => row.join('\t')).join('\n');
  };

  // Copy HTML for Google Doc
  const handleCopyDoc = async () => {
    const htmlContent = generateDocHTML();
    try {
      const blobHtml = new Blob([htmlContent], { type: 'text/html' });
      const blobText = new Blob([generateTSV()], { type: 'text/plain' });
      
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': blobHtml,
            'text/plain': blobText
          })
        ]);
        setCopiedDoc(true);
        setTimeout(() => setCopiedDoc(false), 2500);
      } else {
        await navigator.clipboard.writeText(htmlContent);
        setCopiedDoc(true);
        setTimeout(() => setCopiedDoc(false), 2500);
      }
    } catch (err) {
      navigator.clipboard.writeText(generateTSV());
      setCopiedDoc(true);
      setTimeout(() => setCopiedDoc(false), 2500);
    }
  };

  // Download .doc file compatible with Google Doc & MS Word
  const handleDownloadDoc = () => {
    const html = generateDocHTML();
    const blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `青山國小115學年度班級桌椅型號清點與搬運調配總表_${new Date().toISOString().slice(0,10)}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download CSV for Google Sheet & Excel
  const handleDownloadCSV = () => {
    const csvContent = generateCSV();
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `青山國小班級桌椅清點與搬運調配統計總表_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy TSV for Google Sheet
  const handleCopyTSV = () => {
    const tsv = generateTSV();
    navigator.clipboard.writeText(tsv);
    setCopiedSheet(true);
    setTimeout(() => setCopiedSheet(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                後台 Excel / Google Sheet 全新同步呈現
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-400/30">
                  21 欄精確審核 + 搬運調度派工
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              即時整合全校前台填報：清楚展示各班「數量是否正確」、「多/少型號與數量」、「換型號調配需求」以及「【搬運】調度需求配置」，格式完全相容 Google Sheets、Google Docs 與 Excel！
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveFormat('sheet')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeFormat === 'sheet'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Google Sheet / Excel 總表</span>
            </button>

            <button
              onClick={() => setActiveFormat('doc')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeFormat === 'doc'
                  ? 'bg-indigo-500 text-white shadow-md font-extrabold'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Google Doc / Word 文件</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Export Content Area */}
      {activeFormat === 'sheet' ? (
        /* Google Sheet Export Tab */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-600 rounded-lg text-white">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-950 text-sm">全新 21 欄試算表資料導出</h4>
                <p className="text-xs text-emerald-800">可下載包含完整欄位的 .CSV 檔案，或一鍵複製 TSV 文字直接貼上 Google Sheet 試算表</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopyTSV}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {copiedSheet ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSheet ? '已複製 TSV！(可直接貼入 Google Sheet)' : '複製 TSV (直貼 Google Sheet)'}</span>
              </button>

              <button
                onClick={handleDownloadCSV}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>下載 .CSV 檔案 (Excel相容)</span>
              </button>
            </div>
          </div>

          {/* School-Wide Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-slate-500 block text-[11px]">班級填報進度</span>
              <strong className="text-sm text-slate-900 font-mono">{reportedCount} / {classrooms.length} 班</strong>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-slate-500 block text-[11px]">學生總人數</span>
              <strong className="text-sm text-slate-900 font-mono">{totalStudents} 人</strong>
            </div>
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center">
              <span className="text-rose-700 block text-[11px]">全校短缺缺口</span>
              <strong className="text-sm text-rose-700 font-mono">缺桌 {totalDeskShortage} / 缺椅 {totalChairShortage}</strong>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
              <span className="text-blue-700 block text-[11px]">全校多餘釋出</span>
              <strong className="text-sm text-blue-700 font-mono">多桌 {totalDeskSurplus} / 多椅 {totalChairSurplus}</strong>
            </div>
          </div>

          {/* Interactive Google Sheet Grid View */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="bg-slate-900 text-white px-4 py-3 font-bold text-xs flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Table className="w-4 h-4 text-emerald-400" />
                <span>後台 Google Sheet 試算表呈現預覽 (21 欄結構)</span>
              </span>
              <span className="text-[11px] font-normal text-slate-300">橫向捲動可檢視所有型號清單與【搬運】調度需求</span>
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                <thead className="sticky top-0 z-10 bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-center">班級</th>
                    <th className="py-2.5 px-2 border-r border-slate-300 text-center">樓層</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">導師(分機)</th>
                    <th className="py-2.5 px-2.5 border-r border-slate-300 text-center">學生</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-center bg-emerald-50 text-emerald-900 font-extrabold">數量審核結果</th>
                    <th className="py-2.5 px-2.5 border-r border-slate-300 text-center">現有桌數</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-center">桌差額</th>
                    <th className="py-2.5 px-3.5 border-r border-slate-300">現有桌子型號及數量</th>
                    <th className="py-2.5 px-2.5 border-r border-slate-300 text-center">現有椅數</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-center">椅差額</th>
                    <th className="py-2.5 px-3.5 border-r border-slate-300">現有椅子型號及數量</th>
                    <th className="py-2.5 px-3.5 border-r border-slate-300 text-blue-800">多餘/可釋出型號</th>
                    <th className="py-2.5 px-3.5 border-r border-slate-300 text-rose-800">短缺/待撥補型號</th>
                    <th className="py-2.5 px-3.5 border-r border-slate-300 text-amber-800 bg-amber-50">換型號/調配需求</th>
                    <th className="py-2.5 px-4 border-r border-slate-300 bg-indigo-50 text-indigo-950 font-extrabold">【搬運】調度需求與配置明細</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-center">搬運進度</th>
                    <th className="py-2.5 px-3">導師備註說明</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                  {sheetRows.map((r, i) => {
                    const isAuditOk = r.auditResult.includes('完全正確');
                    const hasShortage = r.auditResult.includes('缺');
                    const hasSurplus = r.auditResult.includes('多');

                    return (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 border-r border-slate-200 font-bold text-slate-900 font-sans">{r.name}</td>
                        <td className="py-2 px-2 border-r border-slate-200 font-bold text-center text-slate-600 font-sans">{r.floor}</td>
                        <td className="py-2 px-3 border-r border-slate-200 font-sans">{r.teacher} ({r.extension})</td>
                        <td className="py-2 px-2.5 border-r border-slate-200 text-center font-bold text-slate-900">{r.studentCount}</td>
                        
                        {/* 數量審核結果 */}
                        <td className="py-2 px-3 border-r border-slate-200 text-center font-sans">
                          {r.reportedStatus === '待填報' ? (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px]">待填報</span>
                          ) : isAuditOk ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">🟢 數量正確</span>
                          ) : hasShortage ? (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded text-[10px]">{r.auditResult}</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded text-[10px]">{r.auditResult}</span>
                          )}
                        </td>

                        {/* 桌子 */}
                        <td className="py-2 px-2.5 border-r border-slate-200 text-center">{r.reportedStatus === '已填報' ? r.totalDesks : '-'}</td>
                        <td className={`py-2 px-3 border-r border-slate-200 text-center font-bold ${
                          r.deskDiffText.includes('缺') ? 'text-rose-600' : r.deskDiffText.includes('多') ? 'text-blue-600' : 'text-emerald-700'
                        }`}>
                          {r.deskDiffText}
                        </td>
                        <td className="py-2 px-3.5 border-r border-slate-200 font-sans">{r.deskListText}</td>

                        {/* 椅子 */}
                        <td className="py-2 px-2.5 border-r border-slate-200 text-center">{r.reportedStatus === '已填報' ? r.totalChairs : '-'}</td>
                        <td className={`py-2 px-3 border-r border-slate-200 text-center font-bold ${
                          r.chairDiffText.includes('缺') ? 'text-rose-600' : r.chairDiffText.includes('多') ? 'text-blue-600' : 'text-emerald-700'
                        }`}>
                          {r.chairDiffText}
                        </td>
                        <td className="py-2 px-3.5 border-r border-slate-200 font-sans">{r.chairListText}</td>

                        {/* 多餘 / 短缺 */}
                        <td className="py-2 px-3.5 border-r border-slate-200 font-sans text-blue-900">{r.surplusItemsText}</td>
                        <td className="py-2 px-3.5 border-r border-slate-200 font-sans text-rose-900">{r.shortageItemsText}</td>

                        {/* 換型號需求 */}
                        <td className="py-2 px-3.5 border-r border-slate-200 font-sans bg-amber-50/50">
                          {r.exchangeNeedText.includes('需更換') ? (
                            <span className="text-amber-900 font-bold">{r.exchangeNeedText}</span>
                          ) : (
                            <span className="text-slate-400">{r.exchangeNeedText}</span>
                          )}
                        </td>

                        {/* 【搬運】調度需求與配置明細 */}
                        <td className="py-2 px-4 border-r border-slate-200 font-sans bg-indigo-50/30">
                          <span className={`font-semibold ${
                            r.logisticsPlanText.includes('【待') ? 'text-rose-700 font-bold' :
                            r.logisticsPlanText.includes('【可調出') ? 'text-blue-700 font-bold' :
                            r.logisticsPlanText.includes('已完成') ? 'text-emerald-700 font-bold' :
                            'text-slate-600'
                          }`}>
                            {r.logisticsPlanText}
                          </span>
                        </td>

                        {/* 搬運執行進度 */}
                        <td className="py-2 px-3 border-r border-slate-200 text-center font-sans">
                          {r.logisticsStatusText === '已完成' ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">已完成</span>
                          ) : r.logisticsStatusText === '待搬運調度' ? (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold rounded text-[10px]">待搬運調度</span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">{r.logisticsStatusText}</span>
                          )}
                        </td>

                        {/* 導師備註 */}
                        <td className="py-2 px-3 font-sans truncate max-w-xs text-slate-700">{r.note || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transfer Dispatch Logs Sub-Table Preview if exists */}
          {transferLogs.length > 0 && (
            <div className="border border-emerald-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="bg-emerald-900 text-white px-4 py-3 font-bold text-xs flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-300" />
                  <span>分頁 2 預覽：【搬運調度派工與歷程清單】(Transfer & Dispatch Logs)</span>
                </span>
                <span className="text-[11px] font-normal text-emerald-200">共 {transferLogs.length} 筆跨班調配派工任務</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-emerald-50 text-emerald-950 font-bold border-b border-emerald-200">
                    <tr>
                      <th className="py-2 px-3">單號</th>
                      <th className="py-2 px-3">時間</th>
                      <th className="py-2 px-3">調出班級 (來源)</th>
                      <th className="py-2 px-3">調入班級 (需求)</th>
                      <th className="py-2 px-3">物品與型號</th>
                      <th className="py-2 px-3 text-center">調配數量</th>
                      <th className="py-2 px-3 text-center">搬運狀態</th>
                      <th className="py-2 px-3">備註說明</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-100 font-mono text-[11px]">
                    {transferLogs.map(l => (
                      <tr key={l.id} className="hover:bg-emerald-50/40">
                        <td className="py-1.5 px-3 font-bold">{l.id}</td>
                        <td className="py-1.5 px-3 text-slate-500">{l.timestamp}</td>
                        <td className="py-1.5 px-3 font-sans font-bold text-slate-900">{l.fromClassName}</td>
                        <td className="py-1.5 px-3 font-sans font-bold text-indigo-900">{l.toClassName}</td>
                        <td className="py-1.5 px-3 font-sans">
                          {l.type === 'desk' ? '🪑 桌子' : '💺 椅子'} - 型號 <strong className="text-emerald-800">{l.model}</strong>
                        </td>
                        <td className="py-1.5 px-3 text-center font-bold text-emerald-900">{l.quantity} 張</td>
                        <td className="py-1.5 px-3 text-center font-sans">
                          {l.status === 'completed' ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">已搬運完成</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold rounded text-[10px]">待搬運</span>
                          )}
                        </td>
                        <td className="py-1.5 px-3 font-sans text-slate-600">{l.note || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* Google Doc / Word Format Tab */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-indigo-50/80 border border-indigo-200 rounded-xl">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-600 rounded-lg text-white">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-indigo-950 text-sm">Google Doc / Word 排版文件檔產出</h4>
                <p className="text-xs text-indigo-800">點擊下方按鈕可直接複製富文字表格，或下載為標準相容的 .doc 檔案</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopyDoc}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {copiedDoc ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedDoc ? '已複製！(可直接 Ctrl+V 貼入 Google Doc)' : '複製表格至 Google Doc'}</span>
              </button>

              <button
                onClick={handleDownloadDoc}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-indigo-400" />
                <span>下載 Google Doc (.doc) 檔案</span>
              </button>
            </div>
          </div>

          {/* Rendered Doc Document Preview Frame */}
          <div className="border border-slate-300 rounded-2xl p-8 bg-white shadow-inner max-w-5xl mx-auto space-y-6 font-sans">
            
            {/* Header Document Banner */}
            <div className="text-center border-b-2 border-slate-900 pb-4">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">新北市立青山國民中小學 (國小部)</h2>
              <h3 className="text-lg font-bold text-slate-700 mt-1">115學年度 班級教室桌椅型號清點與搬運調配統計總表</h3>
              <p className="text-xs text-slate-500 mt-2">承辦單位：總務處｜產出時間：{new Date().toLocaleDateString('zh-TW')}</p>
            </div>

            {/* Document Metrics Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <span className="text-slate-500 block">全校班級總數</span>
                <strong className="text-base text-slate-900 font-mono">{classrooms.length} 班</strong>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <span className="text-slate-500 block">學生人數總計</span>
                <strong className="text-base text-slate-900 font-mono">{totalStudents} 人</strong>
              </div>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-center">
                <span className="text-rose-700 block">桌椅缺口總計</span>
                <strong className="text-base text-rose-700 font-mono">桌缺{totalDeskShortage} / 椅缺{totalChairShortage}</strong>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <span className="text-blue-700 block">多餘可調配數</span>
                <strong className="text-base text-blue-700 font-mono">桌多{totalDeskSurplus} / 椅多{totalChairSurplus}</strong>
              </div>
            </div>

            {/* Document Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse border border-slate-400">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold border-b border-slate-400">
                    <th className="p-2 border border-slate-400 text-center">樓層</th>
                    <th className="p-2 border border-slate-400">班級</th>
                    <th className="p-2 border border-slate-400">導師/分機</th>
                    <th className="p-2 border border-slate-400 text-center">學生</th>
                    <th className="p-2 border border-slate-400 text-center">審核結果</th>
                    <th className="p-2 border border-slate-400">桌子清點 (差額)</th>
                    <th className="p-2 border border-slate-400">椅子清點 (差額)</th>
                    <th className="p-2 border border-slate-400">【搬運】調度配置明細</th>
                    <th className="p-2 border border-slate-400">導師備註</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 text-[11px]">
                  {sheetRows.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="p-2 border border-slate-300 text-center font-bold">{r.floor}</td>
                      <td className="p-2 border border-slate-300 font-bold">{r.name}</td>
                      <td className="p-2 border border-slate-300">{r.teacher} ({r.extension})</td>
                      <td className="p-2 border border-slate-300 text-center font-mono font-bold">{r.studentCount}</td>
                      <td className="p-2 border border-slate-300 text-center font-bold">
                        {r.auditResult}
                      </td>
                      <td className="p-2 border border-slate-300">
                        {r.reportedStatus === '已填報' ? (
                          <>總數: {r.totalDesks} ({r.deskDiffText})<br/><span className="text-slate-600 text-[10px]">{r.deskListText}</span></>
                        ) : '尚未填報'}
                      </td>
                      <td className="p-2 border border-slate-300">
                        {r.reportedStatus === '已填報' ? (
                          <>總數: {r.totalChairs} ({r.chairDiffText})<br/><span className="text-slate-600 text-[10px]">{r.chairListText}</span></>
                        ) : '尚未填報'}
                      </td>
                      <td className="p-2 border border-slate-300 font-semibold text-indigo-950">
                        {r.logisticsPlanText}
                        {r.exchangeNeedText.includes('需更換') && (
                          <div className="text-[10px] text-amber-800 mt-0.5">{r.exchangeNeedText}</div>
                        )}
                      </td>
                      <td className="p-2 border border-slate-300 text-[10px] text-slate-700">{r.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-slate-200 text-slate-500 text-xs flex justify-between">
              <span>青山國小總務處 關心您</span>
              <span>頁次 1 / 1</span>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

