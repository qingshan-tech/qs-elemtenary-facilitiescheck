import React from 'react';
import { 
  User, 
  Users, 
  CheckCircle2, 
  Clock, 
  Edit3, 
  Sparkles,
  Info,
  Layers
} from 'lucide-react';
import { ClassRoom } from '../types';
import { getClassInventorySummary, getDeskColorHex } from '../utils/inventory';
import { DESK_SPECS } from '../data/deskChart';

interface ClassCardProps {
  classRoom: ClassRoom;
  onEditReport: (classRoom: ClassRoom) => void;
  onOpenDeskSpec: () => void;
  isSameFloorHighlighted?: boolean;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  classRoom,
  onEditReport,
  onOpenDeskSpec,
  isSameFloorHighlighted = false,
}) => {
  const summary = getClassInventorySummary(classRoom);

  // Status Badge Colors & Text (High Density Style)
  const getStatusBadge = () => {
    switch (classRoom.status) {
      case '已完成':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-tight">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            已完成
          </span>
        );
      case '已填報待處理':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-tight">
            <Clock className="w-3 h-3 text-blue-600" />
            待處理
          </span>
        );
      case '搬運協調中':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-tight">
            <Sparkles className="w-3 h-3 text-amber-600" />
            協調中
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-tight">
            未填報
          </span>
        );
    }
  };

  // Tag renderer for Desk/Chair shortage or surplus
  const renderTag = (tag: { text: string; type: 'correct' | 'shortage' | 'surplus' | 'unreported' }) => {
    switch (tag.type) {
      case 'shortage':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-100 text-rose-700 border border-rose-200 font-mono">
            {tag.text}
          </span>
        );
      case 'surplus':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-800 border border-amber-300 font-mono">
            {tag.text}
          </span>
        );
      case 'correct':
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            {tag.text}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 text-slate-500 border border-slate-200">
            {tag.text}
          </span>
        );
    }
  };

  return (
    <div
      className={`bg-white rounded-lg border transition-all duration-150 flex flex-col justify-between overflow-hidden shadow-xs hover:border-slate-300 ${
        isSameFloorHighlighted
          ? 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/10'
          : summary.isComplete
          ? 'border-slate-200 hover:border-emerald-400'
          : 'border-slate-200 hover:border-blue-400'
      }`}
    >
      {/* Card Header */}
      <div className="p-3 bg-slate-50 border-b border-slate-200">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 border border-slate-300">
                {classRoom.floor}F
              </span>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                {classRoom.name}
              </h3>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5 font-medium">
              <User className="w-3 h-3 text-slate-400" />
              <span>導師：{classRoom.teacher}</span>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Required Desk & Chair Demand Summary */}
        <div className="mt-2.5 flex items-center justify-between text-xs bg-white px-2.5 py-1 rounded border border-slate-200/80">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 font-mono">
            應備需求：
            <strong className="text-slate-900 font-bold">
              {classRoom.studentsCount > 0 ? `${classRoom.studentsCount} 組` : '待確認'}
            </strong>
          </span>
          <span className="text-slate-500 text-[10px] font-mono">
            (現有 {summary.totalDesks}桌 / {summary.totalChairs}椅)
          </span>
        </div>
      </div>

      {/* Card Body: High Density Inventory Summary Grid */}
      <div className="p-3 space-y-2.5 flex-1 bg-white">
        {/* Status Tags */}
        <div className="flex flex-wrap items-center gap-1.5">
          {renderTag(summary.deskTag)}
          {renderTag(summary.chairTag)}
        </div>

        {/* Desk Section */}
        <div className="bg-slate-50/70 rounded p-2.5 border border-slate-200/70 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 border-b border-slate-200/60 pb-1">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              桌子總數：<strong className="text-slate-900 font-mono text-xs">{summary.totalDesks}</strong> 張
            </span>
            <button
              onClick={onOpenDeskSpec}
              className="text-[10px] text-emerald-700 hover:text-emerald-900 font-medium underline inline-flex items-center gap-0.5"
            >
              <Info className="w-3 h-3" />
              對照表
            </button>
          </div>

          {classRoom.desks.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {classRoom.desks.map((d, idx) => {
                const colorHex = getDeskColorHex(d.model);
                const spec = DESK_SPECS.find((s) => s.model === d.model);
                return (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] bg-white text-slate-800 border border-slate-200 font-mono"
                  >
                    <span
                      className="w-2 h-2 rounded-full border border-slate-300"
                      style={{ backgroundColor: colorHex }}
                    ></span>
                    <span className="font-bold">{d.model}</span>
                    <span className="text-slate-400 text-[10px]">({spec?.colorName || ''})</span>
                    <span className="bg-slate-100 text-slate-800 text-[10px] px-1 rounded font-bold">
                      {d.quantity}
                    </span>
                  </span>
                );
              })}
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 italic">尚未清點桌子型號</div>
          )}
        </div>

        {/* Chair Section */}
        <div className="bg-slate-50/70 rounded p-2.5 border border-slate-200/70 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 border-b border-slate-200/60 pb-1">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
              椅子總數：<strong className="text-slate-900 font-mono text-xs">{summary.totalChairs}</strong> 張
            </span>
          </div>

          {classRoom.chairs.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {classRoom.chairs.map((ch, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] bg-white text-slate-800 border border-slate-200 font-mono"
                >
                  <span className="font-bold text-amber-900">{ch.model}</span>
                  <span className="bg-amber-50 text-amber-900 text-[10px] px-1 rounded font-bold border border-amber-200/50">
                    {ch.quantity}
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 italic">尚未清點椅子型號</div>
          )}
        </div>

        {/* Notes */}
        {classRoom.notes && (
          <div className="text-[11px] text-slate-600 bg-amber-50/60 border border-amber-200/60 p-1.5 rounded italic">
            💬 {classRoom.notes}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-mono">
          {classRoom.updatedAt ? `更新: ${classRoom.updatedAt}` : '未填報'}
        </span>

        <button
          onClick={() => onEditReport(classRoom)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition"
        >
          <Edit3 className="w-3 h-3 text-emerald-400" />
          <span>回報清點數量</span>
        </button>
      </div>
    </div>
  );
};

