import React, { useState } from 'react';
import { Classroom, TransferLog } from '../types';
import { calculateInventoryStatus } from '../data/initialData';
import {
  ArrowRightLeft,
  ArrowRight,
  CheckCircle2,
  PackagePlus,
  PackageMinus,
  Building2,
  Clock,
  Sparkles,
  Layers,
  Send
} from 'lucide-react';

interface Props {
  classrooms: Classroom[];
  onUpdateClassrooms: (updatedClasses: Classroom[]) => void;
  transferLogs: TransferLog[];
  onAddTransferLog: (log: TransferLog) => void;
  onUpdateTransferLogStatus: (id: string, status: 'pending' | 'completed') => void;
  initialSelectedClass?: Classroom | null;
}

export const SurplusCoordinator: React.FC<Props> = ({
  classrooms,
  onUpdateClassrooms,
  transferLogs,
  onAddTransferLog,
  onUpdateTransferLogStatus,
  initialSelectedClass
}) => {
  const [filterFloor, setFilterFloor] = useState<string>('ALL');
  
  // Transfer Form State
  const [sourceClassId, setSourceClassId] = useState<string>('');
  const [targetClassId, setTargetClassId] = useState<string>('');
  const [itemType, setItemType] = useState<'desk' | 'chair'>('desk');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  // Auto-set initial selected class if provided
  React.useEffect(() => {
    if (initialSelectedClass) {
      const status = calculateInventoryStatus(initialSelectedClass);
      if (status.deskDifference > 0 || status.chairDifference > 0) {
        setSourceClassId(initialSelectedClass.id);
      } else if (status.deskDifference < 0 || status.chairDifference < 0) {
        setTargetClassId(initialSelectedClass.id);
      }
    }
  }, [initialSelectedClass]);

  // Compute classrooms with surplus
  const surplusClasses = classrooms.filter(c => {
    if (!c.reported) return false;
    if (filterFloor !== 'ALL' && c.floor !== filterFloor) return false;
    const status = calculateInventoryStatus(c);
    return status.deskDifference > 0 || status.chairDifference > 0;
  });

  // Compute classrooms needing items (including shortage or model exchange needs)
  const shortageClasses = classrooms.filter(c => {
    if (!c.reported) return false;
    if (filterFloor !== 'ALL' && c.floor !== filterFloor) return false;
    const status = calculateInventoryStatus(c);
    const hasExchange = Boolean(c.exchangeNeed?.hasNeed);
    return status.deskDifference < 0 || status.chairDifference < 0 || hasExchange;
  });

  // Available models for selected source class
  const sourceClass = classrooms.find(c => c.id === sourceClassId);
  const availableModels = sourceClass
    ? (itemType === 'desk'
        ? sourceClass.deskEntries.map(d => ({ model: d.model, qty: d.quantity }))
        : sourceClass.chairEntries.map(c => ({ model: c.model, qty: c.quantity })))
    : [];

  // Submit transfer
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceClassId || !targetClassId || !selectedModel || quantity <= 0) return;

    const source = classrooms.find(c => c.id === sourceClassId);
    const target = classrooms.find(c => c.id === targetClassId);

    if (!source || !target) return;

    // Execute inventory deduction from source & addition to target
    const updatedClassrooms = classrooms.map(c => {
      if (c.id === sourceClassId) {
        if (itemType === 'desk') {
          const updatedDesks = c.deskEntries.map(d =>
            d.model === selectedModel ? { ...d, quantity: Math.max(0, d.quantity - quantity) } : d
          ).filter(d => d.quantity > 0);
          return { ...c, deskEntries: updatedDesks };
        } else {
          const updatedChairs = c.chairEntries.map(ch =>
            ch.model === selectedModel ? { ...ch, quantity: Math.max(0, ch.quantity - quantity) } : ch
          ).filter(ch => ch.quantity > 0);
          return { ...c, chairEntries: updatedChairs };
        }
      }

      if (c.id === targetClassId) {
        if (itemType === 'desk') {
          const existing = c.deskEntries.find(d => d.model === selectedModel);
          const updatedDesks = existing
            ? c.deskEntries.map(d => d.model === selectedModel ? { ...d, quantity: d.quantity + quantity } : d)
            : [...c.deskEntries, { model: selectedModel, quantity }];
          return { ...c, deskEntries: updatedDesks };
        } else {
          const existing = c.chairEntries.find(ch => ch.model === selectedModel);
          const updatedChairs = existing
            ? c.chairEntries.map(ch => ch.model === selectedModel ? { ...ch, quantity: ch.quantity + quantity } : ch)
            : [...c.chairEntries, { model: selectedModel, quantity }];
          return { ...c, chairEntries: updatedChairs };
        }
      }

      return c;
    });

    onUpdateClassrooms(updatedClassrooms);

    // Create log
    const nowStr = new Date().toLocaleString('zh-TW', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const newLog: TransferLog = {
      id: `tr-${Date.now()}`,
      fromClassId: source.id,
      fromClassName: source.name,
      toClassId: target.id,
      toClassName: target.name,
      type: itemType,
      model: selectedModel,
      quantity,
      status: 'completed',
      timestamp: nowStr
    };

    onAddTransferLog(newLog);

    // Reset quantity
    setQuantity(1);
    alert(`已順利記錄將 ${source.name} 的 ${quantity} 張 ${selectedModel} ${itemType === 'desk' ? '桌子' : '椅子'} 調配至 ${target.name}！`);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ArrowRightLeft className="w-6 h-6 text-amber-200" />
              <h2 className="text-xl font-bold tracking-tight">跨班級桌椅多餘與缺口調配中心</h2>
            </div>
            <p className="text-xs text-amber-100 max-w-2xl leading-relaxed">
              即時媒合各班級「有多餘」的桌椅與「有缺口」的班級，教師可直接協調鄰近樓層教室進行快速搬運調配。
            </p>
          </div>

          {/* Floor filter */}
          <div className="flex items-center gap-2 bg-amber-950/40 p-2 rounded-xl border border-amber-500/30">
            <Layers className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="text-xs text-amber-200 font-semibold shrink-0">樓層過濾:</span>
            <select
              value={filterFloor}
              onChange={e => setFilterFloor(e.target.value)}
              className="bg-amber-900 text-white border border-amber-600 text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-hidden"
            >
              <option value="ALL">全校樓層 (1F~5F)</option>
              <option value="1F">1 樓 (101~103)</option>
              <option value="2F">2 樓 (201~203)</option>
              <option value="3F">3 樓 (301~303, 601)</option>
              <option value="4F">4 樓 (401~403, 602)</option>
              <option value="5F">5 樓 (501~503, 603)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interactive Matchmaker Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>快速登記桌椅撥補與搬運紀錄</span>
        </h3>

        <form onSubmit={handleTransferSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          
          {/* Source Classroom */}
          <div className="md:col-span-3 space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              1. 提供桌椅教室 (來源)
            </label>
            <select
              value={sourceClassId}
              onChange={e => {
                setSourceClassId(e.target.value);
                setSelectedModel('');
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            >
              <option value="">-- 請選擇提供班級 --</option>
              {classrooms.map(c => {
                const st = calculateInventoryStatus(c);
                const hasSurplus = st.deskDifference > 0 || st.chairDifference > 0;
                return (
                  <option key={c.id} value={c.id}>
                    {c.floor} - {c.name} ({c.teacher}) {hasSurplus ? '★ 有多餘' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Item Type */}
          <div className="md:col-span-2 space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              2. 種類
            </label>
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => { setItemType('desk'); setSelectedModel(''); }}
                className={`py-1 rounded-lg text-xs font-bold transition-colors ${
                  itemType === 'desk' ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🪑 桌子
              </button>
              <button
                type="button"
                onClick={() => { setItemType('chair'); setSelectedModel(''); }}
                className={`py-1 rounded-lg text-xs font-bold transition-colors ${
                  itemType === 'chair' ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                💺 椅子
              </button>
            </div>
          </div>

          {/* Model Selection */}
          <div className="md:col-span-2 space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              3. 型號
            </label>
            <select
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            >
              <option value="">-- 型號 --</option>
              {availableModels.map(m => (
                <option key={m.model} value={m.model}>
                  {m.model} (現有 {m.qty} 張)
                </option>
              ))}
            </select>
          </div>

          {/* Quantity & Target Class */}
          <div className="md:col-span-3 grid grid-cols-3 gap-2">
            <div className="col-span-1 space-y-1">
              <label className="block text-xs font-bold text-slate-700">數量</label>
              <input
                type="number"
                min={1}
                max={20}
                value={quantity}
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl text-center font-bold font-mono text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div className="col-span-2 space-y-1">
              <label className="block text-xs font-bold text-slate-700">4. 撥補接收班級</label>
              <select
                value={targetClassId}
                onChange={e => setTargetClassId(e.target.value)}
                className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="">-- 接收班級 --</option>
                {classrooms.map(c => {
                  if (c.id === sourceClassId) return null;
                  const st = calculateInventoryStatus(c);
                  const hasShortage = st.deskDifference < 0 || st.chairDifference < 0;
                  return (
                    <option key={c.id} value={c.id}>
                      {c.floor} - {c.name} {hasShortage ? '⚠️ 有缺口' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Submit Transfer Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={!sourceClassId || !targetClassId || !selectedModel}
              className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>確認搬運</span>
            </button>
          </div>

        </form>
      </div>

      {/* Two Column Grid: Surplus vs Shortage Classrooms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Surplus Classrooms Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <PackagePlus className="w-4 h-4 text-emerald-600" />
              <span>有多餘桌椅之班級 ({surplusClasses.length} 班)</span>
            </h3>
            <span className="text-xs text-slate-500">供其他班級協調領取</span>
          </div>

          {surplusClasses.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">目前無顯示有多餘桌椅的班級</p>
          ) : (
            <div className="space-y-3">
              {surplusClasses.map(c => {
                const st = calculateInventoryStatus(c);
                return (
                  <div key={c.id} className="p-3 bg-emerald-50/50 border border-emerald-200/80 rounded-xl text-xs space-y-2">
                    <div className="flex justify-between items-center font-bold text-slate-900">
                      <span>{c.floor} - {c.name} ({c.teacher} 老師 / 分機 {c.extension})</span>
                      <button
                        onClick={() => setSourceClassId(c.id)}
                        className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] transition-colors"
                      >
                        選擇此班為來源
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      {st.deskDifference > 0 && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded">
                          多桌子 {st.deskDifference} 張 ({c.deskEntries.map(d=>d.model).join(', ')})
                        </span>
                      )}
                      {st.chairDifference > 0 && (
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-bold rounded">
                          多椅子 {st.chairDifference} 張 ({c.chairEntries.map(ch=>ch.model).join(', ')})
                        </span>
                      )}
                    </div>

                    {c.note && (
                      <p className="text-slate-600 text-[11px] bg-white/80 p-1.5 rounded border border-emerald-100">
                        {c.note}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Shortage Classrooms Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <PackageMinus className="w-4 h-4 text-rose-600" />
              <span>待撥補缺口之班級 ({shortageClasses.length} 班)</span>
            </h3>
            <span className="text-xs text-slate-500">亟需補齊桌椅</span>
          </div>

          {shortageClasses.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">目前無桌椅缺少需求的班級！</p>
          ) : (
            <div className="space-y-3">
              {shortageClasses.map(c => {
                const st = calculateInventoryStatus(c);
                const ex = c.exchangeNeed;
                return (
                  <div key={c.id} className="p-3 bg-rose-50/50 border border-rose-200/80 rounded-xl text-xs space-y-2">
                    <div className="flex justify-between items-center font-bold text-slate-900">
                      <span>{c.floor} - {c.name} ({c.teacher} 老師 / 分機 {c.extension})</span>
                      <button
                        onClick={() => setTargetClassId(c.id)}
                        className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] transition-colors"
                      >
                        選擇此班為接收
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      {st.deskDifference < 0 && (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded">
                          缺桌子 {Math.abs(st.deskDifference)} 張
                        </span>
                      )}
                      {st.chairDifference < 0 && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded">
                          缺椅子 {Math.abs(st.chairDifference)} 張
                        </span>
                      )}
                      {ex?.hasNeed && (
                        <span className="px-2 py-0.5 bg-amber-600 text-white font-bold rounded">
                          🏷️ 欲換型號: {ex.deskExchangeNeeded ? `桌${ex.targetDeskModel}x${ex.targetDeskQuantity} ` : ''}{ex.chairExchangeNeeded ? `椅${ex.targetChairModel}x${ex.targetChairQuantity}` : ''}
                        </span>
                      )}
                    </div>

                    {ex?.reason && (
                      <p className="text-amber-900 font-medium text-[11px] bg-amber-100/80 p-1.5 rounded border border-amber-200">
                        <strong>調配說明：</strong>{ex.reason}
                      </p>
                    )}

                    {c.note && (
                      <p className="text-slate-600 text-[11px] bg-white/80 p-1.5 rounded border border-rose-100">
                        <strong>備註：</strong>{c.note}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Transfer History Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-600" />
          <span>跨班桌椅搬運歷史調配紀錄 ({transferLogs.length} 筆)</span>
        </h3>

        {transferLogs.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4 text-center">尚無搬運紀錄</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">時間</th>
                  <th className="py-2.5 px-3">來源班級</th>
                  <th className="py-2.5 px-3">調配項目/型號</th>
                  <th className="py-2.5 px-3">數量</th>
                  <th className="py-2.5 px-3">接收班級</th>
                  <th className="py-2.5 px-3">狀態</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transferLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">{log.timestamp}</td>
                    <td className="py-2 px-3 font-medium text-slate-800">{log.fromClassName}</td>
                    <td className="py-2 px-3 font-mono font-bold text-indigo-700">
                      {log.type === 'desk' ? '🪑 桌子' : '💺 椅子'} {log.model}
                    </td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">{log.quantity} 張</td>
                    <td className="py-2 px-3 font-medium text-slate-800">{log.toClassName}</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold text-[10px] inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        調配完成
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
