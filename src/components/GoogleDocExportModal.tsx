import React, { useState, useRef } from 'react';
import { 
  X, 
  FileText, 
  Copy, 
  Check, 
  Download, 
  Printer, 
  Building2,
  Sparkles
} from 'lucide-react';
import { ClassRoom } from '../types';
import { getClassInventorySummary, getDeskColorName } from '../utils/inventory';

interface GoogleDocExportModalProps {
  classes: ClassRoom[];
  onClose: () => void;
}

export const GoogleDocExportModal: React.FC<GoogleDocExportModalProps> = ({
  classes,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const docRef = useRef<HTMLDivElement>(null);

  // Group classes by floor
  const classesByFloor = [1, 2, 3, 4, 5].map((fl) => ({
    floor: fl,
    classList: classes.filter((c) => c.floor === fl),
  }));

  // Calculations for total missing desks & chairs
  let totalShortageDesks = 0;
  let totalShortageChairs = 0;
  let totalSurplusDesks = 0;
  let totalSurplusChairs = 0;

  classes.forEach((c) => {
    const sum = getClassInventorySummary(c);
    if (sum.deskDiff < 0) totalShortageDesks += Math.abs(sum.deskDiff);
    if (sum.deskDiff > 0) totalSurplusDesks += sum.deskDiff;
    if (sum.chairDiff < 0) totalShortageChairs += Math.abs(sum.chairDiff);
    if (sum.chairDiff > 0) totalSurplusChairs += sum.chairDiff;
  });

  const handleCopyFormattedDoc = () => {
    if (!docRef.current) return;
    try {
      const htmlContent = docRef.current.innerHTML;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const data = [new ClipboardItem({ 'text/html': blob, 'text/plain': new Blob([docRef.current.innerText], { type: 'text/plain' }) })];
      navigator.clipboard.write(data).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    } catch (err) {
      // Fallback to text copy
      navigator.clipboard.writeText(docRef.current.innerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadDoc = () => {
    if (!docRef.current) return;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>班級桌椅調查總表</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + docRef.current.innerHTML + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `新北市青山國中小_班級桌椅型號調查總表_${new Date().toISOString().slice(0, 10)}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-blue-950 text-white p-5 flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Google Doc / Word 報表匯出專區</h2>
              <p className="text-xs text-blue-300">產生標準文件表格，可直接複製貼入 Google Doc 或下載 Word .doc 檔</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyFormattedDoc}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copied ? '已複製！可貼入 Google Doc' : '一鍵複製至 Google Doc'}
            </button>

            <button
              onClick={handleDownloadDoc}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
            >
              <Download className="w-4 h-4 text-sky-400" />
              下載 .doc 檔
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-blue-900 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Content View */}
        <div className="p-6 max-h-[75vh] overflow-y-auto bg-slate-100">
          <div
            ref={docRef}
            className="bg-white p-8 sm:p-10 rounded-xl shadow-md border border-slate-300 max-w-3xl mx-auto font-sans text-slate-900 leading-normal"
            style={{ fontFamily: 'Microsoft JhengHei, PingFang TC, sans-serif' }}
          >
            {/* Document Header Title */}
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                新北市青山國中小(小學部) 115學年度
              </h1>
              <h2 className="text-xl font-bold text-blue-900 mt-1">
                各班級教室桌椅型號清點與需求調查統計總表
              </h2>
              <p className="text-xs text-slate-500 mt-2">
                調查單位：總務處 | 報表日期：{new Date().toLocaleDateString('zh-TW')} | 清點對象：國小部全體班級
              </p>
            </div>

            {/* Summary Box */}
            <div className="mb-6 p-4 bg-slate-50 border border-slate-300 rounded-lg">
              <h3 className="text-sm font-bold text-slate-900 mb-2">一、全校桌椅現況統計摘要</h3>
              <table className="w-full text-xs text-center border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-200 text-slate-800 font-bold">
                    <th className="p-2 border border-slate-300">項目</th>
                    <th className="p-2 border border-slate-300">桌子總需求</th>
                    <th className="p-2 border border-slate-300">多餘可調撥</th>
                    <th className="p-2 border border-slate-300">椅子總需求</th>
                    <th className="p-2 border border-slate-300">多餘可調撥</th>
                    <th className="p-2 border border-slate-300">清點完成率</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border border-slate-300 font-bold">數量總計</td>
                    <td className="p-2 border border-slate-300 font-bold text-rose-700">
                      {totalShortageDesks > 0 ? `缺 ${totalShortageDesks} 張` : '無缺額'}
                    </td>
                    <td className="p-2 border border-slate-300 text-amber-800 font-bold">
                      +{totalSurplusDesks} 張
                    </td>
                    <td className="p-2 border border-slate-300 font-bold text-rose-700">
                      {totalShortageChairs > 0 ? `缺 ${totalShortageChairs} 張` : '無缺額'}
                    </td>
                    <td className="p-2 border border-slate-300 text-amber-800 font-bold">
                      +{totalSurplusChairs} 張
                    </td>
                    <td className="p-2 border border-slate-300 font-bold">
                      {classes.filter((c) => c.status === '已完成').length} / {classes.length} 班
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Detailed Table by Floor */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-900 mb-2">二、各樓層班級教室桌椅清點明細</h3>
              <table className="w-full text-xs border-collapse border border-slate-400">
                <thead>
                  <tr className="bg-slate-800 text-white font-bold text-center">
                    <th className="p-2 border border-slate-400 w-12">樓層</th>
                    <th className="p-2 border border-slate-400 w-24">班級</th>
                    <th className="p-2 border border-slate-400 w-24">導師</th>
                    <th className="p-2 border border-slate-400 w-20">應備需求</th>
                    <th className="p-2 border border-slate-400">現有桌子型號及數量</th>
                    <th className="p-2 border border-slate-400">桌子狀態</th>
                    <th className="p-2 border border-slate-400">現有椅子型號及數量</th>
                    <th className="p-2 border border-slate-400">椅子狀態</th>
                    <th className="p-2 border border-slate-400 w-20">清點狀態</th>
                  </tr>
                </thead>
                <tbody>
                  {classesByFloor.map((group) => (
                    <React.Fragment key={group.floor}>
                      {group.classList.map((c, idx) => {
                        const sum = getClassInventorySummary(c);
                        const deskStr = c.desks.map((d) => `${d.model}:${d.quantity}張`).join(', ') || '無';
                        const chairStr = c.chairs.map((ch) => `${ch.model}:${ch.quantity}張`).join(', ') || '無';

                        return (
                          <tr key={c.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            {idx === 0 && (
                              <td
                                rowSpan={group.classList.length}
                                className="p-2 border border-slate-400 font-bold text-center bg-slate-100"
                              >
                                {group.floor}樓
                              </td>
                            )}
                            <td className="p-2 border border-slate-400 font-bold">{c.name}</td>
                            <td className="p-2 border border-slate-400">{c.teacher}</td>
                            <td className="p-2 border border-slate-400 text-center font-bold">{c.studentsCount ? `${c.studentsCount}組` : '待確認'}</td>
                            <td className="p-2 border border-slate-400 text-[11px]">{deskStr}</td>
                            <td className="p-2 border border-slate-400 text-center font-semibold text-[11px]">
                              {sum.deskTag.text}
                            </td>
                            <td className="p-2 border border-slate-400 text-[11px]">{chairStr}</td>
                            <td className="p-2 border border-slate-400 text-center font-semibold text-[11px]">
                              {sum.chairTag.text}
                            </td>
                            <td className="p-2 border border-slate-400 text-center font-bold text-[11px]">
                              {c.status}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signature Block for General Affairs Office */}
            <div className="mt-12 pt-6 border-t border-slate-300 text-xs grid grid-cols-3 gap-8 text-center">
              <div>
                <p className="font-bold text-slate-800 mb-8">承辦人 (總務處)：</p>
                <div className="border-b border-slate-400 w-32 mx-auto"></div>
              </div>
              <div>
                <p className="font-bold text-slate-800 mb-8">總務主任：</p>
                <div className="border-b border-slate-400 w-32 mx-auto"></div>
              </div>
              <div>
                <p className="font-bold text-slate-800 mb-8">校長：</p>
                <div className="border-b border-slate-400 w-32 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            提示：點擊「一鍵複製至 Google Doc」後，至 Google Doc 貼上 (Ctrl+V) 即可保留完整表格樣式。
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition"
          >
            關閉視窗
          </button>
        </div>
      </div>
    </div>
  );
};
