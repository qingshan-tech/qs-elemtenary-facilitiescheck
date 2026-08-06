import React, { useState } from 'react';
import { X, Check, Image as ImageIcon, Table, Info, ExternalLink, Sparkles } from 'lucide-react';
import { DESK_SPECS, CHAIR_SPECS } from '../data/deskChart';

interface DeskSpecModalProps {
  onClose: () => void;
}

export const DeskSpecModal: React.FC<DeskSpecModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'table' | 'image'>('table');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">國小班級桌椅型號尺寸與顏色對照圖表</h2>
              <p className="text-xs text-slate-400">青山國中小小學部桌椅規格指南 (適用各年級身高範圍)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher */}
            <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 mr-2">
              <button
                onClick={() => setActiveTab('table')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'table' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                表格對照
              </button>
              <button
                onClick={() => setActiveTab('image')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'image' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                原始對照圖檔
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {activeTab === 'table' ? (
            <div className="space-y-6">
              {/* Elementary Quick Reference Guide */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
                  <div className="text-xs text-slate-700">
                    <strong className="text-slate-900 block text-sm mb-0.5">青山國中小小學部常用建議標準：</strong>
                    低年級(1-2年): 建議 <strong>#125 ~ #130</strong> 號桌 / 中年級(3-4年): 建議 <strong>#140 ~ #145</strong> 號桌 / 高年級(5-6年): 建議 <strong>#150 ~ #155</strong> 號桌
                  </div>
                </div>
              </div>

              {/* Desk Models Table */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  桌子 12 種型號對照規格 (圓柱顏色 & 適高)
                </h3>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-900 text-slate-200 text-xs font-semibold">
                      <tr>
                        <th className="p-3">圓柱顏色</th>
                        <th className="p-3">桌子型號</th>
                        <th className="p-3">對應椅子型號</th>
                        <th className="p-3">適高範圍 (cm)</th>
                        <th className="p-3">延伸範圍 (cm)</th>
                        <th className="p-3">適用學制/年級</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {DESK_SPECS.map((spec) => (
                        <tr
                          key={spec.model}
                          className={`hover:bg-slate-50/80 transition ${spec.discontinued ? 'bg-slate-50/60 opacity-75' : ''}`}
                        >
                          <td className="p-3 font-medium">
                            <span className="inline-flex items-center gap-2">
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs shrink-0"
                                style={{ backgroundColor: spec.colorHex }}
                              ></span>
                              <span className="font-bold">{spec.colorName}</span>
                            </span>
                          </td>
                          <td className="p-3 font-bold text-slate-900">
                            {spec.model}
                            {spec.discontinued && (
                              <span className="ml-1.5 text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded">
                                已停產
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-semibold text-blue-800">{spec.chairModel}</td>
                          <td className="p-3 font-mono font-bold text-slate-900">{spec.heightRange}</td>
                          <td className="p-3 font-mono text-slate-500">{spec.extendRange}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${
                                spec.gradeLabel.includes('低年級')
                                  ? 'bg-amber-100 text-amber-800'
                                  : spec.gradeLabel.includes('中年級')
                                  ? 'bg-blue-100 text-blue-800'
                                  : spec.gradeLabel.includes('高年級')
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {spec.gradeLabel}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Chair Models Table */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                  椅子 5 個級距型號對照
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {CHAIR_SPECS.map((c) => (
                    <div
                      key={c.model}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-xs shrink-0"
                        style={{ backgroundColor: c.colorHex }}
                      >
                        椅
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{c.model}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{c.heightRange}</div>
                        <div className="text-[11px] text-blue-700 font-medium mt-1">{c.gradeLabel}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Original Image Preview */
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="bg-slate-900 text-slate-200 text-xs px-4 py-2 rounded-xl border border-slate-700 flex items-center gap-2">
                <Info className="w-4 h-4 text-sky-400" />
                此圖檔為教育部及學校採購之國小/國中桌椅顏色圓柱與型號對照標準圖。
              </div>

              <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-lg bg-slate-100 p-2 max-w-2xl w-full">
                {/* Visual Image Render matching desk_size.jpg */}
                <div className="relative rounded-xl overflow-hidden bg-white">
                  <img
                    src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='700' height='500' viewBox='0 0 700 500'><rect width='700' height='500' fill='%23f8fafc'/><text x='350' y='40' font-family='sans-serif' font-size='20' font-weight='bold' text-anchor='middle' fill='%230f172a'>學校學生課桌椅規格對照圖表 (desk_size.jpg)</text></svg>"
                    alt="桌椅型號尺寸對照圖"
                    className="w-full h-auto hidden"
                  />
                  
                  {/* High quality clean graphic replica matching desk_size.jpg attached by user */}
                  <div className="bg-white p-4 border rounded-xl font-sans text-xs">
                    <div className="text-center font-bold text-base text-slate-800 mb-3 border-b pb-2">
                      圓柱顏色 / 桌子型號 / 椅子型號 / 適高範圍對照表
                    </div>
                    <table className="w-full text-center border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800 border-b-2 border-slate-300">
                          <th className="p-2 border">圓柱顏色</th>
                          <th className="p-2 border">桌子型號</th>
                          <th className="p-2 border">椅子型號</th>
                          <th className="p-2 border">適高範圍</th>
                          <th className="p-2 border">延伸範圍</th>
                          <th className="p-2 border">適用年級</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-amber-50">
                          <td className="p-2 border font-bold text-amber-700">乳黃</td>
                          <td className="p-2 border font-bold text-rose-700">#110 (已停產)</td>
                          <td className="p-2 border" rowSpan={3}>#110-#120</td>
                          <td className="p-2 border">106 ~ 113</td>
                          <td className="p-2 border">103 ~ 118</td>
                          <td className="p-2 border text-slate-500" rowSpan={6}>國小低年級</td>
                        </tr>
                        <tr>
                          <td className="p-2 border font-bold text-amber-800">土黃</td>
                          <td className="p-2 border font-bold">#115</td>
                          <td className="p-2 border">111 ~ 118</td>
                          <td className="p-2 border">108 ~ 123</td>
                        </tr>
                        <tr>
                          <td className="p-2 border font-bold text-amber-900">茶色</td>
                          <td className="p-2 border font-bold">#120</td>
                          <td className="p-2 border">116 ~ 123</td>
                          <td className="p-2 border">113 ~ 128</td>
                        </tr>
                        <tr className="bg-sky-50">
                          <td className="p-2 border font-bold text-sky-600">淡藍</td>
                          <td className="p-2 border font-bold">#125</td>
                          <td className="p-2 border" rowSpan={3}>#125-#135</td>
                          <td className="p-2 border">121 ~ 133</td>
                          <td className="p-2 border">118 ~ 138</td>
                        </tr>
                        <tr className="bg-blue-50">
                          <td className="p-2 border font-bold text-blue-600">藍色</td>
                          <td className="p-2 border font-bold">#130</td>
                          <td className="p-2 border">126 ~ 138</td>
                          <td className="p-2 border">123 ~ 143</td>
                        </tr>
                        <tr className="bg-blue-100">
                          <td className="p-2 border font-bold text-blue-900">深藍</td>
                          <td className="p-2 border font-bold">#135</td>
                          <td className="p-2 border">131 ~ 143</td>
                          <td className="p-2 border">128 ~ 148</td>
                        </tr>
                        <tr className="bg-rose-50">
                          <td className="p-2 border font-bold text-rose-600">紅色</td>
                          <td className="p-2 border font-bold">#140</td>
                          <td className="p-2 border" rowSpan={3}>#140-#150</td>
                          <td className="p-2 border">136 ~ 148</td>
                          <td className="p-2 border">133 ~ 153</td>
                          <td className="p-2 border text-slate-600" rowSpan={3}>國小中年級</td>
                        </tr>
                        <tr className="bg-orange-50">
                          <td className="p-2 border font-bold text-orange-600">橙色</td>
                          <td className="p-2 border font-bold">#145</td>
                          <td className="p-2 border">141 ~ 153</td>
                          <td className="p-2 border">138 ~ 158</td>
                        </tr>
                        <tr className="bg-yellow-50">
                          <td className="p-2 border font-bold text-yellow-600">黃色</td>
                          <td className="p-2 border font-bold">#150</td>
                          <td className="p-2 border">146 ~ 158</td>
                          <td className="p-2 border">143 ~ 163</td>
                        </tr>
                        <tr className="bg-emerald-50">
                          <td className="p-2 border font-bold text-emerald-600">翠綠</td>
                          <td className="p-2 border font-bold">#155</td>
                          <td className="p-2 border" rowSpan={3}>#155-#165</td>
                          <td className="p-2 border">151 ~ 163</td>
                          <td className="p-2 border">148 ~ 168</td>
                          <td className="p-2 border text-slate-700" rowSpan={3}>國小高年級</td>
                        </tr>
                        <tr className="bg-green-50">
                          <td className="p-2 border font-bold text-green-700">綠色</td>
                          <td className="p-2 border font-bold">#160</td>
                          <td className="p-2 border">156 ~ 168</td>
                          <td className="p-2 border">153 ~ 173</td>
                        </tr>
                        <tr className="bg-emerald-100">
                          <td className="p-2 border font-bold text-emerald-900">墨綠</td>
                          <td className="p-2 border font-bold">#165</td>
                          <td className="p-2 border">161 ~ 173</td>
                          <td className="p-2 border">158 ~ 178</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition"
          >
            關閉對照視窗
          </button>
        </div>
      </div>
    </div>
  );
};
