import React from 'react';
import {
  FileText,
  HelpCircle,
  ArrowUpDown,
  RefreshCw,
  Building2,
  Database,
  CheckCircle2,
  Wifi,
  Lock
} from 'lucide-react';

interface Props {
  activeTab: 'classrooms' | 'coordinator' | 'exporter';
  setActiveTab: (tab: 'classrooms' | 'coordinator' | 'exporter') => void;
  onOpenSpecs: () => void;
  onOpenSheetConfig: () => void;
  onResetData: () => void;
  totalClassrooms: number;
  reportedCount: number;
  isSheetConnected: boolean;
}

export const Header: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onOpenSpecs,
  onOpenSheetConfig,
  onResetData,
  totalClassrooms,
  reportedCount,
  isSheetConnected
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3.5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4">
          
          {/* Brand & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-inner text-white flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 shrink-0" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white whitespace-nowrap">
                  國小部 班級桌椅清點與需求調查系統
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 rounded text-xs font-semibold whitespace-nowrap shrink-0">
                  115學年度
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 whitespace-nowrap">
                國小部各班級教室桌椅清點與搬運調配管理
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            
            {/* Google Sheet Connection Badge & Button (Password Locked) */}
            <button
              onClick={onOpenSheetConfig}
              title="連結 Google Sheet 資料庫 (需要管理員密碼 admin)"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border whitespace-nowrap shrink-0 cursor-pointer ${
                isSheetConnected
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/80'
                  : 'bg-slate-800 border-amber-500/40 text-amber-300 hover:bg-slate-700'
              }`}
            >
              <Lock className="w-3 h-3 text-amber-400 shrink-0" />
              <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="whitespace-nowrap">{isSheetConnected ? 'Google Sheet 資料庫 (已連線)' : '連結 Google Sheet 資料庫'}</span>
              <span className={`w-2 h-2 rounded-full shrink-0 ${isSheetConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            </button>

            {/* Quick Spec Lookup */}
            <button
              onClick={onOpenSpecs}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs whitespace-nowrap shrink-0 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="whitespace-nowrap">型號對照表</span>
            </button>

            {/* Google Doc Export Button */}
            <button
              onClick={() => setActiveTab('exporter')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'exporter'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm font-bold'
                  : 'bg-slate-800 text-blue-300 hover:bg-slate-700 hover:text-white border-slate-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="whitespace-nowrap">Google Doc / Sheet 匯出</span>
            </button>

            {/* Coordinator Button */}
            <button
              onClick={() => setActiveTab('coordinator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'coordinator'
                  ? 'bg-amber-600 text-white border-amber-500 shadow-sm font-bold'
                  : 'bg-slate-800 text-amber-300 hover:bg-slate-700 hover:text-white border-slate-700'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="whitespace-nowrap">跨班桌椅調配</span>
            </button>

            {/* Reset Button (Password Locked) */}
            <button
              onClick={onResetData}
              title="重新歸零 (需要管理員密碼 admin)"
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Lock className="w-3 h-3 text-rose-400 shrink-0" />
              <RefreshCw className="w-3.5 h-3.5 text-rose-300 shrink-0" />
              <span className="whitespace-nowrap">重新歸零</span>
            </button>
          </div>

        </div>

        {/* Primary Tab Navigation Row */}
        <div className="flex border-t border-slate-800 pt-1 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('classrooms')}
            className={`px-4 py-2.5 font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'classrooms'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">各樓層班級清點單</span>
            <span className="ml-1 px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded-full text-[10px] whitespace-nowrap shrink-0">
              {reportedCount}/{totalClassrooms} 已填報
            </span>
          </button>

          <button
            onClick={() => setActiveTab('coordinator')}
            className={`px-4 py-2.5 font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'coordinator'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">多餘桌椅調配媒合</span>
          </button>

          <button
            onClick={() => setActiveTab('exporter')}
            className={`px-4 py-2.5 font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'exporter'
                ? 'border-blue-500 text-blue-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">Google Doc 格式文件與試算表匯出</span>
          </button>
        </div>
      </div>
    </header>
  );
};
