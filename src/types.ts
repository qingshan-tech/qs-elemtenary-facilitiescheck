export type DeskModel = 
  | '#110' | '#115' | '#120' | '#125' 
  | '#130' | '#135' | '#140' | '#145' 
  | '#150' | '#155' | '#160' | '#165' 
  | '#170' | '#175' | '#180';

export type ChairModel = 
  | '#110-#120' 
  | '#125-#135' 
  | '#140-#150' 
  | '#155-#165' 
  | '#170-#180';

export interface DeskSpec {
  model: DeskModel;
  colorName: string;
  colorHex: string;
  chairModel: ChairModel;
  heightRange: string;
  extendRange: string;
  gradeLabel: string;
  discontinued?: boolean;
}

export interface ChairSpec {
  model: ChairModel;
  colorHex: string;
  heightRange: string;
  gradeLabel: string;
}

export type InventoryStatus = '未填報' | '已填報待處理' | '搬運協調中' | '已完成';

export interface ModelCount<T extends string> {
  model: T;
  quantity: number;
}

export interface ClassRoom {
  id: string;            // e.g. "101", "302", "spec_1"
  name: string;          // e.g. "1年1班", "3年2班"
  grade: number;         // 1-6 or 0 for special
  floor: number;         // 1 to 5
  teacher: string;       // e.g. "張美玲 老師"
  studentsCount: number; // e.g. 25
  desks: ModelCount<DeskModel>[];
  chairs: ModelCount<ChairModel>[];
  status: InventoryStatus;
  updatedAt?: string;
  notes?: string;
  recommendedDeskModel: DeskModel;   // Recommended desk model for this grade
  recommendedChairModel: ChairModel; // Recommended chair model for this grade
}

export interface TransferMatch {
  id: string;
  fromClassId: string;
  fromClassName: string;
  fromFloor: number;
  toClassId: string;
  toClassName: string;
  toFloor: number;
  itemType: 'desk' | 'chair';
  model: string;
  quantity: number;
  isSameFloor: boolean;
  status: '待調撥' | '搬運中' | '已完成';
}

export interface GoogleSheetConfig {
  webAppUrl: string;
  spreadsheetId: string;
  sheetName: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}
