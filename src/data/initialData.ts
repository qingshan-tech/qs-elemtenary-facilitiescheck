import { Classroom, DeskModelSpec, ChairModelSpec, InventoryStatus } from '../types';

// 桌子型號對照資料 (根據 desk_size.jpg)
export const DESK_SPECS: DeskModelSpec[] = [
  { model: '#110', colorName: '乳黃', hexColor: '#FDE047', textColor: '#854D0E', heightRange: '106 ~ 113', extRange: '103 ~ 118', gradeRange: '國小低', isDiscontinued: true },
  { model: '#115', colorName: '土黃', hexColor: '#EAB308', textColor: '#713F12', heightRange: '111 ~ 118', extRange: '108 ~ 123', gradeRange: '國小低' },
  { model: '#120', colorName: '茶', hexColor: '#B45309', textColor: '#FFFFFF', heightRange: '116 ~ 123', extRange: '113 ~ 128', gradeRange: '國小低' },
  { model: '#125', colorName: '淡藍', hexColor: '#38BDF8', textColor: '#0C4A6E', heightRange: '121 ~ 133', extRange: '118 ~ 138', gradeRange: '國小中低' },
  { model: '#130', colorName: '藍', hexColor: '#0284C7', textColor: '#FFFFFF', heightRange: '126 ~ 138', extRange: '123 ~ 143', gradeRange: '國小中低' },
  { model: '#135', colorName: '深藍', hexColor: '#1E3A8A', textColor: '#FFFFFF', heightRange: '131 ~ 143', extRange: '128 ~ 148', gradeRange: '國小中' },
  { model: '#140', colorName: '紅', hexColor: '#EF4444', textColor: '#FFFFFF', heightRange: '136 ~ 148', extRange: '133 ~ 153', gradeRange: '國小中' },
  { model: '#145', colorName: '橙', hexColor: '#F97316', textColor: '#FFFFFF', heightRange: '141 ~ 153', extRange: '138 ~ 158', gradeRange: '國小中高' },
  { model: '#150', colorName: '黃', hexColor: '#FACC15', textColor: '#713F12', heightRange: '146 ~ 158', extRange: '143 ~ 163', gradeRange: '國小高' },
  { model: '#155', colorName: '翠綠', hexColor: '#10B981', textColor: '#FFFFFF', heightRange: '151 ~ 163', extRange: '148 ~ 168', gradeRange: '國小高' },
  { model: '#160', colorName: '綠', hexColor: '#15803D', textColor: '#FFFFFF', heightRange: '156 ~ 168', extRange: '153 ~ 173', gradeRange: '國小高/國中' },
  { model: '#165', colorName: '墨綠', hexColor: '#064E3B', textColor: '#FFFFFF', heightRange: '161 ~ 173', extRange: '158 ~ 178', gradeRange: '國中' },
  { model: '#170', colorName: '暗紅', hexColor: '#881337', textColor: '#FFFFFF', heightRange: '166 ~ 178', extRange: '163 ~ 183', gradeRange: '國中/高中' },
  { model: '#175', colorName: '白', hexColor: '#F1F5F9', textColor: '#0F172A', heightRange: '171 ~ 183', extRange: '168 ~ 188', gradeRange: '高中職' },
  { model: '#180', colorName: '黑', hexColor: '#1E293B', textColor: '#FFFFFF', heightRange: '176 ~ 188', extRange: '173 ~ 193', gradeRange: '高中職' }
];

// 椅子型號對照資料
export const CHAIR_SPECS: ChairModelSpec[] = [
  { model: '#110-#120', heightRange: '106 ~ 123', gradeRange: '國小低年級' },
  { model: '#125-#135', heightRange: '121 ~ 148', gradeRange: '國小中低年級' },
  { model: '#140-#150', heightRange: '136 ~ 163', gradeRange: '國小中高年級' },
  { model: '#155-#165', heightRange: '151 ~ 178', gradeRange: '國小高年級/國中' },
  { model: '#170-#180', heightRange: '166 ~ 193', gradeRange: '國中/高中職' }
];

// 新北市立青山國民中小學 115學年度國小部班級預設清單 (全數設定為待填報，零人工造假數據)
export const INITIAL_CLASSROOMS: Classroom[] = [
  // 1F
  {
    id: '101',
    name: '101導師',
    titleExtra: '',
    teacher: '馬欣吟',
    floor: '1F',
    extension: '812',
    studentCount: 0,
    reported: false,
    isCompleted: false,
    deskEntries: [],
    chairEntries: [],
    note: '',
    lastUpdated: ''
  },
  {
    id: '102',
    name: '102導師',
    titleExtra: '',
    teacher: '楊惠玲',
    floor: '1F',
    extension: '813',
    studentCount: 0,
    reported: false,
    isCompleted: false,
    deskEntries: [],
    chairEntries: [],
    note: '',
    lastUpdated: ''
  },
  {
    id: '103',
    name: '103導師',
    titleExtra: '',
    teacher: '余素英',
    floor: '1F',
    extension: '814',
    studentCount: 0,
    reported: false,
    isCompleted: false,
    deskEntries: [],
    chairEntries: [],
    note: '',
    lastUpdated: ''
  },

  // 2F
  {
    id: '201',
    name: '201導師',
    titleExtra: '',
    teacher: '王學靜',
    floor: '2F',
    extension: '822',
    studentCount: 0,
    reported: false,
    isCompleted: false,
    deskEntries: [],
    chairEntries: [],
    note: '',
    lastUpdated: ''
  },
  {
    id: '202',
    name: '202導師',
    titleExtra: '',
    teacher: '周心心',
    floor: '2F',
    extension: '823',
    studentCount: 0,
    reported: false,
    isCompleted: false,
    deskEntries: [],
    chairEntries: [],
    note: '',
    lastUpdated: ''
  },
  {
    id: '203',
    name: '203導師',
    titleExtra: '',
    teacher: '陳彥如',
    floor: '2F',
    extension: '824',
    studentCount: 0,
    reported: false,
    isCompleted: false,
    deskEntries: [],
    chairEntries: [],
    note: '',
    lastUpdated: ''
  },

  // 3F
  {
    id: '301',
    name: '301導師',
    titleExtra: '',
    teacher: '陳虹燁',
    floor: '3F',
    extension: '832',
    studentCount: 0,
    reported: false,
    isCompleted: false,
    deskEntries: [],
    chairEntries: [],
    note: '',
    lastUpdated: ''
  },
  {
    id: '302',
    name: '302導師',
    titleExtra: '',
    teacher: '蔡惠如',
    floor: '3F',
    extension: '833',
    studentCount: 0,
    reported: false,
    isCompleted: false,
    deskEntries: [],
    chairEntries: [],
    note: '',
    lastUpdated: ''
  },
  {
    id: '303',
    name: '303導師(代)',
    titleExtra: '',
    teacher: '潘怡甄',
    floor: '3F',
    extension: '834',
    studentCount: 0,
    reported: false,
    isCompleted: false,
    deskEntries: [],
    chairEntries: [],
    note: '',
    lastUpdated: ''
  },
  {
    id: '601',
    name: '601導師(代)',
    titleExtra: '(商借)',
    teacher: '王文玲',
    floor: '3F',
    extension: '831',
    studentCount: 0,
    reported: false,
    isCompleted: false,
    deskEntries: [],
    chairEntries: [],
    note: '',
    lastUpdated: ''
  },

  // 4F
  {
    id: '401',
    name: '401導師(代)',
    titleExtra: '(商借)',
    teacher: '王文吟',
    floor: '4F',
    extension: '842',
    studentCount: 0,
    reported: false,
    isCompleted: false,
    deskEntries: [],
    chairEntries: [],
    note: '',
    lastUpdated: ''
  },
  {
    id: '402',
    name: '402導師',
    titleExtra: '',
    teacher: '魏竹君',
    floor: '4F',
    extension: '843',
    studentCount: 0,
    reported: false,
    isCompleted: false,
    deskEntries: [],
    chairEntries: [],
    note: '',
    lastUpdated: ''
  },
  {
    id: '403',
    name: '403導師',
    titleExtra: '',
    teacher: '周揚智',
    floor: '4F',
    extension: '844',
    studentCount: 0,
    reported: false,
    isCompleted: false,
    deskEntries: [],
    chairEntries: [],
    note: '',
    lastUpdated: ''
  },
  {
    id: '602',
    name: '602導師',
    titleExtra: '',
    teacher: '陳安柔',
    floor: '4F',
    extension: '841',
    studentCount: 0,
    reported: false,
    isCompleted: false,
    deskEntries: [],
    chairEntries: [],
    note: '',
    lastUpdated: ''
  },

  // 5F
  {
    id: '501',
    name: '501導師',
    titleExtra: '',
    teacher: '王怡君',
    floor: '5F',
    extension: '852',
    studentCount: 0,
    reported: false,
    isCompleted: false,
    deskEntries: [],
    chairEntries: [],
    note: '',
    lastUpdated: ''
  },
  {
    id: '502',
    name: '502導師(代)',
    titleExtra: '',
    teacher: '葉惠娟',
    floor: '5F',
    extension: '853',
    studentCount: 0,
    reported: false,
    isCompleted: false,
    deskEntries: [],
    chairEntries: [],
    note: '',
    lastUpdated: ''
  },
  {
    id: '503',
    name: '503導師',
    titleExtra: '',
    teacher: '楊曼玓',
    floor: '5F',
    extension: '854',
    studentCount: 0,
    reported: false,
    isCompleted: false,
    deskEntries: [],
    chairEntries: [],
    note: '',
    lastUpdated: ''
  },
  {
    id: '603',
    name: '603導師',
    titleExtra: '',
    teacher: '江淑卿',
    floor: '5F',
    extension: '851',
    studentCount: 0,
    reported: false,
    isCompleted: false,
    deskEntries: [],
    chairEntries: [],
    note: '',
    lastUpdated: ''
  }
];

// 計算班級桌椅差異與 Tag
export function calculateInventoryStatus(classroom: Classroom): InventoryStatus {
  if (!classroom.reported) {
    return {
      totalDesks: 0,
      totalChairs: 0,
      deskDifference: -classroom.studentCount,
      chairDifference: -classroom.studentCount,
      deskTag: '尚未填報',
      chairTag: '尚未填報'
    };
  }

  const totalDesks = classroom.deskEntries.reduce((sum, d) => sum + d.quantity, 0);
  const totalChairs = classroom.chairEntries.reduce((sum, d) => sum + d.quantity, 0);

  const deskDifference = totalDesks - classroom.studentCount;
  const chairDifference = totalChairs - classroom.studentCount;

  // 計算每一型號桌子的使用量與多餘量
  let remainingDeskDemand = classroom.studentCount;
  const deskModelBreakdown = classroom.deskEntries.map(d => {
    const used = Math.min(d.quantity, remainingDeskDemand);
    remainingDeskDemand = Math.max(0, remainingDeskDemand - used);
    const surplus = d.quantity - used;
    return {
      model: d.model,
      quantity: d.quantity,
      used,
      surplus
    };
  });

  // 計算每一型號椅子的使用量與多餘量
  let remainingChairDemand = classroom.studentCount;
  const chairModelBreakdown = classroom.chairEntries.map(c => {
    const used = Math.min(c.quantity, remainingChairDemand);
    remainingChairDemand = Math.max(0, remainingChairDemand - used);
    const surplus = c.quantity - used;
    return {
      model: c.model,
      quantity: c.quantity,
      used,
      surplus
    };
  });

  let deskTag = '桌子數量正確';
  if (deskDifference < 0) {
    deskTag = `需要桌子 ${Math.abs(deskDifference)} 張`;
  } else if (deskDifference > 0) {
    deskTag = `有多桌子 ${deskDifference} 張`;
  }

  let chairTag = '椅子數量正確';
  if (chairDifference < 0) {
    chairTag = `需要椅子 ${Math.abs(chairDifference)} 張`;
  } else if (chairDifference > 0) {
    chairTag = `有多椅子 ${chairDifference} 張`;
  }

  return {
    totalDesks,
    totalChairs,
    deskDifference,
    chairDifference,
    deskTag,
    chairTag,
    deskModelBreakdown,
    chairModelBreakdown
  };
}

// 預設跨班調配紀錄 (初始無假資料)
export const INITIAL_TRANSFER_LOGS: any[] = [];

