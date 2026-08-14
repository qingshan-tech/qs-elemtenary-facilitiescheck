import { Classroom, InventoryStatus, TransferLog } from '../types';
import { calculateInventoryStatus } from '../data/initialData';

export interface ClassroomSheetRow {
  id: string;                    // 班級代號
  floor: string;                 // 樓層
  name: string;                  // 班級名稱
  teacher: string;               // 導師姓名
  extension: string;             // 分機
  studentCount: number;          // 學生人數
  reportedStatus: string;        // 填報狀態 (已填報 / 待填報)
  auditResult: string;           // 數量審核結果 (🟢 數量正確 / 🔴 缺桌 5張 / 🔵 多椅 2張...)
  totalDesks: number;            // 現有桌數
  deskDiffText: string;          // 桌數差額 (+2 (多2張) / -5 (缺5張) / 0 (相符))
  deskListText: string;          // 現有桌子型號及數量
  totalChairs: number;           // 現有椅數
  chairDiffText: string;         // 椅數差額 (+7 (多7張) / -1 (缺1張) / 0 (相符))
  chairListText: string;         // 現有椅子型號及數量
  surplusItemsText: string;      // 多餘/可釋出型號清單
  shortageItemsText: string;     // 短缺/待撥補型號清單
  exchangeNeedText: string;      // 換型號/特殊調配需求
  logisticsPlanText: string;     // 【搬運】調度需求與配置明細
  logisticsStatusText: string;   // 搬運執行進度 (已完成 / 處理中/待搬運 / 無需搬運 / 待填報)
  note: string;                  // 導師備註說明
  lastUpdated: string;           // 最後更新時間
}

/**
 * 取得數量審核結果字串
 */
export function getAuditResult(c: Classroom, st: InventoryStatus): string {
  if (!c.reported) return '待填報';
  if (st.deskDifference === 0 && st.chairDifference === 0) {
    return '🟢 數量完全正確';
  }
  const parts: string[] = [];
  if (st.deskDifference < 0) parts.push(`缺桌 ${Math.abs(st.deskDifference)}張`);
  else if (st.deskDifference > 0) parts.push(`多桌 ${st.deskDifference}張`);

  if (st.chairDifference < 0) parts.push(`缺椅 ${Math.abs(st.chairDifference)}張`);
  else if (st.chairDifference > 0) parts.push(`多椅 ${st.chairDifference}張`);

  if (st.deskDifference < 0 || st.chairDifference < 0) {
    return `🔴 ${parts.join(' / ')}`;
  }
  return `🔵 ${parts.join(' / ')}`;
}

/**
 * 取得差額文字說明
 */
export function getDifferenceText(diff: number, itemType: '桌' | '椅'): string {
  if (diff === 0) return '0 (相符)';
  if (diff > 0) return `+${diff} (多${diff}張)`;
  return `${diff} (缺${Math.abs(diff)}張)`;
}

/**
 * 取得現有多餘可釋出之型號清單文字
 */
export function getSurplusItemsText(c: Classroom, st: InventoryStatus): string {
  if (!c.reported) return '尚未填報';
  const parts: string[] = [];

  // 桌子多餘分析
  if (st.deskDifference > 0) {
    const surplusDesks = (st.deskModelBreakdown || [])
      .filter(d => d.surplus > 0)
      .map(d => `${d.model} (${d.surplus}張)`);
    if (surplusDesks.length > 0) {
      parts.push(`多桌: ${surplusDesks.join('、')} 可調出`);
    } else {
      parts.push(`多桌 ${st.deskDifference}張 可調出`);
    }
  }

  // 椅子多餘分析
  if (st.chairDifference > 0) {
    const surplusChairs = (st.chairModelBreakdown || [])
      .filter(ch => ch.surplus > 0)
      .map(ch => `${ch.model} (${ch.surplus}張)`);
    if (surplusChairs.length > 0) {
      parts.push(`多椅: ${surplusChairs.join('、')} 可調出`);
    } else {
      parts.push(`多椅 ${st.chairDifference}張 可調出`);
    }
  }

  return parts.length > 0 ? parts.join(' ； ') : '無多餘 (無釋出需求)';
}

/**
 * 取得短缺需撥補之型號清單文字
 */
export function getShortageItemsText(c: Classroom, st: InventoryStatus): string {
  if (!c.reported) return '尚未填報';
  const parts: string[] = [];

  if (st.deskDifference < 0) {
    parts.push(`缺桌子 ${Math.abs(st.deskDifference)}張 (待撥補)`);
  }
  if (st.chairDifference < 0) {
    parts.push(`缺椅子 ${Math.abs(st.chairDifference)}張 (待撥補)`);
  }

  return parts.length > 0 ? parts.join(' ； ') : '無短缺 (數量足夠)';
}

/**
 * 取得換型號 / 特殊調配需求文字 (支援多個型號需求)
 */
export function getExchangeNeedText(c: Classroom): string {
  if (!c.reported) return '尚未填報';
  if (!c.exchangeNeed || !c.exchangeNeed.hasNeed) {
    return '型號相符 (無換型號需求)';
  }

  const ex = c.exchangeNeed;
  const items = ex.items && ex.items.length > 0
    ? ex.items
    : [
        ...(ex.deskExchangeNeeded ? [{ type: 'desk' as const, model: ex.targetDeskModel || '#130', quantity: ex.targetDeskQuantity || 1 }] : []),
        ...(ex.chairExchangeNeeded ? [{ type: 'chair' as const, model: ex.targetChairModel || '#125-#135', quantity: ex.targetChairQuantity || 1 }] : [])
      ];

  if (items.length === 0) {
    return '型號相符 (無換型號需求)';
  }

  const deskItems = items.filter(i => i.type === 'desk');
  const chairItems = items.filter(i => i.type === 'chair');

  const parts: string[] = [];
  if (deskItems.length > 0) {
    parts.push(`換桌: ${deskItems.map(d => `${d.model} x ${d.quantity}張`).join('、')}`);
  }
  if (chairItems.length > 0) {
    parts.push(`換椅: ${chairItems.map(ch => `${ch.model} x ${ch.quantity}張`).join('、')}`);
  }
  if (ex.reason) {
    parts.push(`[原因: ${ex.reason}]`);
  }

  return parts.length > 0 ? `🏷️ 需換型號: ${parts.join(' ； ')}` : '型號相符 (無換型號需求)';
}

/**
 * 取得【搬運】調度需求與配置綜合明細
 */
export function getLogisticsPlanText(c: Classroom, st: InventoryStatus): string {
  if (!c.reported) return '⏳ 待班級填報確認';
  if (c.isCompleted) return '✅ 搬運補齊已完成 (無需再搬)';

  const tasks: string[] = [];

  // 1. 短缺撥補搬運需求
  if (st.deskDifference < 0 || st.chairDifference < 0) {
    const shortageDesc = [];
    if (st.deskDifference < 0) shortageDesc.push(`調入桌子 ${Math.abs(st.deskDifference)}張`);
    if (st.chairDifference < 0) shortageDesc.push(`調入椅子 ${Math.abs(st.chairDifference)}張`);
    tasks.push(`【待撥補調入】需由庫房或他班${shortageDesc.join('、')}`);
  }

  // 2. 多餘調出搬運需求
  if (st.deskDifference > 0 || st.chairDifference > 0) {
    const surplusDesc = [];
    if (st.deskDifference > 0) surplusDesc.push(`桌子 ${st.deskDifference}張`);
    if (st.chairDifference > 0) surplusDesc.push(`椅子 ${st.chairDifference}張`);
    tasks.push(`【可調出搬移】有多餘${surplusDesc.join('、')}可搬移支援他班`);
  }

  // 3. 換型號特殊調配 (支援多個型號需求)
  if (c.exchangeNeed?.hasNeed) {
    const ex = c.exchangeNeed;
    const items = ex.items && ex.items.length > 0
      ? ex.items
      : [
          ...(ex.deskExchangeNeeded ? [{ type: 'desk' as const, model: ex.targetDeskModel || '#130', quantity: ex.targetDeskQuantity || 1 }] : []),
          ...(ex.chairExchangeNeeded ? [{ type: 'chair' as const, model: ex.targetChairModel || '#125-#135', quantity: ex.targetChairQuantity || 1 }] : [])
        ];

    if (items.length > 0) {
      const summary = items.map(i => `${i.type === 'desk' ? '桌' : '椅'}${i.model} x ${i.quantity}張`).join('、');
      tasks.push(`【換型號調配】需對調更換 ${summary}`);
    }
  }

  if (tasks.length === 0) {
    return '🟢 桌椅相符，無需搬運調度';
  }

  return tasks.join(' ｜ ');
}

/**
 * 取得搬運進度狀態標籤
 */
export function getLogisticsStatusText(c: Classroom, st: InventoryStatus): string {
  if (!c.reported) return '待填報';
  if (c.isCompleted) return '已完成';
  const hasNeed = st.deskDifference !== 0 || st.chairDifference !== 0 || Boolean(c.exchangeNeed?.hasNeed);
  return hasNeed ? '待搬運調度' : '無需搬運';
}

/**
 * 將單一 Classroom 轉化為完整 Sheet 行物件
 */
export function transformClassroomToSheetRow(c: Classroom): ClassroomSheetRow {
  const st = calculateInventoryStatus(c);
  const deskListText = c.deskEntries.length > 0
    ? c.deskEntries.map(d => `型號 ${d.model}: ${d.quantity}張`).join(' ; ')
    : (c.reported ? '0張 (無桌子)' : '尚未填報');

  const chairListText = c.chairEntries.length > 0
    ? c.chairEntries.map(ch => `型號 ${ch.model}: ${ch.quantity}張`).join(' ; ')
    : (c.reported ? '0張 (無椅子)' : '尚未填報');

  return {
    id: c.id,
    floor: c.floor,
    name: c.name + (c.titleExtra ? ` ${c.titleExtra}` : ''),
    teacher: c.teacher,
    extension: c.extension,
    studentCount: c.studentCount,
    reportedStatus: c.reported ? '已填報' : '待填報',
    auditResult: getAuditResult(c, st),
    totalDesks: c.reported ? st.totalDesks : 0,
    deskDiffText: c.reported ? getDifferenceText(st.deskDifference, '桌') : '未填報',
    deskListText,
    totalChairs: c.reported ? st.totalChairs : 0,
    chairDiffText: c.reported ? getDifferenceText(st.chairDifference, '椅') : '未填報',
    chairListText,
    surplusItemsText: getSurplusItemsText(c, st),
    shortageItemsText: getShortageItemsText(c, st),
    exchangeNeedText: getExchangeNeedText(c),
    logisticsPlanText: getLogisticsPlanText(c, st),
    logisticsStatusText: getLogisticsStatusText(c, st),
    note: c.note || '',
    lastUpdated: c.lastUpdated || (c.reported ? new Date().toLocaleString('zh-TW') : '')
  };
}

/**
 * 將從 Google Apps Script 雲端資料庫抓取的資料進行解析並整併至現有班級清單
 */
export function mergeCloudClassrooms(
  localClassrooms: Classroom[],
  cloudData: any
): { merged: Classroom[]; updatedCount: number; transferLogs?: TransferLog[] } {
  if (!cloudData) {
    return { merged: localClassrooms, updatedCount: 0 };
  }

  // 情況 1: 直接回傳 classrooms 陣列 (精確度最高，包含完整 deskEntries / exchangeItems)
  const incomingClassrooms: Classroom[] = Array.isArray(cloudData.classrooms)
    ? cloudData.classrooms
    : Array.isArray(cloudData)
    ? cloudData
    : [];

  const incomingLogs: TransferLog[] | undefined = Array.isArray(cloudData.transferLogs)
    ? cloudData.transferLogs
    : undefined;

  if (incomingClassrooms.length > 0) {
    let updatedCount = 0;
    const cloudMap = new Map<string, Classroom>();
    incomingClassrooms.forEach(c => {
      if (c && c.id) cloudMap.set(String(c.id).trim(), c);
    });

    const merged = localClassrooms.map(local => {
      const cloud = cloudMap.get(String(local.id).trim());
      if (cloud) {
        updatedCount++;
        return {
          ...local,
          ...cloud,
          // 保留未填報狀態的乾淨預設值
          studentCount: typeof cloud.studentCount === 'number' ? cloud.studentCount : local.studentCount,
          deskEntries: Array.isArray(cloud.deskEntries) ? cloud.deskEntries : local.deskEntries,
          chairEntries: Array.isArray(cloud.chairEntries) ? cloud.chairEntries : local.chairEntries,
          exchangeNeed: cloud.exchangeNeed || local.exchangeNeed,
          reported: Boolean(cloud.reported),
          isCompleted: Boolean(cloud.isCompleted)
        };
      }
      return local;
    });

    return { merged, updatedCount, transferLogs: incomingLogs };
  }

  // 情況 2: 從 Sheet 二維陣列 (rows: [["班級代號", ...], ...]) 解析
  const rows: any[][] = Array.isArray(cloudData.rows)
    ? cloudData.rows
    : Array.isArray(cloudData.data)
    ? cloudData.data
    : [];

  if (rows.length > 2) {
    let updatedCount = 0;
    const rowMap = new Map<string, any[]>();
    for (let i = 2; i < rows.length; i++) {
      const row = rows[i];
      if (row && row[0]) {
        rowMap.set(String(row[0]).trim(), row);
      }
    }

    const merged = localClassrooms.map(local => {
      const row = rowMap.get(String(local.id).trim());
      if (row) {
        updatedCount++;
        const studentCount = parseInt(row[5], 10) || local.studentCount;
        const reportedStr = String(row[6] || '');
        const isReported = reportedStr.includes('已填報') || studentCount > 0;
        const isCompleted = String(row[18] || '').includes('已完成');
        const note = String(row[19] || '');
        const lastUpdated = String(row[20] || '');

        return {
          ...local,
          studentCount,
          reported: isReported,
          isCompleted,
          note: note || local.note,
          lastUpdated: lastUpdated || local.lastUpdated
        };
      }
      return local;
    });

    return { merged, updatedCount, transferLogs: incomingLogs };
  }

  return { merged: localClassrooms, updatedCount: 0, transferLogs: incomingLogs };
}

