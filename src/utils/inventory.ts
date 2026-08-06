import { ClassRoom, TransferMatch, DeskModel, ChairModel } from '../types';
import { DESK_SPECS } from '../data/deskChart';

export interface ClassInventorySummary {
  totalDesks: number;
  totalChairs: number;
  deskDiff: number; // positive = surplus, negative = shortage
  chairDiff: number;
  deskTag: { text: string; type: 'correct' | 'shortage' | 'surplus' | 'unreported' };
  chairTag: { text: string; type: 'correct' | 'shortage' | 'surplus' | 'unreported' };
  isComplete: boolean;
}

export function getClassInventorySummary(c: ClassRoom): ClassInventorySummary {
  if (c.status === '未填報' && c.desks.length === 0 && c.chairs.length === 0) {
    return {
      totalDesks: 0,
      totalChairs: 0,
      deskDiff: 0,
      chairDiff: 0,
      deskTag: { text: '未填報桌子', type: 'unreported' },
      chairTag: { text: '未填報椅子', type: 'unreported' },
      isComplete: false,
    };
  }

  const totalDesks = c.desks.reduce((acc, item) => acc + item.quantity, 0);
  const totalChairs = c.chairs.reduce((acc, item) => acc + item.quantity, 0);
  const deskDiff = totalDesks - c.studentsCount;
  const chairDiff = totalChairs - c.studentsCount;

  let deskTagText = '';
  let deskType: 'correct' | 'shortage' | 'surplus' | 'unreported' = 'correct';
  if (deskDiff === 0) {
    deskTagText = '桌子數量正確';
    deskType = 'correct';
  } else if (deskDiff < 0) {
    deskTagText = `需要桌子 ${Math.abs(deskDiff)} 張`;
    deskType = 'shortage';
  } else {
    deskTagText = `有多桌子 ${deskDiff} 張`;
    deskType = 'surplus';
  }

  let chairTagText = '';
  let chairType: 'correct' | 'shortage' | 'surplus' | 'unreported' = 'correct';
  if (chairDiff === 0) {
    chairTagText = '椅子數量正確';
    chairType = 'correct';
  } else if (chairDiff < 0) {
    chairTagText = `需要椅子 ${Math.abs(chairDiff)} 張`;
    chairType = 'shortage';
  } else {
    chairTagText = `有多椅子 ${chairDiff} 張`;
    chairType = 'surplus';
  }

  const isComplete = c.status === '已完成';

  return {
    totalDesks,
    totalChairs,
    deskDiff,
    chairDiff,
    deskTag: { text: deskTagText, type: deskType },
    chairTag: { text: chairTagText, type: chairType },
    isComplete,
  };
}

export function findMatchingTransfers(classes: ClassRoom[]): TransferMatch[] {
  const matches: TransferMatch[] = [];

  // Identify shortage classes & surplus classes for desks
  classes.forEach((targetClass) => {
    const targetSummary = getClassInventorySummary(targetClass);
    if (targetSummary.deskDiff < 0) {
      const neededCount = Math.abs(targetSummary.deskDiff);
      // Find a class with surplus desks
      const surplusClass = classes.find((sourceClass) => {
        if (sourceClass.id === targetClass.id) return false;
        const sourceSummary = getClassInventorySummary(sourceClass);
        return sourceSummary.deskDiff > 0;
      });

      if (surplusClass) {
        const sourceSummary = getClassInventorySummary(surplusClass);
        const qty = Math.min(neededCount, sourceSummary.deskDiff);
        const deskModel = surplusClass.desks[0]?.model || targetClass.recommendedDeskModel;
        matches.push({
          id: `desk-${surplusClass.id}-${targetClass.id}`,
          fromClassId: surplusClass.id,
          fromClassName: surplusClass.name,
          fromFloor: surplusClass.floor,
          toClassId: targetClass.id,
          toClassName: targetClass.name,
          toFloor: targetClass.floor,
          itemType: 'desk',
          model: deskModel,
          quantity: qty,
          isSameFloor: surplusClass.floor === targetClass.floor,
          status: '待調撥',
        });
      }
    }

    // Chair matching
    if (targetSummary.chairDiff < 0) {
      const neededCount = Math.abs(targetSummary.chairDiff);
      const surplusClass = classes.find((sourceClass) => {
        if (sourceClass.id === targetClass.id) return false;
        const sourceSummary = getClassInventorySummary(sourceClass);
        return sourceSummary.chairDiff > 0;
      });

      if (surplusClass) {
        const sourceSummary = getClassInventorySummary(surplusClass);
        const qty = Math.min(neededCount, sourceSummary.chairDiff);
        const chairModel = surplusClass.chairs[0]?.model || targetClass.recommendedChairModel;
        matches.push({
          id: `chair-${surplusClass.id}-${targetClass.id}`,
          fromClassId: surplusClass.id,
          fromClassName: surplusClass.name,
          fromFloor: surplusClass.floor,
          toClassId: targetClass.id,
          toClassName: targetClass.name,
          toFloor: targetClass.floor,
          itemType: 'chair',
          model: chairModel,
          quantity: qty,
          isSameFloor: surplusClass.floor === targetClass.floor,
          status: '待調撥',
        });
      }
    }
  });

  // Sort matches: Same floor first!
  return matches.sort((a, b) => (b.isSameFloor ? 1 : 0) - (a.isSameFloor ? 1 : 0));
}

export function generateCSVData(classes: ClassRoom[]): string {
  const headers = [
    '樓層',
    '班級名稱',
    '導師姓名',
    '應備需求組數',
    '桌子現有總數',
    '桌子型號細項',
    '桌子需求狀態',
    '椅子現有總數',
    '椅子型號細項',
    '椅子需求狀態',
    '填報狀態',
    '備註說明',
    '最後更新時間',
  ];

  const rows = classes.map((c) => {
    const summary = getClassInventorySummary(c);
    const deskDetails = c.desks.map((d) => `${d.model}:${d.quantity}張`).join('; ') || '無';
    const chairDetails = c.chairs.map((ch) => `${ch.model}:${ch.quantity}張`).join('; ') || '無';

    return [
      `${c.floor}樓`,
      c.name,
      c.teacher,
      c.studentsCount > 0 ? `${c.studentsCount}組` : '待確認',
      summary.totalDesks,
      deskDetails,
      summary.deskTag.text,
      summary.totalChairs,
      chairDetails,
      summary.chairTag.text,
      c.status,
      `"${(c.notes || '').replace(/"/g, '""')}"`,
      c.updatedAt || '',
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  return '\uFEFF' + csvContent; // UTF-8 BOM for Excel / Sheets
}

export function getDeskColorHex(model: string): string {
  const spec = DESK_SPECS.find((s) => s.model === model);
  return spec ? spec.colorHex : '#6B7280';
}

export function getDeskColorName(model: string): string {
  const spec = DESK_SPECS.find((s) => s.model === model);
  return spec ? `${spec.colorName} (${spec.model})` : model;
}
