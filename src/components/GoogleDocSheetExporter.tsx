import React, { useState } from 'react';
import { Classroom } from '../types';
import { calculateInventoryStatus, DESK_SPECS } from '../data/initialData';
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
  Info
} from 'lucide-react';

interface Props {
  classrooms: Classroom[];
}

export const GoogleDocSheetExporter: React.FC<Props> = ({ classrooms }) => {
  const [activeFormat, setActiveFormat] = useState<'doc' | 'sheet'>('doc');
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
<title>青山國小115學年度班級教室桌椅型號清點與需求調查表</title>
<style>
  body { font-family: 'PMingLiU', 'Microsoft JhengHei', sans-serif; line-height: 1.6; color: #1e293b; padding: 20px; }
  h1 { font-size: 22px; text-align: center; color: #0f172a; margin-bottom: 4px; }
  h2 { font-size: 16px; text-align: center; color: #334155; margin-top: 0; font-weight: normal; }
  .meta-box { background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; margin: 16px 0; border-radius: 6px; }
  .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
  .summary-table th, .summary-table td { border: 1px solid #94a3b8; padding: 8px 10px; text-align: center; }
  .summary-table th { background-color: #e2e8f0; font-weight: bold; }
  .main-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .main-table th, .main-table td { border: 1px solid #64748b; padding: 6px 8px; text-align: left; }
  .main-table th { background-color: #1e293b; color: #ffffff; text-align: center; }
  .tag-ok { background-color: #d1fae5; color: #065f46; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 11px; }
  .tag-[need] { background-color: #ffe4e6; color: #9f1239; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 11px; }
  .tag-surplus { background-color: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 11px; }
  .tag-[unreported] { background-color: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
  .footer { margin-top: 24px; font-size: 12px; color: #64748b; text-align: right; }
</style>
</head>
<body>

<h1>新北市立青山國民中小學 (國小部)</h1>
<h2>115學年度 班級教室桌椅型號清點與需求調查統計總表</h2>

<div class="meta-box">
  <table style="width: 100%; border: none; font-size: 13px;">
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

<h3>【各班級桌椅型號與增減清點詳細統計表】</h3>

<table class="main-table">
  <thead>
    <tr>
      <th style="width: 5%;">樓層</th>
      <th style="width: 10%;">班級</th>
      <th style="width: 10%;">導師/分機</th>
      <th style="width: 6%;">學生</th>
      <th style="width: 8%;">現有桌數</th>
      <th style="width: 18%;">桌子型號及數量</th>
      <th style="width: 8%;">現有椅數</th>
      <th style="width: 15%;">椅子型號及數量</th>
      <th style="width: 10%;">桌椅供需狀態</th>
      <th style="width: 10%;">備註說明</th>
    </tr>
  </thead>
  <tbody>
    ${classrooms.map(c => {
      if (!c.reported) {
        return `
          <tr>
            <td style="text-align: center;">${c.floor}</td>
            <td><strong>${c.name}</strong> ${c.titleExtra || ''}</td>
            <td>${c.teacher} (${c.extension})</td>
            <td style="text-align: center;">${c.studentCount}</td>
            <td style="text-align: center; color: #94a3b8;">-</td>
            <td style="color: #94a3b8;">尚未填報</td>
            <td style="text-align: center; color: #94a3b8;">-</td>
            <td style="color: #94a3b8;">尚未填報</td>
            <td style="text-align: center;"><span class="tag-[unreported]">尚未填報</span></td>
            <td>-</td>
          </tr>
        `;
      }

      const st = calculateInventoryStatus(c);
      const deskListStr = c.deskEntries.map(d => `${d.model} (${d.quantity}張)`).join('、 ');
      const chairListStr = c.chairEntries.map(ch => `${ch.model} (${ch.quantity}張)`).join('、 ');

      let deskTagHTML = '<span class="tag-ok">桌數正確</span>';
      if (st.deskDifference < 0) deskTagHTML = `<span class="tag-[need]">缺桌 ${Math.abs(st.deskDifference)}</span>`;
      if (st.deskDifference > 0) deskTagHTML = `<span class="tag-surplus">多桌 ${st.deskDifference}</span>`;

      let chairTagHTML = '<span class="tag-ok">椅數正確</span>';
      if (st.chairDifference < 0) chairTagHTML += ` <span class="tag-[need]">缺椅 ${Math.abs(st.chairDifference)}</span>`;
      if (st.chairDifference > 0) chairTagHTML += ` <span class="tag-surplus">多椅 ${st.chairDifference}</span>`;

      return `
        <tr>
          <td style="text-align: center;">${c.floor}</td>
          <td><strong>${c.name}</strong> ${c.titleExtra || ''}</td>
          <td>${c.teacher} (${c.extension})</td>
          <td style="text-align: center; font-weight: bold;">${c.studentCount}</td>
          <td style="text-align: center;">${st.totalDesks}</td>
          <td>${deskListStr}</td>
          <td style="text-align: center;">${st.totalChairs}</td>
          <td>${chairListStr}</td>
          <td style="text-align: center;">${deskTagHTML}<br/>${chairTagHTML}</td>
          <td>${c.note || '-'}</td>
        </tr>
      `;
    }).join('')}
  </tbody>
</table>

<div class="footer">
  <p>青山國小總務處 謹製｜本檔案格式完全相容於 Google Docs 與 Microsoft Word</p>
</div>

</body>
</html>
    `;
  };

  // Generate TSV / CSV for Google Sheet
  const generateCSV = () => {
    const title = ['【新北市立青山國民中小學 115學年度國小部班級教室桌椅清點與需求調查統計總表】'];
    const headers = ['樓層', '班級名稱', '職稱/備註', '導師姓名', '分機', '學生人數', '桌子總數', '桌子型號及數量 (型號:數量)', '椅子總數', '椅子型號及數量 (型號:數量)', '桌子需求狀態', '椅子需求狀態', '備註說明', '填報狀態', '搬運完成標記'];
    
    const rows = classrooms.map(c => {
      const st = calculateInventoryStatus(c);
      const deskStr = c.deskEntries.length > 0
        ? c.deskEntries.map(d => `型號 ${d.model}: ${d.quantity}張`).join('; ')
        : '無紀錄';
      const chairStr = c.chairEntries.length > 0
        ? c.chairEntries.map(ch => `型號 ${ch.model}: ${ch.quantity}張`).join('; ')
        : '無紀錄';

      return [
        c.floor,
        c.name,
        c.titleExtra || '',
        c.teacher,
        c.extension,
        c.studentCount,
        c.reported ? st.totalDesks : 0,
        deskStr,
        c.reported ? st.totalChairs : 0,
        chairStr,
        c.reported ? st.deskTag : '尚未填報',
        c.reported ? st.chairTag : '尚未填報',
        (c.note || '').replace(/"/g, '""'),
        c.reported ? '已填報' : '未填報',
        c.isCompleted ? '已完成' : '處理中'
      ];
    });

    return [title, headers, ...rows].map(row => row.map(v => `"${v}"`).join(',')).join('\n');
  };

  // Generate TSV for clipboard paste to Google Sheet
  const generateTSV = () => {
    const title = ['【新北市立青山國民中小學 115學年度國小部班級教室桌椅清點與需求調查統計總表】'];
    const headers = ['樓層', '班級名稱', '職稱/備註', '導師姓名', '分機', '學生人數', '桌子總數', '桌子型號與數量 (型號:數量)', '椅子總數', '椅子型號與數量 (型號:數量)', '桌子需求狀態', '椅子需求狀態', '導師備註說明'];
    
    const rows = classrooms.map(c => {
      const st = calculateInventoryStatus(c);
      const deskStr = c.deskEntries.length > 0
        ? c.deskEntries.map(d => `型號 ${d.model}: ${d.quantity}張`).join(' ; ')
        : '無紀錄';
      const chairStr = c.chairEntries.length > 0
        ? c.chairEntries.map(ch => `型號 ${ch.model}: ${ch.quantity}張`).join(' ; ')
        : '無紀錄';

      return [
        c.floor,
        c.name,
        c.titleExtra || '',
        c.teacher,
        c.extension,
        c.studentCount,
        c.reported ? st.totalDesks : 0,
        deskStr,
        c.reported ? st.totalChairs : 0,
        chairStr,
        c.reported ? st.deskTag : '未填報',
        c.reported ? st.chairTag : '未填報',
        c.note || ''
      ];
    });

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
      console.error('Copy failed:', err);
      // Fallback
      navigator.clipboard.writeText(generateTSV());
      setCopiedDoc(true);
      setTimeout(() => setCopiedDoc(false), 2500);
    }
  };

  // Download .doc file compatible with Google Doc
  const handleDownloadDoc = () => {
    const html = generateDocHTML();
    const blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `青山國小115學年度班級桌椅型號清點統計總表_${new Date().toISOString().slice(0,10)}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download CSV for Google Sheet
  const handleDownloadCSV = () => {
    const csvContent = generateCSV();
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `青山國小班級桌椅清點與需求調查表_${new Date().toISOString().slice(0,10)}.csv`;
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
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-6 h-6 text-blue-300" />
              <h2 className="text-xl font-bold tracking-tight">Google Doc / Google Sheet 檔案匯出與預覽</h2>
            </div>
            <p className="text-xs text-blue-100 max-w-2xl leading-relaxed">
              可直接產出 Google Doc 可完美讀取的相容 Word/Doc 格式與表格，或一鍵複製直接貼上 Google Doc 與 Google Sheet 試算表！
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFormat('doc')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFormat === 'doc'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'bg-blue-900/60 text-blue-200 hover:bg-blue-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Google Doc 文件格式</span>
            </button>

            <button
              onClick={() => setActiveFormat('sheet')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFormat === 'sheet'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'bg-blue-900/60 text-blue-200 hover:bg-blue-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Google Sheet 試算表</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Export Content Area */}
      {activeFormat === 'doc' ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Google Doc 排版文件檔產出</h4>
                <p className="text-xs text-slate-500">點擊下方按鈕可直接複製富文字表格或下載 Google Doc 檔案</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Copy HTML Table */}
              <button
                onClick={handleCopyDoc}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {copiedDoc ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedDoc ? '已複製！(可直接 Ctrl+V 貼入 Google Doc)' : '複製表格至 Google Doc'}</span>
              </button>

              {/* Download Doc */}
              <button
                onClick={handleDownloadDoc}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span>下載 Google Doc (.doc) 檔案</span>
              </button>
            </div>
          </div>

          {/* Rendered Doc Document Preview Frame */}
          <div className="border border-slate-300 rounded-2xl p-8 bg-white shadow-inner max-w-4xl mx-auto space-y-6 font-sans">
            
            {/* Header Document Banner */}
            <div className="text-center border-b-2 border-slate-900 pb-4">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">新北市立青山國民中小學 (國小部)</h2>
              <h3 className="text-lg font-bold text-slate-700 mt-1">115學年度 班級教室桌椅型號清點與需求調查總表</h3>
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
                    <th className="p-2 border border-slate-400 text-center">桌數</th>
                    <th className="p-2 border border-slate-400">桌子型號及數量</th>
                    <th className="p-2 border border-slate-400 text-center">椅數</th>
                    <th className="p-2 border border-slate-400">椅子型號及數量</th>
                    <th className="p-2 border border-slate-400 text-center">需求狀態</th>
                    <th className="p-2 border border-slate-400">導師備註</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {classrooms.map(c => {
                    if (!c.reported) {
                      return (
                        <tr key={c.id} className="bg-amber-50/40">
                          <td className="p-2 border border-slate-300 text-center font-bold">{c.floor}</td>
                          <td className="p-2 border border-slate-300 font-bold">{c.name}</td>
                          <td className="p-2 border border-slate-300">{c.teacher} ({c.extension})</td>
                          <td className="p-2 border border-slate-300 text-center font-mono">{c.studentCount}</td>
                          <td className="p-2 border border-slate-300 text-center text-slate-400">-</td>
                          <td className="p-2 border border-slate-300 italic text-amber-700 font-bold">尚未填報</td>
                          <td className="p-2 border border-slate-300 text-center text-slate-400">-</td>
                          <td className="p-2 border border-slate-300 italic text-amber-700 font-bold">尚未填報</td>
                          <td className="p-2 border border-slate-300 text-center">
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                              尚未填報
                            </span>
                          </td>
                          <td className="p-2 border border-slate-300 text-slate-400">-</td>
                        </tr>
                      );
                    }

                    const st = calculateInventoryStatus(c);
                    const deskListStr = c.deskEntries.map(d => `${d.model} (${d.quantity}張)`).join('、');
                    const chairListStr = c.chairEntries.map(ch => `${ch.model} (${ch.quantity}張)`).join('、');

                    return (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="p-2 border border-slate-300 text-center font-bold">{c.floor}</td>
                        <td className="p-2 border border-slate-300 font-bold">
                          {c.name} <span className="text-[10px] text-indigo-600 font-normal">{c.titleExtra}</span>
                        </td>
                        <td className="p-2 border border-slate-300">{c.teacher} ({c.extension})</td>
                        <td className="p-2 border border-slate-300 text-center font-mono font-bold">{c.studentCount}</td>
                        <td className="p-2 border border-slate-300 text-center font-mono">{st.totalDesks}</td>
                        <td className="p-2 border border-slate-300 font-mono text-[11px]">{deskListStr}</td>
                        <td className="p-2 border border-slate-300 text-center font-mono">{st.totalChairs}</td>
                        <td className="p-2 border border-slate-300 font-mono text-[11px]">{chairListStr}</td>
                        <td className="p-2 border border-slate-300 text-center">
                          <div className="space-y-1">
                            {st.deskDifference === 0 ? (
                              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded block">桌數正確</span>
                            ) : st.deskDifference < 0 ? (
                              <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded block">缺桌 {Math.abs(st.deskDifference)}</span>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded block">多桌 {st.deskDifference}</span>
                            )}

                            {st.chairDifference === 0 ? (
                              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded block">椅數正確</span>
                            ) : st.chairDifference < 0 ? (
                              <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded block">缺椅 {Math.abs(st.chairDifference)}</span>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded block">多椅 {st.chairDifference}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-2 border border-slate-300 text-[11px] text-slate-700">{c.note || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-slate-200 text-slate-500 text-xs flex justify-between">
              <span>青山國小總務處 關心您</span>
              <span>頁次 1 / 1</span>
            </div>

          </div>

        </div>
      ) : (
        /* Google Sheet Export Tab */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
              <div>
                <h4 className="font-bold text-emerald-950 text-sm">Google Sheet 試算表格式導出</h4>
                <p className="text-xs text-emerald-800">可下載 CSV 或一鍵複製 TSV 文字直貼 Google Sheet 試算表儲存格</p>
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
                <span>下載 .CSV 檔案</span>
              </button>
            </div>
          </div>

          {/* Interactive Google Sheet Grid View */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="bg-slate-800 text-white px-4 py-3 font-bold text-xs flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Google Sheet 試算表同步預覽視窗</span>
              </span>
              <span className="text-[11px] font-normal text-slate-300">即時呈現前台各班填報更新</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                    <th className="py-2 px-3 border-r border-slate-200">A (樓層)</th>
                    <th className="py-2 px-3 border-r border-slate-200">B (班級)</th>
                    <th className="py-2 px-3 border-r border-slate-200">C (導師)</th>
                    <th className="py-2 px-3 border-r border-slate-200">D (分機)</th>
                    <th className="py-2 px-3 border-r border-slate-200">E (學生數)</th>
                    <th className="py-2 px-3 border-r border-slate-200">F (桌數)</th>
                    <th className="py-2 px-3 border-r border-slate-200">G (桌子型號)</th>
                    <th className="py-2 px-3 border-r border-slate-200">H (椅數)</th>
                    <th className="py-2 px-3 border-r border-slate-200">I (椅子型號)</th>
                    <th className="py-2 px-3 border-r border-slate-200">J (桌子需求)</th>
                    <th className="py-2 px-3">K (導師備註)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                  {classrooms.map((c, i) => {
                    const st = calculateInventoryStatus(c);
                    return (
                      <tr key={c.id} className="hover:bg-emerald-50/30">
                        <td className="py-1.5 px-3 border-r border-slate-200 font-bold text-center">{c.floor}</td>
                        <td className="py-1.5 px-3 border-r border-slate-200 font-bold text-slate-900">{c.name}</td>
                        <td className="py-1.5 px-3 border-r border-slate-200">{c.teacher}</td>
                        <td className="py-1.5 px-3 border-r border-slate-200">{c.extension}</td>
                        <td className="py-1.5 px-3 border-r border-slate-200 text-center font-bold">{c.studentCount}</td>
                        <td className="py-1.5 px-3 border-r border-slate-200 text-center">{c.reported ? st.totalDesks : '-'}</td>
                        <td className="py-1.5 px-3 border-r border-slate-200">
                          {c.deskEntries.map(d => `型號 ${d.model}: ${d.quantity}張`).join(' ; ') || '無紀錄'}
                        </td>
                        <td className="py-1.5 px-3 border-r border-slate-200 text-center">{c.reported ? st.totalChairs : '-'}</td>
                        <td className="py-1.5 px-3 border-r border-slate-200">
                          {c.chairEntries.map(ch => `型號 ${ch.model}: ${ch.quantity}張`).join(' ; ') || '無紀錄'}
                        </td>
                        <td className="py-1.5 px-3 border-r border-slate-200 font-bold">
                          {c.reported ? st.deskTag : '未填'}
                        </td>
                        <td className="py-1.5 px-3 truncate max-w-xs">{c.note || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
