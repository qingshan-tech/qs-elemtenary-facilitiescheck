import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Layers, 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Sparkles,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { ClassRoom, GoogleSheetConfig, DeskModel, ChairModel } from './types';
import { INITIAL_CLASSES } from './data/initialClasses';
import { getClassInventorySummary, findMatchingTransfers } from './utils/inventory';
import { Header } from './components/Header';
import { FloorFilter } from './components/FloorFilter';
import { ClassCard } from './components/ClassCard';
import { ReportModal } from './components/ReportModal';
import { DeskSpecModal } from './components/DeskSpecModal';
import { SurplusMatchmaker } from './components/SurplusMatchmaker';
import { GoogleSheetSyncModal } from './components/GoogleSheetSyncModal';
import { GoogleDocExportModal } from './components/GoogleDocExportModal';

const STORAGE_KEY_CLASSES = 'qingshan_desk_inventory_classes_v4';
const STORAGE_KEY_CONFIG = 'qingshan_desk_sheet_config_v1';

export default function App() {
  // Load initial state from LocalStorage or Fallback
  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CLASSES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load saved classes', e);
    }
    return INITIAL_CLASSES;
  });

  const handleResetData = () => {
    setClasses(INITIAL_CLASSES);
    try {
      localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(INITIAL_CLASSES));
    } catch (e) {
      console.error('Failed to reset classes in localStorage', e);
    }
  };

  const [sheetConfig, setSheetConfig] = useState<GoogleSheetConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load saved sheet config', e);
    }
    return {
      webAppUrl: '',
      spreadsheetId: '',
      sheetName: '班級桌椅統計表',
      autoSync: true,
    };
  });

  // Filter & Search states
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sameFloorMode, setSameFloorMode] = useState(false);

  // Modal states
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);
  const [isDeskSpecOpen, setIsDeskSpecOpen] = useState(false);
  const [isMatchmakerOpen, setIsMatchmakerOpen] = useState(false);
  const [isSheetSyncOpen, setIsSheetSyncOpen] = useState(false);
  const [isDocExportOpen, setIsDocExportOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Save to LocalStorage whenever classes change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(classes));
    } catch (e) {
      console.error('Failed to persist classes', e);
    }
  }, [classes]);

  // Save sheet config
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(sheetConfig));
    } catch (e) {
      console.error('Failed to persist sheet config', e);
    }
  }, [sheetConfig]);

  // Sync class update to Google Sheet if webAppUrl is set
  const syncClassToGoogleSheet = async (updatedClass: ClassRoom) => {
    if (!sheetConfig.webAppUrl) return;
    try {
      setIsSyncing(true);
      const summary = getClassInventorySummary(updatedClass);
      const payload = {
        action: 'updateClass',
        payload: {
          name: updatedClass.name,
          floor: updatedClass.floor,
          teacher: updatedClass.teacher,
          studentsCount: updatedClass.studentsCount,
          totalDesks: summary.totalDesks,
          deskDetails: updatedClass.desks.map((d) => `${d.model}:${d.quantity}張`).join('; '),
          deskStatus: summary.deskTag.text,
          totalChairs: summary.totalChairs,
          chairDetails: updatedClass.chairs.map((c) => `${c.model}:${c.quantity}張`).join('; '),
          chairStatus: summary.chairTag.text,
          status: updatedClass.status,
          notes: updatedClass.notes || '',
        },
      };

      await fetch(sheetConfig.webAppUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify(payload),
      });

      setSheetConfig((prev) => ({
        ...prev,
        lastSyncedAt: new Date().toLocaleTimeString('zh-TW'),
      }));
    } catch (err) {
      console.error('Failed to sync to Google Sheet', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveClassReport = (updatedClass: ClassRoom) => {
    setClasses((prev) => prev.map((c) => (c.id === updatedClass.id ? updatedClass : c)));
    setEditingClass(null);
    if (sheetConfig.autoSync) {
      syncClassToGoogleSheet(updatedClass);
    }
  };

  // Complete transfer between surplus & shortage classrooms
  const handleCompleteTransfer = (
    fromClassId: string,
    toClassId: string,
    itemType: 'desk' | 'chair',
    quantity: number
  ) => {
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id === fromClassId) {
          // Subtract from surplus
          const updatedDesks = itemType === 'desk'
            ? c.desks.map((d, i) => (i === 0 ? { ...d, quantity: Math.max(0, d.quantity - quantity) } : d))
            : c.desks;
          const updatedChairs = itemType === 'chair'
            ? c.chairs.map((ch, i) => (i === 0 ? { ...ch, quantity: Math.max(0, ch.quantity - quantity) } : ch))
            : c.chairs;
          return { ...c, desks: updatedDesks, chairs: updatedChairs, status: '已完成' };
        } else if (c.id === toClassId) {
          // Add to shortage class
          const updatedDesks = itemType === 'desk'
            ? c.desks.length > 0
              ? c.desks.map((d, i) => (i === 0 ? { ...d, quantity: d.quantity + quantity } : d))
              : [{ model: c.recommendedDeskModel || '#130', quantity }]
            : c.desks;
          const updatedChairs = itemType === 'chair'
            ? c.chairs.length > 0
              ? c.chairs.map((ch, i) => (i === 0 ? { ...ch, quantity: ch.quantity + quantity } : ch))
              : [{ model: c.recommendedChairModel || '#125-#135', quantity }]
            : c.chairs;
          return { ...c, desks: updatedDesks, chairs: updatedChairs, status: '已完成' };
        }
        return c;
      })
    );
  };

  const handleManualSync = async () => {
    if (!sheetConfig.webAppUrl) return;
    setIsSyncing(true);
    for (const c of classes) {
      await syncClassToGoogleSheet(c);
    }
    setIsSyncing(false);
  };

  // Filtered classes logic
  const filteredClasses = classes.filter((c) => {
    // Floor filter
    if (selectedFloor !== 'all' && c.floor !== selectedFloor) return false;

    // Search query filter (class name or teacher name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchTeacher = c.teacher.toLowerCase().includes(q);
      if (!matchName && !matchTeacher) return false;
    }

    // Status filter
    if (statusFilter !== 'all') {
      const summary = getClassInventorySummary(c);
      if (statusFilter === 'shortage') {
        if (summary.deskDiff >= 0 && summary.chairDiff >= 0) return false;
      } else if (statusFilter === 'surplus') {
        if (summary.deskDiff <= 0 && summary.chairDiff <= 0) return false;
      } else if (statusFilter === 'unreported') {
        if (c.status !== '未填報') return false;
      } else if (statusFilter === 'completed') {
        if (c.status !== '已完成') return false;
      }
    }

    return true;
  });

  // Calculate totals
  const totalClassesCount = classes.length;
  const completedClassesCount = classes.filter((c) => c.status === '已完成').length;

  let shortageDesks = 0;
  let shortageChairs = 0;
  let surplusDesks = 0;
  let surplusChairs = 0;

  classes.forEach((c) => {
    const sum = getClassInventorySummary(c);
    if (sum.deskDiff < 0) shortageDesks += Math.abs(sum.deskDiff);
    if (sum.deskDiff > 0) surplusDesks += sum.deskDiff;
    if (sum.chairDiff < 0) shortageChairs += Math.abs(sum.chairDiff);
    if (sum.chairDiff > 0) surplusChairs += sum.chairDiff;
  });

  return (
    <div className="min-h-screen bg-[#F4F7F9] text-slate-800 font-sans antialiased flex flex-col">
      {/* Top Application Header */}
      <Header
        sheetConfig={sheetConfig}
        onOpenDeskSpec={() => setIsDeskSpecOpen(true)}
        onOpenMatchmaker={() => setIsMatchmakerOpen(true)}
        onOpenSheetSync={() => setIsSheetSyncOpen(true)}
        onOpenDocExport={() => setIsDocExportOpen(true)}
        onResetData={handleResetData}
        totalClasses={totalClassesCount}
        completedClasses={completedClassesCount}
        shortageDesks={shortageDesks}
        shortageChairs={shortageChairs}
        surplusDesks={surplusDesks}
        surplusChairs={surplusChairs}
        isSyncing={isSyncing}
        onManualSync={handleManualSync}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Floor & Search Filter Controls */}
        <FloorFilter
          selectedFloor={selectedFloor}
          onSelectFloor={setSelectedFloor}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sameFloorMode={sameFloorMode}
          onToggleSameFloorMode={() => setSameFloorMode(!sameFloorMode)}
        />

        {/* Informational Floor Banner */}
        <div className="mb-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 bg-white px-3.5 py-2 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>
              當前顯示：
              <strong className="text-slate-900 font-bold">
                {selectedFloor === 'all' ? '青山國中小 (小學部) 全部樓層' : `${selectedFloor} 樓教室`}
              </strong>
              （共 <span className="font-mono font-bold text-slate-900">{filteredClasses.length}</span> 班）
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> 缺額需調撥
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> 多餘可釋出
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 清點完成
            </span>
          </div>
        </div>

        {/* Classes Bento Grid */}
        {filteredClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClasses.map((classRoom) => (
              <ClassCard
                key={classRoom.id}
                classRoom={classRoom}
                onEditReport={setEditingClass}
                onOpenDeskSpec={() => setIsDeskSpecOpen(true)}
                isSameFloorHighlighted={sameFloorMode && typeof selectedFloor === 'number' && classRoom.floor === selectedFloor}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-10 text-center border border-slate-200 shadow-xs my-6">
            <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">未找到符合條件的班級記錄</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              請嘗試切換樓層篩選或清空搜尋關鍵字。
            </p>
            <button
              onClick={() => {
                setSelectedFloor('all');
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="mt-3 px-3.5 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-md hover:bg-slate-800 transition"
            >
              重設所有篩選條件
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-3 border-t border-slate-800 text-[11px] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-bold text-slate-200">新北市青山國中小(小學部) 總務處</span>
            <span className="ml-2 text-slate-500 font-mono">班級教室桌椅型號清點與需求調查系統</span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 font-medium">
            <button onClick={() => setIsDeskSpecOpen(true)} className="hover:text-slate-200 transition">
              型號尺寸對照表
            </button>
            <span>•</span>
            <button onClick={() => setIsSheetSyncOpen(true)} className="hover:text-slate-200 transition">
              Google Sheet 後台
            </button>
            <span>•</span>
            <button onClick={() => setIsDocExportOpen(true)} className="hover:text-slate-200 transition">
              Google Doc 報表
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {editingClass && (
        <ReportModal
          classRoom={editingClass}
          onSave={handleSaveClassReport}
          onClose={() => setEditingClass(null)}
          onOpenDeskSpec={() => setIsDeskSpecOpen(true)}
        />
      )}

      {isDeskSpecOpen && <DeskSpecModal onClose={() => setIsDeskSpecOpen(false)} />}

      {isMatchmakerOpen && (
        <SurplusMatchmaker
          classes={classes}
          onCompleteTransfer={handleCompleteTransfer}
          onClose={() => setIsMatchmakerOpen(false)}
        />
      )}

      {isSheetSyncOpen && (
        <GoogleSheetSyncModal
          sheetConfig={sheetConfig}
          onSaveConfig={setSheetConfig}
          onManualSync={handleManualSync}
          classes={classes}
          onClose={() => setIsSheetSyncOpen(false)}
        />
      )}

      {isDocExportOpen && (
        <GoogleDocExportModal classes={classes} onClose={() => setIsDocExportOpen(false)} />
      )}
    </div>
  );
}
