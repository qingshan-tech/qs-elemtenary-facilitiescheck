import React from 'react';
import { Classroom } from '../types';
import { calculateInventoryStatus, DESK_SPECS } from '../data/initialData';
import {
  X,
  User,
  PhoneCall,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRightLeft,
  FileText,
  Clock
} from 'lucide-react';

interface Props {
  classroom: Classroom | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenReport?: (classroom: Classroom) => void;
  onOpenCoordinate?: (classroom: Classroom) => void;
}

export const ClassDetailModal: React.FC<Props> = ({
  classroom,
  isOpen,
  onClose,
  onOpenReport,
  onOpenCoordinate
}) => {
  if (!isOpen || !classroom) return null;

  const status = calculateInventoryStatus(classroom);

  // Helper to find color swatch for desk model
  const getDeskColor = (model: string) => {
    const spec = DESK_SPECS.find(s => s.model === model);
    return spec ? spec.hexColor : '#CBD5E1';
  };

  const hasExchangeNeed = Boolean(classroom.exchangeNeed?.hasNeed);
  const ex = classroom.exchangeNeed;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex justify-between items-center shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-indigo-500 text-white font-mono text-xs font-bold rounded">
                {classroom.floor}
              </span>
              <h2 className="text-xl font-bold flex items-center gap-2">
                {classroom.name} 詳細桌椅盤點明細
              </h2>
            </div>
            <p className="text-xs text-indigo-200 mt-1 flex items-center gap-3">
              <span>導師：{classroom.teacher} 老師</span>
              <span>分機：{classroom.extension}</span>
              {classroom.lastUpdated && (
                <span className="flex items-center gap-1 font-mono text-[11px] text-slate-300">
                  <Clock className="w-3 h-3" />
                  填報時間：{classroom.lastUpdated}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-xs">
          
          {/* Top Status Badges */}
          <div className="flex flex-wrap gap-2 items-center">
            {classroom.reported ? (
              <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-lg flex items-center gap-1 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                已填報清點
              </span>
            ) : (
              <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded-lg flex items-center gap-1 border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                尚未填報
              </span>
            )}

            {hasExchangeNeed && (
              <span className="px-2.5 py-1 text-xs font-bold bg-amber-600 text-white rounded-lg flex items-center gap-1 shadow-2xs">
                <ArrowRightLeft className="w-3.5 h-3.5" />
                🏷️ 有調配需求 (需換型號)
              </span>
            )}

            {classroom.isCompleted && (
              <span className="px-2.5 py-1 text-xs font-bold bg-emerald-600 text-white rounded-lg flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                搬運補齊已完成
              </span>
            )}
          </div>

          {/* Special Highlight: Exchange / Adjustment Need Details */}
          {hasExchangeNeed ? (
            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-amber-500 text-white rounded-lg font-bold">🏷️</span>
                  <div>
                    <h3 className="font-extrabold text-amber-950 text-sm">導師登記：換型號 / 特殊調配需求</h3>
                    <p className="text-[11px] text-amber-800">此需求為導師指定欲換之桌椅型號與數量</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-bold text-[10px]">
                  待總務處撥補
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Desk Exchange Need */}
                <div className="p-3 bg-white/90 border border-amber-200 rounded-xl space-y-1">
                  <div className="text-amber-900 font-bold text-xs flex items-center gap-1">
                    <span>🪑 桌子更換需求：</span>
                    {ex?.deskExchangeNeeded ? (
                      <span className="text-amber-700 font-semibold">有更換需求</span>
                    ) : (
                      <span className="text-slate-400 font-normal">不需要更換</span>
                    )}
                  </div>
                  {ex?.deskExchangeNeeded && (
                    <div className="text-slate-800 font-medium pl-2 pt-1">
                      希望能更換成：<strong className="text-indigo-700 font-mono text-sm">型號 {ex.targetDeskModel}</strong>
                      <span className="ml-2 font-bold text-slate-900 bg-amber-100 px-1.5 py-0.5 rounded">
                        x {ex.targetDeskQuantity} 張
                      </span>
                    </div>
                  )}
                </div>

                {/* Chair Exchange Need */}
                <div className="p-3 bg-white/90 border border-amber-200 rounded-xl space-y-1">
                  <div className="text-amber-900 font-bold text-xs flex items-center gap-1">
                    <span>𒒺 椅子更換需求：</span>
                    {ex?.chairExchangeNeeded ? (
                      <span className="text-amber-700 font-semibold">有更換需求</span>
                    ) : (
                      <span className="text-slate-400 font-normal">不需要更換</span>
                    )}
                  </div>
                  {ex?.chairExchangeNeeded && (
                    <div className="text-slate-800 font-medium pl-2 pt-1">
                      希望能更換成：<strong className="text-indigo-700 font-mono text-sm">型號 {ex.targetChairModel}</strong>
                      <span className="ml-2 font-bold text-slate-900 bg-amber-100 px-1.5 py-0.5 rounded">
                        x {ex.targetChairQuantity} 張
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Reason / Note */}
              {ex?.reason && (
                <div className="p-2.5 bg-white/80 border border-amber-200 rounded-xl text-slate-700 text-xs">
                  <strong className="text-amber-950 font-bold">調配說明原因：</strong>
                  <span>{ex.reason}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-900 font-medium text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>該班級目前無「換型號」特殊調配需求 (現有桌椅型號皆正確)。</span>
            </div>
          )}

          {/* Student Count & Total Overview */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-3 gap-3 text-center">
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <div className="text-slate-500 font-semibold text-[11px]">學生人數</div>
              <div className="text-base font-extrabold text-slate-900 font-mono">{classroom.studentCount} 人</div>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <div className="text-slate-500 font-semibold text-[11px]">桌子總數 / 差額</div>
              <div className="text-base font-extrabold font-mono flex items-center justify-center gap-1">
                <span>{status.totalDesks} 張</span>
                <span className={`text-xs ${status.deskDifference === 0 ? 'text-emerald-600' : status.deskDifference < 0 ? 'text-rose-600' : 'text-blue-600'}`}>
                  ({status.deskDifference > 0 ? `+${status.deskDifference}` : status.deskDifference})
                </span>
              </div>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <div className="text-slate-500 font-semibold text-[11px]">椅子總數 / 差額</div>
              <div className="text-base font-extrabold font-mono flex items-center justify-center gap-1">
                <span>{status.totalChairs} 張</span>
                <span className={`text-xs ${status.chairDifference === 0 ? 'text-emerald-600' : status.chairDifference < 0 ? 'text-rose-600' : 'text-blue-600'}`}>
                  ({status.chairDifference > 0 ? `+${status.chairDifference}` : status.chairDifference})
                </span>
              </div>
            </div>
          </div>

          {/* Inventory Breakdown List */}
          <div className="space-y-3 border-t border-slate-200 pt-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              現有桌椅型號詳細紀錄
            </h4>

            {/* Desk list */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="font-bold text-slate-700 flex justify-between">
                <span>🪑 桌子型號現況</span>
                <span className="font-mono text-indigo-700">共 {status.totalDesks} 張</span>
              </div>
              {classroom.deskEntries.length === 0 ? (
                <p className="text-slate-400 italic">無紀錄</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {classroom.deskEntries.map((d, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-medium text-slate-800">
                      <span className="w-2.5 h-2.5 rounded-full border border-slate-400 shrink-0" style={{ backgroundColor: getDeskColor(d.model) }} />
                      <span className="font-mono font-bold">{d.model}</span>
                      <span className="text-indigo-700 font-extrabold">x{d.quantity}張</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Chair list */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="font-bold text-slate-700 flex justify-between">
                <span>𒒺 椅子型號現況</span>
                <span className="font-mono text-indigo-700">共 {status.totalChairs} 張</span>
              </div>
              {classroom.chairEntries.length === 0 ? (
                <p className="text-slate-400 italic">無紀錄</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {classroom.chairEntries.map((c, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-medium text-slate-800">
                      <span className="font-mono font-bold text-slate-700">{c.model}</span>
                      <span className="text-indigo-700 font-extrabold">x{c.quantity}張</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Teacher Note */}
          {classroom.note && (
            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-slate-800 space-y-1">
              <div className="font-bold text-amber-950">📝 導師填報備註：</div>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{classroom.note}</p>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors"
          >
            關閉
          </button>

          <div className="flex items-center gap-2">
            {onOpenCoordinate && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCoordinate(classroom);
                }}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>進入跨班調配中心</span>
              </button>
            )}

            {onOpenReport && (
              <button
                onClick={() => {
                  onClose();
                  onOpenReport(classroom);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>修改填報資料</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
