import React from 'react';
import { Classroom } from '../types';
import { calculateInventoryStatus, DESK_SPECS } from '../data/initialData';
import {
  Edit3,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  User,
  Users,
  CheckSquare,
  Square,
  ArrowRightLeft,
  Sparkles,
  Info
} from 'lucide-react';

interface Props {
  classroom: Classroom;
  onOpenReport: (classroom: Classroom) => void;
  onToggleCompleted: (classId: string) => void;
  onOpenCoordinate?: (classroom: Classroom) => void;
  onOpenDetail?: (classroom: Classroom) => void;
}

export const ClassCard: React.FC<Props> = ({
  classroom,
  onOpenReport,
  onToggleCompleted,
  onOpenCoordinate,
  onOpenDetail
}) => {
  const status = calculateInventoryStatus(classroom);

  // Helper to find color swatch for desk model
  const getDeskColor = (model: string) => {
    const spec = DESK_SPECS.find(s => s.model === model);
    return spec ? spec.hexColor : '#CBD5E1';
  };

  const hasExchangeNeed = Boolean(classroom.exchangeNeed?.hasNeed);

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden relative ${
        classroom.isCompleted
          ? 'border-emerald-300 ring-1 ring-emerald-200/60 bg-emerald-50/20'
          : hasExchangeNeed
          ? 'border-amber-300 ring-1 ring-amber-200 bg-amber-50/10'
          : classroom.reported
          ? 'border-slate-200 hover:border-indigo-300'
          : 'border-amber-200 bg-amber-50/20'
      }`}
    >
      {/* Top Banner & Header */}
      <div>
        <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-2 bg-gradient-to-r from-slate-50 to-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-slate-900 text-white rounded-md font-mono text-xs font-bold">
                {classroom.floor}
              </span>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                {classroom.name}
                {classroom.titleExtra && (
                  <span className="text-xs font-normal text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                    {classroom.titleExtra}
                  </span>
                )}
              </h3>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1 text-slate-700 font-medium">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {classroom.teacher}
              </span>
              <span className="flex items-center gap-1 font-mono text-slate-600">
                <PhoneCall className="w-3 h-3 text-slate-400" />
                分機 {classroom.extension}
              </span>
            </div>
          </div>

          {/* Student Count Badge */}
          <div className="bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1 text-center shrink-0">
            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
              <Users className="w-3 h-3 text-slate-400" />
              學生人數
            </div>
            <div className="text-sm font-extrabold text-slate-800 font-mono">
              {classroom.studentCount} 人
            </div>
          </div>
        </div>

        {/* Status Tags Section */}
        <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100 flex flex-wrap gap-1.5 items-center">
          
          {/* Exchange Need Badge (🏷️ 有調配需求) */}
          {hasExchangeNeed && (
            <span
              onClick={() => onOpenDetail && onOpenDetail(classroom)}
              className="px-2.5 py-1 text-xs font-extrabold bg-amber-600 hover:bg-amber-700 text-white rounded-lg flex items-center gap-1 shadow-2xs cursor-pointer border border-amber-700 transition-colors"
              title="點擊點開細節查看老師填寫的換型號需求"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-200 shrink-0" />
              🏷️ 有調配需求 (需換型號)
            </span>
          )}

          {/* Reported Status Tag */}
          {!classroom.reported ? (
            <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded-lg flex items-center gap-1 border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              尚未填報
            </span>
          ) : (
            <span className="px-2.5 py-1 text-xs font-semibold bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
              已回報
            </span>
          )}

          {/* Completion Tag */}
          {classroom.isCompleted && (
            <span className="px-2.5 py-1 text-xs font-bold bg-emerald-600 text-white rounded-lg flex items-center gap-1 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              搬運調配已完成
            </span>
          )}

          {/* Desk Requirement Tag */}
          {classroom.reported && (
            status.deskDifference === 0 ? (
              <span className="px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200">
                桌子數量正確
              </span>
            ) : status.deskDifference < 0 ? (
              <span className="px-2.5 py-1 text-xs font-bold bg-rose-100 text-rose-800 rounded-lg border border-rose-200 animate-pulse-subtle">
                {status.deskTag}
              </span>
            ) : (
              <span className="px-2.5 py-1 text-xs font-bold bg-blue-100 text-blue-800 rounded-lg border border-blue-200">
                {status.deskTag}
              </span>
            )
          )}

          {/* Chair Requirement Tag */}
          {classroom.reported && (
            status.chairDifference === 0 ? (
              <span className="px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200">
                椅子數量正確
              </span>
            ) : status.chairDifference < 0 ? (
              <span className="px-2.5 py-1 text-xs font-bold bg-rose-100 text-rose-800 rounded-lg border border-rose-200 animate-pulse-subtle">
                {status.chairTag}
              </span>
            ) : (
              <span className="px-2.5 py-1 text-xs font-bold bg-blue-100 text-blue-800 rounded-lg border border-blue-200">
                {status.chairTag}
              </span>
            )
          )}

        </div>

        {/* Detailed Inventory Breakdown */}
        <div className="p-4 space-y-3 text-xs">
          
          {/* Model Surplus / Deficit Highlight Box */}
          {classroom.reported && (status.deskDifference !== 0 || status.chairDifference !== 0) && (
            <div className="p-2.5 bg-indigo-50/80 border border-indigo-200/80 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-900 text-[11px]">
                <span className="flex items-center gap-1 text-indigo-900">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  型號多缺狀態 (多/少明細)
                </span>
                <span className="text-[10px] text-slate-500 font-mono font-normal">
                  需求各 {classroom.studentCount} 張
                </span>
              </div>

              {/* Desk Surplus/Deficit summary */}
              <div className="flex flex-wrap items-center gap-1 text-[11px]">
                <span className="font-semibold text-slate-700">🪑 桌子：</span>
                {status.deskDifference === 0 ? (
                  <span className="text-emerald-700 font-medium">數量符合</span>
                ) : status.deskDifference > 0 ? (
                  <span className="inline-flex flex-wrap items-center gap-1">
                    {status.deskModelBreakdown
                      ?.filter(b => b.surplus > 0)
                      .map((b, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-600 text-white rounded font-bold text-[10px] shadow-2xs">
                          <span>型號 {b.model}</span>
                          <span className="bg-white/20 px-1 rounded">有多 {b.surplus} 張</span>
                        </span>
                      ))}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-rose-600 text-white rounded font-bold text-[10px] shadow-2xs">
                    <span>缺少 {Math.abs(status.deskDifference)} 張桌子</span>
                    {classroom.deskEntries.length > 0 && (
                      <span className="text-rose-100 font-normal">
                        (現有型號 {classroom.deskEntries.map(d => d.model).join(', ')})
                      </span>
                    )}
                  </span>
                )}
              </div>

              {/* Chair Surplus/Deficit summary */}
              <div className="flex flex-wrap items-center gap-1 text-[11px]">
                <span className="font-semibold text-slate-700">𒒺 椅子：</span>
                {status.chairDifference === 0 ? (
                  <span className="text-emerald-700 font-medium">數量符合</span>
                ) : status.chairDifference > 0 ? (
                  <span className="inline-flex flex-wrap items-center gap-1">
                    {status.chairModelBreakdown
                      ?.filter(b => b.surplus > 0)
                      .map((b, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-600 text-white rounded font-bold text-[10px] shadow-2xs">
                          <span>型號 {b.model}</span>
                          <span className="bg-white/20 px-1 rounded">有多 {b.surplus} 張</span>
                        </span>
                      ))}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-rose-600 text-white rounded font-bold text-[10px] shadow-2xs">
                    <span>缺少 {Math.abs(status.chairDifference)} 張椅子</span>
                    {classroom.chairEntries.length > 0 && (
                      <span className="text-rose-100 font-normal">
                        (現有型號 {classroom.chairEntries.map(c => c.model).join(', ')})
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Desk inventory */}
          <div>
            <div className="text-slate-500 font-semibold mb-1 flex justify-between items-center">
              <span>🪑 桌子總計：<strong className="text-slate-900 font-mono">{status.totalDesks} 張</strong> (需求 {classroom.studentCount} 張)</span>
              {status.deskDifference < 0 && (
                <span className="text-rose-600 font-bold text-[11px] bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                  缺 {Math.abs(status.deskDifference)} 張
                </span>
              )}
              {status.deskDifference > 0 && (
                <span className="text-blue-700 font-bold text-[11px] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  多 {status.deskDifference} 張
                </span>
              )}
            </div>
            {classroom.deskEntries.length === 0 ? (
              <p className="text-slate-400 italic text-[11px]">尚無桌子型號紀錄</p>
            ) : (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {classroom.deskEntries.map((d, i) => {
                  const breakdown = status.deskModelBreakdown?.find(b => b.model === d.model);
                  const surplusCount = breakdown ? breakdown.surplus : 0;
                  return (
                    <span
                      key={i}
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-slate-800 font-medium border ${
                        surplusCount > 0
                          ? 'bg-blue-50/90 border-blue-200 text-blue-950'
                          : 'bg-slate-100 border-slate-200'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-slate-400 shrink-0"
                        style={{ backgroundColor: getDeskColor(d.model) }}
                      />
                      <span className="font-mono">{d.model}</span>
                      <span className="font-bold text-indigo-700">x{d.quantity}</span>
                      {surplusCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded shadow-2xs">
                          有多 {surplusCount} 張
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chair inventory */}
          <div>
            <div className="text-slate-500 font-semibold mb-1 flex justify-between items-center">
              <span>💺 椅子總計：<strong className="text-slate-900 font-mono">{status.totalChairs} 張</strong> (需求 {classroom.studentCount} 張)</span>
              {status.chairDifference < 0 && (
                <span className="text-rose-600 font-bold text-[11px] bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                  缺 {Math.abs(status.chairDifference)} 張
                </span>
              )}
              {status.chairDifference > 0 && (
                <span className="text-blue-700 font-bold text-[11px] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  多 {status.chairDifference} 張
                </span>
              )}
            </div>
            {classroom.chairEntries.length === 0 ? (
              <p className="text-slate-400 italic text-[11px]">尚無椅子型號紀錄</p>
            ) : (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {classroom.chairEntries.map((c, i) => {
                  const breakdown = status.chairModelBreakdown?.find(b => b.model === c.model);
                  const surplusCount = breakdown ? breakdown.surplus : 0;
                  return (
                    <span
                      key={i}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-slate-800 font-medium border ${
                        surplusCount > 0
                          ? 'bg-blue-50/90 border-blue-200 text-blue-950'
                          : 'bg-slate-100 border-slate-200'
                      }`}
                    >
                      <span className="font-mono text-slate-700">{c.model}</span>
                      <span className="font-bold text-indigo-700">x{c.quantity}</span>
                      {surplusCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded shadow-2xs">
                          有多 {surplusCount} 張
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Teacher Note */}
          {classroom.note && (
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-[11px] leading-relaxed">
              <span className="font-bold text-slate-700">導師備註：</span>{classroom.note}
            </div>
          )}

        </div>
      </div>

      {/* Card Action Buttons Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
        
        {/* Toggle IsCompleted */}
        <button
          onClick={() => onToggleCompleted(classroom.id)}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 border ${
            classroom.isCompleted
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
              : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
          }`}
          title="標記該班級桌椅是否已調整完成"
        >
          {classroom.isCompleted ? (
            <>
              <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>已完成</span>
            </>
          ) : (
            <>
              <Square className="w-3.5 h-3.5 text-slate-400" />
              <span>標記完成</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-1.5">
          {/* Detail Button */}
          {onOpenDetail && (
            <button
              onClick={() => onOpenDetail(classroom)}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 border border-slate-300"
              title="點開檢視詳細清點資料與導師填寫的換型號需求"
            >
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span>細節</span>
            </button>
          )}

          {/* Match / Transfer Button if there is shortage or surplus */}
          {onOpenCoordinate && (status.deskDifference !== 0 || status.chairDifference !== 0) && (
            <button
              onClick={() => onOpenCoordinate(classroom)}
              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1 shadow-2xs"
              title="媒合協助搬運多餘或撥補缺少的桌椅"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>調配</span>
            </button>
          )}

          {/* Edit / Report Button */}
          <button
            onClick={() => onOpenReport(classroom)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{classroom.reported ? '修改回報' : '回報桌椅'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
