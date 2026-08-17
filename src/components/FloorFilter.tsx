import React from 'react';
import { Layers, AlertTriangle, CheckCircle2, PackageCheck } from 'lucide-react';
import { Classroom } from '../types';
import { calculateInventoryStatus } from '../data/initialData';

interface Props {
  selectedFloor: string; // 'ALL' | '1F' | '2F' | '3F' | '4F' | '5F'
  onSelectFloor: (floor: string) => void;
  classrooms: Classroom[];
}

export const FloorFilter: React.FC<Props> = ({
  selectedFloor,
  onSelectFloor,
  classrooms
}) => {
  const floors = ['ALL', '1F', '2F', '3F', '4F', '5F'];

  // Calculate statistics for currently selected view
  const filteredClasses = selectedFloor === 'ALL'
    ? classrooms
    : classrooms.filter(c => c.floor === selectedFloor);

  const totalClasses = filteredClasses.length;
  const reportedClasses = filteredClasses.filter(c => c.reported).length;
  const completedClasses = filteredClasses.filter(c => c.isCompleted).length;

  let totalDeskShortage = 0;
  let totalDeskSurplus = 0;
  let totalChairShortage = 0;
  let totalChairSurplus = 0;

  filteredClasses.forEach(c => {
    if (c.reported) {
      const status = calculateInventoryStatus(c);
      if (status.deskDifference < 0) totalDeskShortage += Math.abs(status.deskDifference);
      if (status.deskDifference > 0) totalDeskSurplus += status.deskDifference;
      if (status.chairDifference < 0) totalChairShortage += Math.abs(status.chairDifference);
      if (status.chairDifference > 0) totalChairSurplus += status.chairDifference;
    }
  });

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        
        {/* Floor Selection Buttons */}
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>選擇教學樓層過濾 (同樓層可優先就近協調搬運)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {floors.map(floor => {
              const countOnFloor = floor === 'ALL'
                ? classrooms.length
                : classrooms.filter(c => c.floor === floor).length;

              const isSelected = selectedFloor === floor;

              return (
                <button
                  key={floor}
                  onClick={() => onSelectFloor(floor)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  <span className="whitespace-nowrap">{floor === 'ALL' ? '全校樓層總覽' : `${floor} 樓`}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] whitespace-nowrap ${
                      isSelected
                        ? 'bg-indigo-700 text-indigo-100'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {countOnFloor}班
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Floor Quick Summary Metrics */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 shrink-0">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="whitespace-nowrap">填報率: <strong className="text-slate-900">{reportedClasses}/{totalClasses}</strong> 班</span>
          </div>

          <div className="h-4 w-px bg-slate-300 hidden sm:block" />

          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <PackageCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="whitespace-nowrap">搬運完成: <strong className="text-slate-900">{completedClasses}/{totalClasses}</strong> 班</span>
          </div>

          <div className="h-4 w-px bg-slate-300 hidden sm:block" />

          {/* Shortage or Surplus Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            {totalDeskShortage > 0 ? (
              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded-md flex items-center gap-1 whitespace-nowrap">
                <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                缺桌子 {totalDeskShortage} 張
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-medium rounded-md whitespace-nowrap">
                桌子無缺
              </span>
            )}

            {totalDeskSurplus > 0 && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded-md whitespace-nowrap">
                多桌子 {totalDeskSurplus} 張
              </span>
            )}

            {totalChairShortage > 0 ? (
              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded-md flex items-center gap-1 whitespace-nowrap">
                <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                缺椅子 {totalChairShortage} 張
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-medium rounded-md whitespace-nowrap">
                椅子無缺
              </span>
            )}

            {totalChairSurplus > 0 && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded-md whitespace-nowrap">
                多椅子 {totalChairSurplus} 張
              </span>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
