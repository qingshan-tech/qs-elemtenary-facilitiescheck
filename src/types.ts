export interface DeskModelSpec {
  model: string;         // e.g. "#110"
  colorName: string;     // e.g. "乳黃"
  hexColor: string;      // e.g. "#FDF0A6"
  textColor: string;     // e.g. "#000000" or "#FFFFFF"
  heightRange: string;   // e.g. "106 ~ 113"
  extRange: string;      // e.g. "103 ~ 118"
  gradeRange: string;    // e.g. "國小低"
  isDiscontinued?: boolean; // 已停產
}

export interface ChairModelSpec {
  model: string;         // e.g. "#110-#120"
  heightRange: string;   // e.g. "106 ~ 123"
  gradeRange: string;    // e.g. "國小低"
}

export interface DeskEntry {
  model: string;
  quantity: number;
}

export interface ChairEntry {
  model: string;
  quantity: number;
}

export interface ExchangeNeed {
  hasNeed: boolean;             // 是否有換型號/調配需求
  deskExchangeNeeded?: boolean; // 桌子是否需要換型號
  targetDeskModel?: string;     // 想更換成的桌子型號
  targetDeskQuantity?: number;  // 想更換成的桌子張數
  chairExchangeNeeded?: boolean;// 椅子是否需要換型號
  targetChairModel?: string;    // 想更換成的椅子型號
  targetChairQuantity?: number; // 想更換成的椅子張數
  reason?: string;              // 換型號/調配原因說明
}

export interface Classroom {
  id: string;            // e.g. "101"
  name: string;          // e.g. "101導師"
  titleExtra?: string;   // e.g. "(學年主任)"
  teacher: string;       // e.g. "馬欣吟"
  floor: string;         // e.g. "1F"
  extension: string;     // e.g. "812"
  studentCount: number;  // 班級人數 (現有學生需求數)
  deskEntries: DeskEntry[];
  chairEntries: ChairEntry[];
  reported: boolean;     // 是否已填報
  isCompleted: boolean;  // 總務處/班級標記搬運補齊已完成
  note?: string;         // 備註說明
  exchangeNeed?: ExchangeNeed; // 換型號/調配需求細節
  lastUpdated?: string;
}

export interface TransferLog {
  id: string;
  fromClassId: string;
  fromClassName: string;
  toClassId: string;
  toClassName: string;
  type: 'desk' | 'chair';
  model: string;
  quantity: number;
  status: 'pending' | 'completed';
  timestamp: string;
  itemType?: string;
  note?: string;
}

export interface ModelBreakdown {
  model: string;
  quantity: number;
  used: number;
  surplus: number;
}

export interface InventoryStatus {
  totalDesks: number;
  totalChairs: number;
  deskDifference: number; // current - needed (positive = surplus, negative = shortage)
  chairDifference: number; // current - needed (positive = surplus, negative = shortage)
  deskTag: string; // e.g., "桌子數量正確", "需要桌子 2 張", "有多桌子 3 張"
  chairTag: string; // e.g., "椅子數量正確", "需要椅子 1 張", "有多椅子 2 張"
  deskModelBreakdown?: ModelBreakdown[];
  chairModelBreakdown?: ModelBreakdown[];
}
