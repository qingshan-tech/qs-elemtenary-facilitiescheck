import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Info, 
  Save, 
  Layers, 
  AlertCircle
} from 'lucide-react';
import { ClassRoom, DeskModel, ChairModel, ModelCount, InventoryStatus } from '../types';
import { DESK_SPECS, CHAIR_SPECS } from '../data/deskChart';

interface ReportModalProps {
  classRoom: ClassRoom;
  onSave: (updatedClass: ClassRoom) => void;
  onClose: () => void;
  onOpenDeskSpec: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  classRoom,
  onSave,
  onClose,
  onOpenDeskSpec,
}) => {
  const [studentsCount, setStudentsCount] = useState<number>(classRoom.studentsCount);
  const [teacher, setTeacher] = useState<string>(classRoom.teacher);
  const [desks, setDesks] = useState<ModelCount<DeskModel>[]>(
    classRoom.desks.length > 0
      ? [...classRoom.desks]
      : [{ model: classRoom.recommendedDeskModel || '#130', quantity: classRoom.studentsCount || 0 }]
  );
  const [chairs, setChairs] = useState<ModelCount<ChairModel>[]>(
    classRoom.chairs.length > 0
      ? [...classRoom.chairs]
      : [{ model: classRoom.recommendedChairModel || '#125-#135', quantity: classRoom.studentsCount || 0 }]
  );
  const [notes, setNotes] = useState<string>(classRoom.notes || '');
  const [status, setStatus] = useState<InventoryStatus>(
    classRoom.status === '未填報' ? '已填報待處理' : classRoom.status
  );

  // Calculations
  const totalDesks = desks.reduce((sum, d) => sum + (Number(d.quantity) || 0), 0);
  const totalChairs = chairs.reduce((sum, c) => sum + (Number(c.quantity) || 0), 0);
  const deskDiff = totalDesks - studentsCount;
  const chairDiff = totalChairs - studentsCount;

  const handleAddDeskRow = () => {
    setDesks([...desks, { model: '#130', quantity: 1 }]);
  };

  const handleRemoveDeskRow = (index: number) => {
    setDesks(desks.filter((_, i) => i !== index));
  };

  const handleDeskChange = (index: number, field: 'model' | 'quantity', value: any) => {
    const updated = [...desks];
    if (field === 'quantity') {
      updated[index].quantity = Math.max(0, parseInt(value, 10) || 0);
    } else {
      updated[index].model = value as DeskModel;
    }
    setDesks(updated);
  };

  const handleAddChairRow = () => {
    setChairs([...chairs, { model: '#125-#135', quantity: 1 }]);
  };

  const handleRemoveChairRow = (index: number) => {
    setChairs(chairs.filter((_, i) => i !== index));
  };

  const handleChairChange = (index: number, field: 'model' | 'quantity', value: any) => {
    const updated = [...chairs];
    if (field === 'quantity') {
      updated[index].quantity = Math.max(0, parseInt(value, 10) || 0);
    } else {
      updated[index].model = value as ChairModel;
    }
    setChairs(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    onSave({
      ...classRoom,
      teacher,
      studentsCount,
      desks: desks.filter((d) => d.quantity > 0),
      chairs: chairs.filter((c) => c.quantity > 0),
      notes,
      status,
      updatedAt: formattedDate,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg">
              {classRoom.floor}F
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{classRoom.name}</h2>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                  {classRoom.floor} 樓
                </span>
              </div>
              <p className="text-xs text-slate-400">班級桌椅型號清點與需求回報</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenDeskSpec}
              className="inline-flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-sky-300 px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
            >
              <Info className="w-3.5 h-3.5" />
              型號對照圖
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">導師姓名</label>
              <input
                type="text"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                required
                className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                班級應備桌椅數量 (桌椅需求組數)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={studentsCount}
                  onChange={(e) => setStudentsCount(parseInt(e.target.value, 10) || 0)}
                  placeholder="0"
                  className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="text-sm font-semibold text-slate-600 shrink-0">組</span>
              </div>
            </div>
          </div>

          {/* Realtime Live Calculation Summary */}
          <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-blue-900 font-semibold mb-1">桌子試算結果</div>
              <div className="text-sm font-bold flex items-center gap-2">
                <span>現有 {totalDesks} 張 / 應備 {studentsCount} 張</span>
              </div>
              <div className="mt-1">
                {deskDiff === 0 && <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">[桌子數量正確]</span>}
                {deskDiff < 0 && <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">[需要桌子 {Math.abs(deskDiff)} 張]</span>}
                {deskDiff > 0 && <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">[有多桌子 {deskDiff} 張]</span>}
              </div>
            </div>

            <div>
              <div className="text-xs text-blue-900 font-semibold mb-1">椅子試算結果</div>
              <div className="text-sm font-bold flex items-center gap-2">
                <span>現有 {totalChairs} 張 / 應備 {studentsCount} 張</span>
              </div>
              <div className="mt-1">
                {chairDiff === 0 && <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">[椅子數量正確]</span>}
                {chairDiff < 0 && <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">[需要椅子 {Math.abs(chairDiff)} 張]</span>}
                {chairDiff > 0 && <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">[有多椅子 {chairDiff} 張]</span>}
              </div>
            </div>
          </div>

          {/* Section 1: Desk Inventory Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                清點桌子型號與數量 (共 {DESK_SPECS.length} 種型號)
              </label>
              <button
                type="button"
                onClick={handleAddDeskRow}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200"
              >
                <Plus className="w-3.5 h-3.5" />
                新增其他桌子型號
              </button>
            </div>

            <div className="space-y-2">
              {desks.map((d, index) => {
                const spec = DESK_SPECS.find((s) => s.model === d.model);
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200"
                  >
                    <div className="flex-1">
                      <select
                        value={d.model}
                        onChange={(e) => handleDeskChange(index, 'model', e.target.value)}
                        className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        {DESK_SPECS.map((s) => (
                          <option key={s.model} value={s.model}>
                            {s.model} - {s.colorName} ({s.heightRange}cm) {s.discontinued ? '[已停產]' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 w-32 shrink-0">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={d.quantity}
                        onChange={(e) => handleDeskChange(index, 'quantity', e.target.value)}
                        className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <span className="text-xs text-slate-600 font-medium shrink-0">張</span>
                    </div>

                    {desks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDeskRow(index)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Chair Inventory Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-600"></span>
                清點椅子型號與數量 (共 {CHAIR_SPECS.length} 種組合級距)
              </label>
              <button
                type="button"
                onClick={handleAddChairRow}
                className="text-xs text-amber-700 hover:text-amber-900 font-medium inline-flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200"
              >
                <Plus className="w-3.5 h-3.5" />
                新增其他椅子型號
              </button>
            </div>

            <div className="space-y-2">
              {chairs.map((c, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200"
                >
                  <div className="flex-1">
                    <select
                      value={c.model}
                      onChange={(e) => handleChairChange(index, 'model', e.target.value)}
                      className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {CHAIR_SPECS.map((s) => (
                        <option key={s.model} value={s.model}>
                          椅子 {s.model} ({s.gradeLabel})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 w-32 shrink-0">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={c.quantity}
                      onChange={(e) => handleChairChange(index, 'quantity', e.target.value)}
                      className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <span className="text-xs text-slate-600 font-medium shrink-0">張</span>
                  </div>

                  {chairs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveChairRow(index)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              備註與特別說明 (例：前門多1張舊桌子/桌面損壞1張/可提供同樓層支援)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="請輸入特殊狀況說明..."
              className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Completion Status Selection */}
          <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-800">標記清點狀態</div>
              <div className="text-xs text-slate-500">若清點完畢並確認數字無誤，可將狀態切換為已完成</div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as InventoryStatus)}
                className="text-sm font-bold bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="已填報待處理">已填報待處理</option>
                <option value="搬運協調中">搬運協調中</option>
                <option value="已完成">已完成 [標記完成]</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              取消
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition"
            >
              <Save className="w-4 h-4" />
              儲存並更新至前/後台
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
