import React from 'react';
import { DESK_SPECS, CHAIR_SPECS } from '../data/initialData';
import { X, ExternalLink, Info, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen?: boolean;
  onClose: () => void;
}

export const SpecReferenceModal: React.FC<Props> = ({ isOpen = true, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-400/30">
              <Info className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">國小部班級桌椅型號對照規範表</h2>
              <p className="text-xs text-indigo-200 mt-0.5">根據桌椅柱體顏色、型號編號與身高範疇對照清單</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800">
          
          {/* Visual Reference Banner */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <p className="font-semibold mb-1">對照說明與注意事項：</p>
              <ul className="list-disc list-inside space-y-1 text-xs text-amber-800">
                <li>桌子型號可直接查看桌腳側邊圓柱之貼紙顏色與號碼（如：#125 淡藍色）。</li>
                <li>椅子型號通常以號碼區間組合標示（如：#110-#120 適用低年級，#125-#135 適用中低年級）。</li>
                <li>標記為 <span className="text-rose-600 font-bold">#110 乳黃色</span> 之型號已停產，建議換發新式型號。</li>
              </ul>
            </div>
          </div>

          {/* Table Comparison */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="bg-slate-100 px-4 py-3 font-bold text-slate-800 text-sm border-b border-slate-200 flex justify-between items-center">
              <span>完整桌椅型號詳細規格表</span>
              <span className="text-xs text-slate-500 font-normal">共 15 種桌子型號 / 5 種椅子級距</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                    <th className="py-2.5 px-3">圓柱顏色</th>
                    <th className="py-2.5 px-3">桌子型號</th>
                    <th className="py-2.5 px-3">椅子型號區間</th>
                    <th className="py-2.5 px-3">適高範圍(cm)</th>
                    <th className="py-2.5 px-3">延伸範圍(cm)</th>
                    <th className="py-2.5 px-3">適用年級/階段</th>
                    <th className="py-2.5 px-3">狀態</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {DESK_SPECS.map((spec) => {
                    // Match corresponding chair spec range
                    let chairText = '#110-#120';
                    if (['#125', '#130', '#135'].includes(spec.model)) chairText = '#125-#135';
                    if (['#140', '#145', '#150'].includes(spec.model)) chairText = '#140-#150';
                    if (['#155', '#160', '#165'].includes(spec.model)) chairText = '#155-#165';
                    if (['#170', '#175', '#180'].includes(spec.model)) chairText = '#170-#180';

                    return (
                      <tr key={spec.model} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-4 h-4 rounded-full border border-slate-300 inline-block shrink-0 shadow-2xs"
                              style={{ backgroundColor: spec.hexColor }}
                            />
                            <span className="font-medium text-slate-700">{spec.colorName}</span>
                          </div>
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">{spec.model}</td>
                        <td className="py-2 px-3 font-mono text-indigo-700 font-semibold">{chairText}</td>
                        <td className="py-2 px-3 font-mono text-slate-600">{spec.heightRange}</td>
                        <td className="py-2 px-3 font-mono text-slate-500">{spec.extRange}</td>
                        <td className="py-2 px-3 font-medium text-slate-700">{spec.gradeRange}</td>
                        <td className="py-2 px-3">
                          {spec.isDiscontinued ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 rounded-md">
                              已停產
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-700 rounded-md inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> 現行使用
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chair Specs Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl">
              <h4 className="font-bold text-indigo-900 text-sm mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                椅子級距適用說明
              </h4>
              <div className="space-y-1.5 text-xs text-indigo-950">
                {CHAIR_SPECS.map((cs) => (
                  <div key={cs.model} className="flex justify-between border-b border-indigo-100/60 pb-1">
                    <span className="font-mono font-semibold">{cs.model}</span>
                    <span className="text-indigo-700">{cs.gradeRange} ({cs.heightRange}cm)</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-600" />
                總務處溫馨叮嚀
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                若清點過程中發現桌椅腳柱調高螺絲鬆脫或晃動，請於填報時備註欄說明，總務處將派員協助修繕調整。若有多餘桌椅請點選「標記可供搬運」，方便其他班級迅速協調撥補。
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
          <span className="text-xs text-slate-500">新北市立青山國民中小學 總務處關心您</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors shadow-xs"
          >
            關閉視窗
          </button>
        </div>
      </div>
    </div>
  );
};
