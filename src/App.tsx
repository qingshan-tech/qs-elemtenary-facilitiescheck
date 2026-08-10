import React, { useState, useEffect } from 'react';
import { Classroom, TransferLog } from './types';
import { INITIAL_CLASSROOMS, INITIAL_TRANSFER_LOGS } from './data/initialData';
import { Header } from './components/Header';
import { FloorFilter } from './components/FloorFilter';
import { ClassCard } from './components/ClassCard';
import { ReportModal } from './components/ReportModal';
import { SpecReferenceModal } from './components/SpecReferenceModal';
import { SurplusCoordinator } from './components/SurplusCoordinator';
import { GoogleDocSheetExporter } from './components/GoogleDocSheetExporter';
import { GoogleSheetConfigModal } from './components/GoogleSheetConfigModal';
import { Building2, FileText, CheckCircle2, RefreshCw } from 'lucide-react';

export function App() {
  // Persistence keys for localStorage (v4 ensures fresh clean launch)
  const LOCAL_STORAGE_KEY = 'qingshan_desk_inventory_clean_v4';
  const LOCAL_STORAGE_LOGS_KEY = 'qingshan_desk_logs_clean_v4';
  const LOCAL_STORAGE_WEBAPP_KEY = 'qingshan_desk_sheet_url_v1';

  // Automatically clear old version caches if present
  useEffect(() => {
    localStorage.removeItem('qingshan_desk_inventory_v1');
    localStorage.removeItem('qingshan_desk_inventory_v2');
    localStorage.removeItem('qingshan_desk_inventory_clean_v3');
    localStorage.removeItem('qingshan_desk_logs_v1');
    localStorage.removeItem('qingshan_desk_logs_clean_v3');
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

  // Google Sheet Web App Endpoint state
  const [webAppUrl, setWebAppUrl] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_WEBAPP_KEY) || '';
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  // UI Navigation States
  const [activeTab, setActiveTab] = useState<'classrooms' | 'coordinator' | 'exporter'>('classrooms');
  const [selectedFloor, setSelectedFloor] = useState<string>('ALL');
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [isSpecsOpen, setIsSpecsOpen] = useState<boolean>(false);
  const [isSheetConfigOpen, setIsSheetConfigOpen] = useState<boolean>(false);

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

  // Push Data to Google Sheet Database
  const pushClassroomToSheet = async (classroom: Classroom) => {
    if (!webAppUrl.trim()) return;

    try {
      await fetch(webAppUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'updateClassroom',
          classroom
        })
      });
      setLastSyncTime(new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Failed to push data to Google Sheet:', err);
    }
  };

  const handleSyncToSheet = async (): Promise<boolean> => {
    if (!webAppUrl.trim()) return false;
    setIsSyncing(true);

    try {
      await fetch(webAppUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'syncAll',
          classrooms
        })
      });
      setLastSyncTime(new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }));
      setIsSyncing(false);
      return true;
    } catch (err) {
      console.error('Sync to sheet failed:', err);
      setIsSyncing(false);
      return false;
    }
  };

  const handleSyncFromSheet = async (): Promise<boolean> => {
    if (!webAppUrl.trim()) return false;
    setIsSyncing(true);

    try {
      const res = await fetch(webAppUrl);
      const json = await res.json();
      if (json && json.data) {
        // Parse rows from sheet if structured
        setLastSyncTime(new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }));
      }
      setIsSyncing(false);
      return true;
    } catch (err) {
      console.error('Sync from sheet failed:', err);
      setIsSyncing(false);
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
      itemType,
      model,
      quantity,
      status: 'pending',
      note
    };

    setTransferLogs(prev => [newLog, ...prev]);

    // Adjust quantities in source and destination classrooms
    setClassrooms(prev =>
      prev.map(c => {
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
          if (webAppUrl) pushClassroomToSheet(updated);
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
          if (webAppUrl) pushClassroomToSheet(updated);
          return updated;
        }

        return c;
      })
    );
  };

  // Handler: Delete or Revert Transfer
  const handleDeleteTransferLog = (logId: string) => {
    setTransferLogs(prev => prev.filter(l => l.id !== logId));
  };

  // Handler: Reset System Data to Default
  const handleResetData = () => {
    if (window.confirm('確定要將所有班級桌椅填報紀錄與調配資料重置為全新空白狀態嗎？')) {
      setClassrooms(INITIAL_CLASSROOMS);
      setTransferLogs(INITIAL_TRANSFER_LOGS);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem(LOCAL_STORAGE_LOGS_KEY);
      localStorage.removeItem('qingshan_desk_inventory_v1');
      localStorage.removeItem('qingshan_desk_inventory_v2');
      localStorage.removeItem('qingshan_desk_logs_v1');
    }
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
        onOpenSheetConfig={() => setIsSheetConfigOpen(true)}
        onResetData={handleResetData}
        totalClassrooms={classrooms.length}
        reportedCount={reportedCount}
        isSheetConnected={Boolean(webAppUrl)}
      />

      {/* Primary Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
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
          <GoogleDocSheetExporter classrooms={classrooms} />
        )}

      </main>

      {/* Global Modals */}
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
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
