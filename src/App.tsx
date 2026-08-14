import React, { useState, useEffect } from 'react';
import { Classroom, TransferLog } from './types';
import { INITIAL_CLASSROOMS, INITIAL_TRANSFER_LOGS, DEFAULT_GOOGLE_APPS_SCRIPT_URL } from './data/initialData';
import { transformClassroomToSheetRow, mergeCloudClassrooms } from './utils/sheetUtils';
import { Header } from './components/Header';
import { FloorFilter } from './components/FloorFilter';
import { ClassCard } from './components/ClassCard';
import { ReportModal } from './components/ReportModal';
import { SpecReferenceModal } from './components/SpecReferenceModal';
import { SurplusCoordinator } from './components/SurplusCoordinator';
import { GoogleDocSheetExporter } from './components/GoogleDocSheetExporter';
import { GoogleSheetConfigModal } from './components/GoogleSheetConfigModal';
import { PasswordAuthModal } from './components/PasswordAuthModal';
import { ClassDetailModal } from './components/ClassDetailModal';
import { Building2, FileText, CheckCircle2, RefreshCw } from 'lucide-react';

export function App() {
  // Persistence keys for localStorage (v5 ensures updated clean data without extra titles)
  const LOCAL_STORAGE_KEY = 'qingshan_desk_inventory_clean_v5';
  const LOCAL_STORAGE_LOGS_KEY = 'qingshan_desk_logs_clean_v5';
  const LOCAL_STORAGE_WEBAPP_KEY = 'qingshan_desk_sheet_url_v1';

  // Automatically clear old version caches if present
  useEffect(() => {
    localStorage.removeItem('qingshan_desk_inventory_v1');
    localStorage.removeItem('qingshan_desk_inventory_v2');
    localStorage.removeItem('qingshan_desk_inventory_clean_v3');
    localStorage.removeItem('qingshan_desk_inventory_clean_v4');
    localStorage.removeItem('qingshan_desk_logs_v1');
    localStorage.removeItem('qingshan_desk_logs_clean_v3');
    localStorage.removeItem('qingshan_desk_logs_clean_v4');
  }, []);

  // Initialize state from LocalStorage or default clean state
  const [classrooms, setClassrooms] = useState<Classroom[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure parsed data doesn't contain legacy mock entries
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse saved classrooms:', e);
    }
    return INITIAL_CLASSROOMS;
  });

  const [transferLogs, setTransferLogs] = useState<TransferLog[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_LOGS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved transfer logs:', e);
    }
    return INITIAL_TRANSFER_LOGS;
  });

  // Google Sheet Web App Endpoint state (defaults to Qingshan default database endpoint)
  const [webAppUrl, setWebAppUrl] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_WEBAPP_KEY) || DEFAULT_GOOGLE_APPS_SCRIPT_URL;
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  // UI Navigation & Notification States
  const [activeTab, setActiveTab] = useState<'classrooms' | 'coordinator' | 'exporter'>('classrooms');
  const [selectedFloor, setSelectedFloor] = useState<string>('ALL');
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [detailClassroom, setDetailClassroom] = useState<Classroom | null>(null);
  const [isSpecsOpen, setIsSpecsOpen] = useState<boolean>(false);
  const [isSheetConfigOpen, setIsSheetConfigOpen] = useState<boolean>(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 4000);
  };

  // Password Protection Modal state
  const [passwordModalConfig, setPasswordModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onSuccess: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onSuccess: () => {}
  });

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(classrooms));
    } catch (e) {
      console.error('Failed to save classrooms:', e);
    }
  }, [classrooms]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_LOGS_KEY, JSON.stringify(transferLogs));
    } catch (e) {
      console.error('Failed to save transfer logs:', e);
    }
  }, [transferLogs]);

  useEffect(() => {
    if (webAppUrl) {
      localStorage.setItem(LOCAL_STORAGE_WEBAPP_KEY, webAppUrl);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_WEBAPP_KEY);
    }
  }, [webAppUrl]);

  // Read latest records from Google Sheet database on startup across all devices/teachers
  useEffect(() => {
    const targetUrl = webAppUrl || DEFAULT_GOOGLE_APPS_SCRIPT_URL;
    if (targetUrl) {
      handleSyncFromSheet(targetUrl, true);
    }
  }, []);

  // Push Single Classroom Data to Google Sheet Database
  const pushClassroomToSheet = async (classroom: Classroom) => {
    const url = (webAppUrl || DEFAULT_GOOGLE_APPS_SCRIPT_URL).trim();
    if (!url) return;

    try {
      const row = transformClassroomToSheetRow(classroom);
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'updateClassroom',
          row,
          classroom,
          classrooms: classrooms.map(c => c.id === classroom.id ? classroom : c)
        })
      });
      setLastSyncTime(new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Failed to push data to Google Sheet:', err);
    }
  };

  const pushAllToSheet = async (
    targetClassrooms: Classroom[] = classrooms,
    targetLogs: TransferLog[] = transferLogs
  ): Promise<boolean> => {
    const url = (webAppUrl || DEFAULT_GOOGLE_APPS_SCRIPT_URL).trim();
    if (!url) return false;
    setIsSyncing(true);

    try {
      const rows = targetClassrooms.map(c => transformClassroomToSheetRow(c));
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'syncAll',
          rows,
          classrooms: targetClassrooms,
          transferLogs: targetLogs
        })
      });
      const timeStr = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
      setLastSyncTime(timeStr);
      setIsSyncing(false);
      return true;
    } catch (err) {
      console.error('Sync to sheet failed:', err);
      setIsSyncing(false);
      return false;
    }
  };

  const handleSyncToSheet = async (): Promise<boolean> => {
    return pushAllToSheet(classrooms, transferLogs);
  };

  const handleSyncFromSheet = async (urlToUse?: string, isAutoOnLoad = false): Promise<boolean> => {
    const url = (urlToUse || webAppUrl || DEFAULT_GOOGLE_APPS_SCRIPT_URL).trim();
    if (!url) return false;
    setIsSyncing(true);

    try {
      const fetchUrl = url.includes('?') ? `${url}&_t=${Date.now()}` : `${url}?_t=${Date.now()}`;
      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      
      const { merged, updatedCount, transferLogs: cloudLogs } = mergeCloudClassrooms(classrooms, json);
      
      if (updatedCount > 0) {
        setClassrooms(merged);
        if (cloudLogs && Array.isArray(cloudLogs)) {
          setTransferLogs(cloudLogs);
        }
        const timeStr = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
        setLastSyncTime(timeStr);
        if (isAutoOnLoad) {
          showToast('📡 已自動連線青山雲端資料庫，成功載入最新盤點紀錄！');
        } else {
          showToast('✅ 已成功從 Google Sheet 雲端資料庫載入最新資料！');
        }
      } else {
        const timeStr = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
        setLastSyncTime(timeStr);
        if (!isAutoOnLoad) {
          showToast('📡 已連線青山雲端資料庫 (目前資料與雲端一致)');
        }
      }
      setIsSyncing(false);
      return true;
    } catch (err) {
      console.warn('Sync from Google Sheet failed (may be offline or CORS during direct get):', err);
      setIsSyncing(false);
      if (!isAutoOnLoad) {
        showToast('⚠️ 連線 Google Sheet 失敗，請確認網路或試算表設定');
      }
      return false;
    }
  };

  // Handler: Save Classroom Survey Updates
  const handleSaveReport = (updated: Classroom) => {
    const updatedWithTime: Classroom = {
      ...updated,
      reported: true,
      lastUpdated: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
    };

    setClassrooms(prev =>
      prev.map(c => (c.id === updatedWithTime.id ? updatedWithTime : c))
    );
    setEditingClassroom(null);

    // Sync to Google Sheet if connected
    if (webAppUrl) {
      pushClassroomToSheet(updatedWithTime);
    }
  };

  // Handler: Toggle Class Completed Status
  const handleToggleCompleted = (classId: string) => {
    setClassrooms(prev =>
      prev.map(c => {
        if (c.id === classId) {
          const updated = { ...c, isCompleted: !c.isCompleted };
          if (webAppUrl) pushClassroomToSheet(updated);
          return updated;
        }
        return c;
      })
    );
  };

  // Handler: Execute Inventory Transfer Match
  const handleExecuteTransfer = (
    fromClassId: string,
    toClassId: string,
    itemType: 'desk' | 'chair',
    model: string,
    quantity: number,
    note?: string
  ) => {
    const fromClass = classrooms.find(c => c.id === fromClassId);
    const toClass = classrooms.find(c => c.id === toClassId);

    if (!fromClass || !toClass) return;

    // Create Transfer Log Entry
    const newLog: TransferLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      fromClassId,
      fromClassName: fromClass.name,
      toClassId,
      toClassName: toClass.name,
      type: itemType,
      model,
      quantity,
      status: 'pending',
      note
    };

    const newLogs = [newLog, ...transferLogs];
    setTransferLogs(newLogs);

    // Adjust quantities in source and destination classrooms
    const newClassrooms = classrooms.map(c => {
      if (c.id === fromClassId) {
        let updated: Classroom;
        if (itemType === 'desk') {
          const updatedDesks = c.deskEntries.map(d =>
            d.model === model ? { ...d, quantity: Math.max(0, d.quantity - quantity) } : d
          );
          updated = { ...c, deskEntries: updatedDesks };
        } else {
          const updatedChairs = c.chairEntries.map(ch =>
            ch.model === model ? { ...ch, quantity: Math.max(0, ch.quantity - quantity) } : ch
          );
          updated = { ...c, chairEntries: updatedChairs };
        }
        return updated;
      }

      if (c.id === toClassId) {
        let updated: Classroom;
        if (itemType === 'desk') {
          const existing = c.deskEntries.find(d => d.model === model);
          let updatedDesks;
          if (existing) {
            updatedDesks = c.deskEntries.map(d =>
              d.model === model ? { ...d, quantity: d.quantity + quantity } : d
            );
          } else {
            updatedDesks = [...c.deskEntries, { model, quantity }];
          }
          updated = { ...c, deskEntries: updatedDesks };
        } else {
          const existing = c.chairEntries.find(ch => ch.model === model);
          let updatedChairs;
          if (existing) {
            updatedChairs = c.chairEntries.map(ch =>
              ch.model === model ? { ...ch, quantity: ch.quantity + quantity } : ch
            );
          } else {
            updatedChairs = [...c.chairEntries, { model, quantity }];
          }
          updated = { ...c, chairEntries: updatedChairs };
        }
        return updated;
      }

      return c;
    });

    setClassrooms(newClassrooms);
    if (webAppUrl) {
      pushAllToSheet(newClassrooms, newLogs);
    }
  };

  // Handler: Delete or Revert Transfer
  const handleDeleteTransferLog = (logId: string) => {
    const newLogs = transferLogs.filter(l => l.id !== logId);
    setTransferLogs(newLogs);
    if (webAppUrl) {
      pushAllToSheet(classrooms, newLogs);
    }
  };

  // Handler: Password Request before Opening Google Sheet Config
  const handleRequestSheetConfig = () => {
    setPasswordModalConfig({
      isOpen: true,
      title: '連結 Google Sheet 資料庫',
      description: '設定 Google Sheet 資料庫連線屬於管理權限，請輸入管理員密碼：',
      onSuccess: () => setIsSheetConfigOpen(true)
    });
  };

  // Handler: Password Request before Resetting Data
  const handleRequestResetData = () => {
    setPasswordModalConfig({
      isOpen: true,
      title: '重新歸零 (重置全校資料)',
      description: '將所有班級清點紀錄與調配資料重置屬於高風險操作，請輸入管理員密碼 (admin)：',
      onSuccess: async () => {
        setClassrooms(INITIAL_CLASSROOMS);
        setTransferLogs(INITIAL_TRANSFER_LOGS);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        localStorage.removeItem(LOCAL_STORAGE_LOGS_KEY);
        localStorage.removeItem('qingshan_desk_inventory_v1');
        localStorage.removeItem('qingshan_desk_inventory_v2');
        localStorage.removeItem('qingshan_desk_logs_v1');

        // Immediately push clean initial state to Google Sheet cloud database
        showToast('🔄 正在同步將雲端 Google Sheet 資料庫重設歸零...');
        const ok = await pushAllToSheet(INITIAL_CLASSROOMS, INITIAL_TRANSFER_LOGS);
        if (ok) {
          showToast('✅ 全校班級填報與調配紀錄已重新歸零，Google Sheet 雲端資料庫亦已同步重設清空！');
        } else {
          showToast('⚠️ 本地資料已歸零，但同步至雲端失敗，請確認網路連線。');
        }
      }
    });
  };

  // Filter classrooms by selected floor
  const reportedCount = classrooms.filter(c => c.reported).length;
  const filteredClassrooms = selectedFloor === 'ALL'
    ? classrooms
    : classrooms.filter(c => c.floor === selectedFloor);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col antialiased">
      
      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSpecs={() => setIsSpecsOpen(true)}
        onOpenSheetConfig={handleRequestSheetConfig}
        onResetData={handleRequestResetData}
        totalClassrooms={classrooms.length}
        reportedCount={reportedCount}
        isSheetConnected={Boolean(webAppUrl)}
        onSyncCloud={() => handleSyncFromSheet(webAppUrl, false)}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
      />

      {/* Primary Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Toast Notification Banner */}
        {toastNotice && (
          <div className="p-4 bg-emerald-600 text-white font-bold text-sm rounded-2xl shadow-lg border border-emerald-500 flex items-center justify-between animate-fade-in">
            <span>{toastNotice}</span>
            <button
              onClick={() => setToastNotice(null)}
              className="px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded text-xs font-semibold"
            >
              關閉
            </button>
          </div>
        )}
        
        {/* Tab 1: Classrooms List & Floor Filters */}
        {activeTab === 'classrooms' && (
          <div className="space-y-6">
            <FloorFilter
              classrooms={classrooms}
              selectedFloor={selectedFloor}
              onSelectFloor={setSelectedFloor}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredClassrooms.map(classroom => (
                <ClassCard
                  key={classroom.id}
                  classroom={classroom}
                  onOpenReport={c => setEditingClassroom(c)}
                  onToggleCompleted={handleToggleCompleted}
                  onOpenCoordinate={() => setActiveTab('coordinator')}
                  onOpenDetail={c => setDetailClassroom(c)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Surplus Matching & Logistics Coordinator */}
        {activeTab === 'coordinator' && (
          <SurplusCoordinator
            classrooms={classrooms}
            transferLogs={transferLogs}
            onExecuteTransfer={handleExecuteTransfer}
            onDeleteLog={handleDeleteTransferLog}
          />
        )}

        {/* Tab 3: Google Doc Formatted Document & Sheet Exporter */}
        {activeTab === 'exporter' && (
          <GoogleDocSheetExporter classrooms={classrooms} transferLogs={transferLogs} />
        )}

      </main>

      {/* Global Modals */}
      {detailClassroom && (
        <ClassDetailModal
          classroom={detailClassroom}
          isOpen={Boolean(detailClassroom)}
          onClose={() => setDetailClassroom(null)}
          onOpenReport={c => setEditingClassroom(c)}
          onOpenCoordinate={() => setActiveTab('coordinator')}
        />
      )}

      {editingClassroom && (
        <ReportModal
          classroom={editingClassroom}
          isOpen={Boolean(editingClassroom)}
          onClose={() => setEditingClassroom(null)}
          onSave={handleSaveReport}
          onOpenSpecs={() => setIsSpecsOpen(true)}
        />
      )}

      {isSpecsOpen && (
        <SpecReferenceModal isOpen={isSpecsOpen} onClose={() => setIsSpecsOpen(false)} />
      )}

      {isSheetConfigOpen && (
        <GoogleSheetConfigModal
          onClose={() => setIsSheetConfigOpen(false)}
          webAppUrl={webAppUrl}
          setWebAppUrl={setWebAppUrl}
          onSyncFromSheet={handleSyncFromSheet}
          onSyncToSheet={handleSyncToSheet}
          isSyncing={isSyncing}
          lastSyncTime={lastSyncTime}
          classrooms={classrooms}
        />
      )}

      {/* Password Authentication Modal */}
      <PasswordAuthModal
        isOpen={passwordModalConfig.isOpen}
        title={passwordModalConfig.title}
        description={passwordModalConfig.description}
        onClose={() => setPasswordModalConfig(prev => ({ ...prev, isOpen: false }))}
        onSuccess={passwordModalConfig.onSuccess}
      />

      {/* System Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 text-xs mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span>新北市立青山國民中小學 國小部 總務處</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>支援 115 學年度桌椅清點作業</span>
            <span>•</span>
            <button
              onClick={() => setActiveTab('exporter')}
              className="text-indigo-400 hover:underline flex items-center gap-1"
            >
              <FileText className="w-3 h-3" />
              <span>匯出至 Google Doc 文件</span>
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
