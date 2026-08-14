import React, { useState, useEffect } from 'react';
import { Classroom, DeskEntry, ChairEntry, ExchangeItem } from '../types';
import { DESK_SPECS, CHAIR_SPECS, calculateInventoryStatus } from '../data/initialData';
import {
  X,
  Plus,
  Trash2,
  HelpCircle,
  Save,
  Users,
  CheckCircle2,
  AlertCircle,
  Info,
  ArrowRightLeft
} from 'lucide-react';

interface Props {
  classroom: Classroom | null;
  isOpen?: boolean;
  onClose: () => void;
  onSave: (updatedClassroom: Classroom) => void;
  onOpenSpecs?: () => void;
}

export const ReportModal: React.FC<Props> = ({
  classroom,
  isOpen = true,
  onClose,
  onSave,
  onOpenSpecs
}) => {
  if (!isOpen || !classroom) return null;

  const [studentCount, setStudentCount] = useState<number>(classroom.studentCount);
  const [deskEntries, setDeskEntries] = useState<DeskEntry[]>([]);
  const [chairEntries, setChairEntries] = useState<ChairEntry[]>([]);
  const [note, setNote] = useState<string>('');

  // Exchange Need states
  const [hasExchangeNeed, setHasExchangeNeed] = useState<boolean>(classroom.exchangeNeed?.hasNeed || false);
  const [exchangeItems, setExchangeItems] = useState<ExchangeItem[]>(() => {
    if (classroom.exchangeNeed?.items && classroom.exchangeNeed.items.length > 0) {
      return classroom.exchangeNeed.items.map(i => ({ ...i }));
    }
    const legacy: ExchangeItem[] = [];
    if (classroom.exchangeNeed?.deskExchangeNeeded) {
      legacy.push({
        id: `ex-desk-${Date.now()}-1`,
        type: 'desk',
        model: classroom.exchangeNeed.targetDeskModel || '#130',
        quantity: classroom.exchangeNeed.targetDeskQuantity || 1
      });
    }
    if (classroom.exchangeNeed?.chairExchangeNeeded) {
      legacy.push({
        id: `ex-chair-${Date.now()}-2`,
        type: 'chair',
        model: classroom.exchangeNeed.targetChairModel || '#125-#135',
        quantity: classroom.exchangeNeed.targetChairQuantity || 1
      });
    }
    return legacy.length > 0 ? legacy : [
      { id: `ex-1`, type: 'desk', model: '#130', quantity: 1 }
    ];
  });
  const [exchangeReason, setExchangeReason] = useState<string>(classroom.exchangeNeed?.reason || '');

  useEffect(() => {
    if (classroom) {
      setStudentCount(classroom.studentCount);
      // Clone existing or start with one clean default row
      setDeskEntries(
        classroom.deskEntries.length > 0
          ? classroom.deskEntries.map(d => ({ ...d }))
          : [{ model: '#125', quantity: classroom.studentCount || 0 }]
      );
      setChairEntries(
        classroom.chairEntries.length > 0
          ? classroom.chairEntries.map(c => ({ ...c }))
          : [{ model: '#125-#135', quantity: classroom.studentCount || 0 }]
      );
      setNote(classroom.note || '');

      setHasExchangeNeed(classroom.exchangeNeed?.hasNeed || false);
      if (classroom.exchangeNeed?.items && classroom.exchangeNeed.items.length > 0) {
        setExchangeItems(classroom.exchangeNeed.items.map(i => ({ ...i })));
      } else {
        const legacy: ExchangeItem[] = [];
        if (classroom.exchangeNeed?.deskExchangeNeeded) {
          legacy.push({
            id: `ex-desk-${Date.now()}-1`,
            type: 'desk',
            model: classroom.exchangeNeed.targetDeskModel || '#130',
            quantity: classroom.exchangeNeed.targetDeskQuantity || 1
          });
        }
        if (classroom.exchangeNeed?.chairExchangeNeeded) {
          legacy.push({
            id: `ex-chair-${Date.now()}-2`,
            type: 'chair',
            model: classroom.exchangeNeed.targetChairModel || '#125-#135',
            quantity: classroom.exchangeNeed.targetChairQuantity || 1
          });
        }
        setExchangeItems(legacy.length > 0 ? legacy : [
          { id: `ex-1`, type: 'desk', model: '#130', quantity: 1 }
        ]);
      }
      setExchangeReason(classroom.exchangeNeed?.reason || '');
    }
  }, [classroom]);

  // Live total desk & chair calculations
  const totalDesks = deskEntries.reduce((sum, d) => sum + (Number(d.quantity) || 0), 0);
  const totalChairs = chairEntries.reduce((sum, c) => sum + (Number(c.quantity) || 0), 0);

  const deskDiff = totalDesks - studentCount;
  const chairDiff = totalChairs - studentCount;

  // Add desk entry
  const handleAddDeskRow = () => {
    setDeskEntries([...deskEntries, { model: '#130', quantity: 1 }]);
  };

  const handleRemoveDeskRow = (index: number) => {
    setDeskEntries(deskEntries.filter((_, i) => i !== index));
  };

  const handleDeskChange = (index: number, field: keyof DeskEntry, value: any) => {
    const updated = [...deskEntries];
    if (field === 'quantity') {
      updated[index].quantity = Math.max(0, parseInt(value, 10) || 0);
    } else {
      updated[index].model = value;
    }
    setDeskEntries(updated);
  };

  // Add chair entry
  const handleAddChairRow = () => {
    setChairEntries([...chairEntries, { model: '#125-#135', quantity: 1 }]);
  };

  const handleRemoveChairRow = (index: number) => {
    setChairEntries(chairEntries.filter((_, i) => i !== index));
  };

  const handleChairChange = (index: number, field: keyof ChairEntry, value: any) => {
    const updated = [...chairEntries];
    if (field === 'quantity') {
      updated[index].quantity = Math.max(0, parseInt(value, 10) || 0);
    } else {
      updated[index].model = value;
    }
    setChairEntries(updated);
  };

  // Multiple Exchange Items Handlers
  const handleAddExchangeItem = (type: 'desk' | 'chair') => {
    const defaultModel = type === 'desk' ? '#130' : '#125-#135';
    setExchangeItems([
      ...exchangeItems,
      {
        id: `ex-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type,
        model: defaultModel,
        quantity: 1
      }
    ]);
  };

  const handleRemoveExchangeItem = (index: number) => {
    setExchangeItems(exchangeItems.filter((_, i) => i !== index));
  };

  const handleExchangeItemChange = (index: number, field: keyof ExchangeItem, value: any) => {
    const updated = [...exchangeItems];
    if (field === 'quantity') {
      updated[index].quantity = Math.max(1, parseInt(value, 10) || 1);
    } else if (field === 'type') {
      updated[index].type = value;
      updated[index].model = value === 'desk' ? '#130' : '#125-#135';
    } else {
      (updated[index] as any)[field] = value;
    }
    setExchangeItems(updated);
  };

  // Handle Save
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nowStr = new Date().toLocaleString('zh-TW', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const validExchangeItems = exchangeItems.filter(i => i.quantity > 0);
    const firstDesk = validExchangeItems.find(i => i.type === 'desk');
    const firstChair = validExchangeItems.find(i => i.type === 'chair');

    const updated: Classroom = {
      ...classroom,
      studentCount,
      deskEntries: deskEntries.filter(d => d.quantity > 0),
      chairEntries: chairEntries.filter(c => c.quantity > 0),
      reported: true,
      note,
      exchangeNeed: {
        hasNeed: hasExchangeNeed && validExchangeItems.length > 0,
        items: hasExchangeNeed ? validExchangeItems : [],
        deskExchangeNeeded: hasExchangeNeed && Boolean(firstDesk),
        targetDeskModel: firstDesk?.model || '',
        targetDeskQuantity: firstDesk?.quantity || 0,
        chairExchangeNeeded: hasExchangeNeed && Boolean(firstChair),
        targetChairModel: firstChair?.model || '',
        targetChairQuantity: firstChair?.quantity || 0,
        reason: exchangeReason
      },
      lastUpdated: nowStr
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex justify-between items-center shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-indigo-500 text-white font-mono text-xs font-bold rounded">
                {classroom.floor}
              </span>
              <h2 className="text-xl font-bold">{classroom.name} 桌椅清點填報</h2>
            </div>
            <p className="text-xs text-indigo-200 mt-1">
              導師：{classroom.teacher} 老師｜分機：{classroom.extension}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-slate-800">
          
          {/* Student Count Box */}
          <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <label className="block text-xs font-bold text-indigo-900 uppercase tracking-wider mb-0.5">
                現有班級學生人數 (桌椅基準需求數)
              </label>
              <p className="text-xs text-indigo-700">請確認班級人數，系統將根據此數值比對桌椅增減</p>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <input
                type="number"
                min={0}
                max={60}
                value={studentCount}
                onChange={e => setStudentCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-20 px-3 py-1.5 bg-white border border-indigo-300 rounded-lg text-center font-bold font-mono text-base text-indigo-950 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
              <span className="text-xs font-bold text-indigo-900">人</span>
            </div>
          </div>

          {/* Quick Specs Link Button Banner */}
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-xs text-slate-600 font-medium">
              如果不確定桌腳型號或顏色代表的意思：
            </span>
            <button
              type="button"
              onClick={onOpenSpecs}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold underline flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              開啓型號對照圖表
            </button>
          </div>

          {/* Desk Reporting Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🪑</span>
                <h3 className="font-bold text-slate-900 text-sm">桌子型號與數量清點</h3>
              </div>
              <button
                type="button"
                onClick={handleAddDeskRow}
                className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border border-indigo-200"
              >
                <Plus className="w-3.5 h-3.5" />
                新增型號
              </button>
            </div>

            <div className="space-y-2">
              {deskEntries.map((entry, idx) => {
                const spec = DESK_SPECS.find(s => s.model === entry.model);

                return (
                  <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    {/* Color Swatch Dot */}
                    <div
                      className="w-4 h-4 rounded-full border border-slate-400 shrink-0 ml-1"
                      style={{ backgroundColor: spec?.hexColor || '#CBD5E1' }}
                    />

                    {/* Desk Dropdown */}
                    <select
                      value={entry.model}
                      onChange={e => handleDeskChange(idx, 'model', e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      {DESK_SPECS.map(s => (
                        <option key={s.model} value={s.model}>
                          {s.model} ({s.colorName}柱 / 適高{s.heightRange}cm{s.isDiscontinued ? ' - 已停產' : ''})
                        </option>
                      ))}
                    </select>

                    {/* Quantity Input */}
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-xs text-slate-500 font-medium">數量:</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={entry.quantity}
                        onChange={e => handleDeskChange(idx, 'quantity', e.target.value)}
                        className="w-16 px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-center font-bold font-mono text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                      <span className="text-xs text-slate-600 font-medium">張</span>
                    </div>

                    {/* Delete Row Button */}
                    {deskEntries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDeskRow(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chair Reporting Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">💺</span>
                <h3 className="font-bold text-slate-900 text-sm">椅子型號與數量清點</h3>
              </div>
              <button
                type="button"
                onClick={handleAddChairRow}
                className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border border-indigo-200"
              >
                <Plus className="w-3.5 h-3.5" />
                新增型號
              </button>
            </div>

            <div className="space-y-2">
              {chairEntries.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {/* Chair Dropdown */}
                  <select
                    value={entry.model}
                    onChange={e => handleChairChange(idx, 'model', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    {CHAIR_SPECS.map(s => (
                      <option key={s.model} value={s.model}>
                        {s.model} (適用：{s.gradeRange} / {s.heightRange}cm)
                      </option>
                    ))}
                  </select>

                  {/* Quantity Input */}
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-slate-500 font-medium">數量:</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={entry.quantity}
                      onChange={e => handleChairChange(idx, 'quantity', e.target.value)}
                      className="w-16 px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-center font-bold font-mono text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                    <span className="text-xs text-slate-600 font-medium">張</span>
                  </div>

                  {/* Delete Row Button */}
                  {chairEntries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveChairRow(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Live Dynamic Calculation Box */}
          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2 text-xs">
            <div className="font-bold text-indigo-300 text-xs tracking-wider uppercase flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              即時比對試算結果
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between items-center p-2 bg-slate-800 rounded-lg">
                <span>桌子總數: <strong>{totalDesks} 張</strong></span>
                {deskDiff === 0 ? (
                  <span className="text-emerald-400 font-bold">✓ 數量正確</span>
                ) : deskDiff < 0 ? (
                  <span className="text-rose-400 font-bold">缺 {Math.abs(deskDiff)} 張</span>
                ) : (
                  <span className="text-blue-400 font-bold">多 {deskDiff} 張</span>
                )}
              </div>

              <div className="flex justify-between items-center p-2 bg-slate-800 rounded-lg">
                <span>椅子總數: <strong>{totalChairs} 張</strong></span>
                {chairDiff === 0 ? (
                  <span className="text-emerald-400 font-bold">✓ 數量正確</span>
                ) : chairDiff < 0 ? (
                  <span className="text-rose-400 font-bold">缺 {Math.abs(chairDiff)} 張</span>
                ) : (
                  <span className="text-blue-400 font-bold">多 {chairDiff} 張</span>
                )}
              </div>
            </div>
          </div>

          {/* Model Exchange Need Section (Independent of Student Count) */}
          <div className="p-4 bg-amber-50/80 border border-amber-200/90 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-amber-950 text-sm flex items-center gap-1.5">
                  <span className="p-1 bg-amber-200 text-amber-900 rounded-md text-xs">🔄</span>
                  桌椅型號正確性與更換/調配需求
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  即便數量符合學生人數，若現有桌椅型號不適合或需更換，可於此登記
                </p>
              </div>
            </div>

            {/* Toggle Status Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setHasExchangeNeed(false)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  !hasExchangeNeed
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>🟢 型號皆正確 (無調配需求)</span>
              </button>

              <button
                type="button"
                onClick={() => setHasExchangeNeed(true)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  hasExchangeNeed
                    ? 'bg-amber-600 text-white border-amber-700 shadow-2xs ring-2 ring-amber-300'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>🏷️ 需要換型號 / 有調配需求</span>
              </button>
            </div>

            {/* Detailed Exchange Controls (Supports Multiple Models) */}
            {hasExchangeNeed && (
              <div className="p-3.5 bg-white/95 border border-amber-300 rounded-xl space-y-3 mt-2 animate-fade-in text-xs">
                <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                  <div>
                    <span className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                      <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600" />
                      欲更換之桌椅型號清單 (可新增多組桌/椅型號需求)：
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      若有多位學生身高不同需不同型號，可點選下方按鈕分別新增
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleAddExchangeItem('desk')}
                      className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border border-amber-200"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-700" />
                      <span>➕ 新增換桌需求</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddExchangeItem('chair')}
                      className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border border-amber-200"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-700" />
                      <span>➕ 新增換椅需求</span>
                    </button>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  {exchangeItems.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className={`p-2.5 rounded-xl border flex flex-wrap items-center justify-between gap-2.5 ${
                        item.type === 'desk'
                          ? 'bg-amber-50/50 border-amber-200'
                          : 'bg-indigo-50/40 border-indigo-200'
                      }`}
                    >
                      {/* Type Switcher */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-bold text-[11px]">#{idx + 1}</span>
                        <select
                          value={item.type}
                          onChange={e => handleExchangeItemChange(idx, 'type', e.target.value as 'desk' | 'chair')}
                          className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500"
                        >
                          <option value="desk">🪑 桌子</option>
                          <option value="chair">𒒺 椅子</option>
                        </select>
                      </div>

                      {/* Model Selector */}
                      <div className="flex items-center gap-1.5 grow">
                        <span className="text-slate-600 text-xs shrink-0">欲換成：</span>
                        {item.type === 'desk' ? (
                          <select
                            value={item.model}
                            onChange={e => handleExchangeItemChange(idx, 'model', e.target.value)}
                            className="grow px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 font-bold focus:ring-2 focus:ring-amber-500"
                          >
                            {DESK_SPECS.map(s => (
                              <option key={s.model} value={s.model}>
                                型號 {s.model} ({s.colorName}柱 / 適高 {s.heightRange}cm)
                              </option>
                            ))}
                          </select>
                        ) : (
                          <select
                            value={item.model}
                            onChange={e => handleExchangeItemChange(idx, 'model', e.target.value)}
                            className="grow px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500"
                          >
                            {CHAIR_SPECS.map(s => (
                              <option key={s.model} value={s.model}>
                                型號 {s.model} (適高 {s.heightRange}cm - {s.gradeRange})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Quantity Input */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-slate-600 text-xs">數量：</span>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={item.quantity}
                          onChange={e => handleExchangeItemChange(idx, 'quantity', e.target.value)}
                          className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-amber-500"
                        />
                        <span className="text-slate-600 text-xs">張</span>
                      </div>

                      {/* Remove Button */}
                      {exchangeItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveExchangeItem(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                          title="刪除此更換需求"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Reason Text */}
                <div className="pt-1">
                  <label className="block text-slate-700 font-semibold mb-1">
                    調配/更換原因說明：
                  </label>
                  <input
                    type="text"
                    value={exchangeReason}
                    onChange={e => setExchangeReason(e.target.value)}
                    placeholder="例如：學生身材較高大需更換較高號桌椅，或有特教個別需求"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Teacher Note Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              班級導師備註說明 (可寫多餘桌椅放置位置或損壞需修繕狀況)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="例如：多餘2張#125桌子放置於後方推門外側，可隨時自取。"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-2 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-100 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>確認並儲存填報數據</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
