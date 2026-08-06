import React from 'react';
import { 
  X, 
  ArrowRightLeft, 
  Sparkles, 
  Building2, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Layers,
  Check
} from 'lucide-react';
import { ClassRoom, TransferMatch } from '../types';
import { findMatchingTransfers } from '../utils/inventory';

interface SurplusMatchmakerProps {
  classes: ClassRoom[];
  onCompleteTransfer: (fromClassId: string, toClassId: string, itemType: 'desk' | 'chair', quantity: number) => void;
  onClose: () => void;
}

export const SurplusMatchmaker: React.FC<SurplusMatchmakerProps> = ({
  classes,
  onCompleteTransfer,
  onClose,
}) => {
  const matches = findMatchingTransfers(classes);
  const sameFloorMatches = matches.filter((m) => m.isSameFloor);
  const crossFloorMatches = matches.filter((m) => !m.isSameFloor);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-indigo-950 text-white p-5 flex items-center justify-between border-b border-indigo-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">班級多餘桌椅調撥與搬運協調專區</h2>
                <span className="text-xs bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-700">
                  同樓層優先
                </span>
              </div>
              <p className="text-xs text-indigo-300">系統自動比對多餘桌椅與缺額班級，方便導師協調搬運</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-indigo-300 hover:text-white rounded-lg hover:bg-indigo-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {matches.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">目前尚無需要調撥的桌椅配對</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                所有班級之桌椅數量目前均已滿足需求，或尚未填報多餘桌椅。若有班級回報需求將會自動顯示於此。
              </p>
            </div>
          ) : (
            <>
              {/* Same Floor Section (Top Priority) */}
              {sameFloorMatches.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                      同樓層搬運推薦 (距離近、免搬樓梯)
                    </h3>
                    <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">
                      {sameFloorMatches.length} 組可即時調撥
                    </span>
                  </div>

                  <div className="space-y-3">
                    {sameFloorMatches.map((m) => (
                      <div
                        key={m.id}
                        className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:bg-amber-50"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {/* Source Surplus Class */}
                          <div className="bg-white p-3 rounded-xl border border-slate-200 text-center min-w-[100px]">
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded block mb-1">
                              多餘提供
                            </span>
                            <div className="font-bold text-slate-900 text-sm">{m.fromClassName}</div>
                            <div className="text-[11px] text-slate-500">{m.fromFloor} 樓</div>
                          </div>

                          <ArrowRight className="w-5 h-5 text-amber-600 shrink-0" />

                          {/* Needed Target Class */}
                          <div className="bg-white p-3 rounded-xl border border-slate-200 text-center min-w-[100px]">
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded block mb-1">
                              需求接收
                            </span>
                            <div className="font-bold text-slate-900 text-sm">{m.toClassName}</div>
                            <div className="text-[11px] text-slate-500">{m.toFloor} 樓</div>
                          </div>

                          {/* Match Details */}
                          <div className="ml-2">
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              <span>
                                支援 {m.itemType === 'desk' ? '桌子' : '椅子'}型號 {m.model}
                              </span>
                              <span className="bg-indigo-600 text-white font-extrabold text-xs px-2 py-0.5 rounded-md">
                                {m.quantity} 張
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              📍 均在 <strong className="text-slate-800">{m.fromFloor}樓</strong>，導師可直接協調搬運
                            </div>
                          </div>
                        </div>

                        {/* Complete Button */}
                        <button
                          onClick={() =>
                            onCompleteTransfer(m.fromClassId, m.toClassId, m.itemType, m.quantity)
                          }
                          className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                        >
                          <Check className="w-4 h-4" />
                          確認完成搬運調撥 [已完成]
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cross Floor Section */}
              {crossFloorMatches.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-600" />
                      跨樓層調撥建議 (需跨樓層搬運)
                    </h3>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">
                      {crossFloorMatches.length} 組
                    </span>
                  </div>

                  <div className="space-y-3">
                    {crossFloorMatches.map((m) => (
                      <div
                        key={m.id}
                        className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:bg-slate-100/80"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="bg-white p-3 rounded-xl border border-slate-200 text-center min-w-[100px]">
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded block mb-1">
                              多餘提供
                            </span>
                            <div className="font-bold text-slate-900 text-sm">{m.fromClassName}</div>
                            <div className="text-[11px] text-slate-500">{m.fromFloor} 樓</div>
                          </div>

                          <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />

                          <div className="bg-white p-3 rounded-xl border border-slate-200 text-center min-w-[100px]">
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded block mb-1">
                              需求接收
                            </span>
                            <div className="font-bold text-slate-900 text-sm">{m.toClassName}</div>
                            <div className="text-[11px] text-slate-500">{m.toFloor} 樓</div>
                          </div>

                          <div className="ml-2">
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              <span>
                                支援 {m.itemType === 'desk' ? '桌子' : '椅子'}型號 {m.model}
                              </span>
                              <span className="bg-slate-700 text-white font-bold text-xs px-2 py-0.5 rounded-md">
                                {m.quantity} 張
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              由 {m.fromFloor}樓 搬運至 {m.toFloor}樓 (相差 {Math.abs(m.fromFloor - m.toFloor)} 層樓)
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            onCompleteTransfer(m.fromClassId, m.toClassId, m.itemType, m.quantity)
                          }
                          className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition"
                        >
                          <Check className="w-4 h-4" />
                          確認完成搬運調撥 [已完成]
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition"
          >
            返回前台班級清單
          </button>
        </div>
      </div>
    </div>
  );
};
