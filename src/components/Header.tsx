import React from 'react';
import { 
  Building2, 
  FileSpreadsheet, 
  FileText, 
  Image as ImageIcon, 
  ArrowRightLeft, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Zap,
  Layers,
  Sparkles
} from 'lucide-react';
import { GoogleSheetConfig } from '../types';

interface HeaderProps {
  sheetConfig: GoogleSheetConfig;
  onOpenDeskSpec: () => void;
  onOpenMatchmaker: () => void;
  onOpenSheetSync: () => void;
  onOpenDocExport: () => void;
  onResetData?: () => void;
  totalClasses: number;
  completedClasses: number;
  shortageDesks: number;
  shortageChairs: number;
  surplusDesks: number;
  surplusChairs: number;
  isSyncing?: boolean;
  onManualSync?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sheetConfig,
  onOpenDeskSpec,
  onOpenMatchmaker,
  onOpenSheetSync,
  onOpenDocExport,
  onResetData,
  totalClasses,
  completedClasses,
  shortageDesks,
  shortageChairs,
  surplusDesks,
  surplusChairs,
  isSyncing = false,
  onManualSync,
}) => {
  const isSheetConnected = Boolean(sheetConfig.webAppUrl);

  return (
    <header className="bg-white border-b border-slate-200 shadow-xs sticky top-0 z-30">
      {/* Top Global Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Context */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-md flex items-center justify-center text-white font-mono font-bold text-xs tracking-wider shadow-xs">
            QS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 leading-none tracking-tight">
                新北市青山國中小 <span className="text-xs font-normal text-slate-500">小學部 115學年度</span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 font-mono">
              v2.4.1 • 班級教室桌椅型號清點與需求調查系統
            </p>
          </div>
        </div>

        {/* Live Sync Badge & Header Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {isSheetConnected ? (
            <div className="flex items-center px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200/80">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-wider">Live Sync Active</span>
            </div>
          ) : (
            <div className="flex items-center px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 mr-1.5"></span>
              <span className="text-[10px] font-bold uppercase tracking-wider">Sheet 待連線</span>
            </div>
          )}

          <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

          <button
            onClick={onOpenDeskSpec}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md border border-slate-200 transition flex items-center gap-1.5"
          >
            <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
            <span>型號尺寸圖表</span>
          </button>

          <button
            onClick={onOpenMatchmaker}
            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-md border border-indigo-200 transition flex items-center gap-1.5 relative"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />
            <span>多餘資源調撥</span>
            {(shortageDesks > 0 || shortageChairs > 0) && (
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
            )}
          </button>

          <button
            onClick={onOpenSheetSync}
            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-md border border-emerald-200 transition flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Google Sheet 後台</span>
          </button>

          <button
            onClick={onOpenDocExport}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition flex items-center gap-1.5 shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Google Doc 報表匯出</span>
          </button>

          {onResetData && (
            <button
              onClick={() => {
                if (window.confirm('確定要將全校桌椅資料重置為空白 (未填報) 狀態嗎？')) {
                  onResetData();
                }
              }}
              title="重置所有資料為空白填報表"
              className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-md border border-slate-200 transition"
            >
              清空資料
            </button>
          )}

          {isSheetConnected && onManualSync && (
            <button
              onClick={onManualSync}
              disabled={isSyncing}
              title="即時同步 Google Sheet"
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-100 border border-slate-200 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Sub-Header: Statistics Metrics Bar */}
      <div className="bg-slate-50 border-t border-slate-200/80 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-y-2 text-xs">
          <div className="flex items-center space-x-6">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">全校填報進度</span>
              <span className="text-base font-bold text-slate-900 leading-none mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {completedClasses} / {totalClasses} 班
                <span className="text-[11px] font-normal text-slate-500 font-mono ml-1">
                  ({Math.round((completedClasses / (totalClasses || 1)) * 100)}%)
                </span>
              </span>
            </div>

            <div className="h-6 w-px bg-slate-200"></div>

            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">桌子缺額需求</span>
              <span className={`text-base font-bold leading-none mt-0.5 font-mono ${shortageDesks > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {shortageDesks > 0 ? `-${shortageDesks} 張` : '0 (充足)'}
              </span>
            </div>

            <div className="h-6 w-px bg-slate-200"></div>

            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">椅子缺額需求</span>
              <span className={`text-base font-bold leading-none mt-0.5 font-mono ${shortageChairs > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {shortageChairs > 0 ? `-${shortageChairs} 張` : '0 (充足)'}
              </span>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            <div className="flex flex-col hidden sm:flex">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">多餘可調撥總量</span>
              <span className="text-base font-bold text-amber-800 leading-none mt-0.5 font-mono">
                桌 +{surplusDesks} / 椅 +{surplusChairs}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
            <span>調查單位：總務處</span>
            <span>•</span>
            <span>更新於：{new Date().toLocaleTimeString('zh-TW')}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

