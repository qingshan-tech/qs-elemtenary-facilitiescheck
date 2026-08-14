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
  onSyncCloud?: () => void;
  isSyncing?: boolean;
  lastSyncTime?: string;
}

export const Header: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onOpenSpecs,
  onOpenSheetConfig,
  onResetData,
  totalClassrooms,
  reportedCount,
  isSheetConnected,
  onSyncCloud,
  isSyncing = false,
  lastSyncTime = ''
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md w-full">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 sm:gap-4">
          
          {/* Brand & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 bg-indigo-600 rounded-xl shadow-inner text-white flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-white truncate">
                  國小部 班級桌椅清點與需求調查系統
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 rounded text-xs font-semibold shrink-0">
                  115學年度
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">
                新北市立青山國民中小學 國小部各班級教室桌椅清點與搬運調配管理
              </p>
            </div>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap md:flex-nowrap shrink-0 justify-start md:justify-end">
            
            {/* Cloud Sync Button & Status */}
            {onSyncCloud && (
              <button
                type="button"
                onClick={onSyncCloud}
                disabled={isSyncing}
                title={`點擊從 Google 雲端資料庫更新最新資料${lastSyncTime ? ` (上次同步: ${lastSyncTime})` : ''}`}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border shrink-0 cursor-pointer ${
                  isSyncing
                    ? 'bg-indigo-900/60 border-indigo-500/50 text-indigo-200'
                    : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/80'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? '讀取中...' : '讀取雲端最新資料'}</span>
                {lastSyncTime && !isSyncing && (
                  <span className="text-[10px] text-emerald-300 bg-emerald-900/80 px-1 py-0.2 rounded font-mono hidden sm:inline-block">
                    {lastSyncTime}
                  </span>
                )}
              </button>
            )}

            {/* Quick Spec Lookup */}
            <button
              type="button"
              onClick={onOpenSpecs}
              className="px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>型號對照表</span>
            </button>

            {/* Google Sheet Connection Badge & Button (Password Locked for Admin Config) */}
            <button
              type="button"
              onClick={onOpenSheetConfig}
              title="青山 Google Sheet 資料庫設定 (管理員密碼 admin)"
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
            >
              <Lock className="w-3 h-3 text-amber-400 shrink-0" />
              <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">資料庫設定</span>
              <span className="sm:hidden">資料庫</span>
            </button>

            {/* Reset Button (Password Locked) */}
            <button
              type="button"
              onClick={onResetData}
              title="重新歸零 (需要管理員密碼 admin)"
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-medium shrink-0 cursor-pointer"
            >
              <Lock className="w-3 h-3 text-rose-400 shrink-0" />
              <RefreshCw className="w-3.5 h-3.5 text-rose-300 shrink-0" />
              <span className="hidden sm:inline">重新歸零</span>
              <span className="sm:hidden">歸零</span>
            </button>
          </div>

        </div>

        {/* Primary Tab Navigation Row */}
        <div className="flex border-t border-slate-800 pt-1 text-xs overflow-x-auto scrollbar-none gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('classrooms')}
            className={`px-3.5 sm:px-4 py-2.5 font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'classrooms'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span>各樓層班級清點單</span>
            <span className="ml-1 px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded-full text-[10px] whitespace-nowrap shrink-0">
              {reportedCount}/{totalClassrooms} 已填報
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('coordinator')}
            className={`px-3.5 sm:px-4 py-2.5 font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'coordinator'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpDown className="w-4 h-4 shrink-0 text-amber-400" />
            <span>跨班桌椅調配與派工</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('exporter')}
            className={`px-3.5 sm:px-4 py-2.5 font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'exporter'
                ? 'border-blue-500 text-blue-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0 text-blue-400" />
            <span>Google Doc / Sheet 格式總表匯出</span>
          </button>
        </div>
      </div>
    </header>
  );
};
