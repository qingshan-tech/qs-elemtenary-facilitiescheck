import React from 'react';
import { Layers, Search, Filter, Sparkles } from 'lucide-react';

interface FloorFilterProps {
  selectedFloor: number | 'all'; // 1-5 or 'all'
  onSelectFloor: (floor: number | 'all') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  sameFloorMode: boolean;
  onToggleSameFloorMode: () => void;
}

export const FloorFilter: React.FC<FloorFilterProps> = ({
  selectedFloor,
  onSelectFloor,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sameFloorMode,
  onToggleSameFloorMode,
}) => {
  const floors = [
    { label: '全部樓層', value: 'all' },
    { label: '1樓 (1年級/特教)', value: 1 },
    { label: '2樓 (1-2年級/資源)', value: 2 },
    { label: '3樓 (3-4年級)', value: 3 },
    { label: '4樓 (4-5年級)', value: 4 },
    { label: '5樓 (5-6年級)', value: 5 },
  ];

  return (
    <div className="bg-white rounded-lg p-3 shadow-xs border border-slate-200 mb-4 space-y-3">
      {/* Floor tabs bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>樓層:</span>
          </div>

          {floors.map((f) => {
            const isSelected = selectedFloor === f.value;
            return (
              <button
                key={String(f.value)}
                onClick={() => onSelectFloor(f.value as number | 'all')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all whitespace-nowrap shrink-0 border ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Same Floor Highlight Toggle */}
        <button
          onClick={onToggleSameFloorMode}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition border shrink-0 ${
            sameFloorMode
              ? 'bg-amber-50 text-amber-800 border-amber-300'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Sparkles className={`w-3.5 h-3.5 ${sameFloorMode ? 'text-amber-600 fill-amber-500' : 'text-slate-400'}`} />
          <span>同樓層優先 View</span>
        </button>
      </div>

      {/* Sub-filters and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2.5 border-t border-slate-100">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜尋班級 (例: 1年1班) 或 導師姓名..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition"
          />
        </div>

        {/* Status dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">狀態:</span>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition font-medium text-slate-700"
          >
            <option value="all">全部班級狀態</option>
            <option value="shortage">需要桌子/椅子 (有缺額)</option>
            <option value="surplus">有多餘桌子/椅子 (可調撥)</option>
            <option value="unreported">未填報</option>
            <option value="completed">已完成</option>
          </select>
        </div>
      </div>
    </div>
  );
};

