import { DeskSpec, ChairSpec, DeskModel, ChairModel } from '../types';

export const DESK_SPECS: DeskSpec[] = [
  {
    model: '#110',
    colorName: '乳黃',
    colorHex: '#FDE68A',
    chairModel: '#110-#120',
    heightRange: '106 ~ 113',
    extendRange: '103 ~ 118',
    gradeLabel: '國小低年級 (已停產)',
    discontinued: true,
  },
  {
    model: '#115',
    colorName: '土黃',
    colorHex: '#D97706',
    chairModel: '#110-#120',
    heightRange: '111 ~ 118',
    extendRange: '108 ~ 123',
    gradeLabel: '國小低年級',
  },
  {
    model: '#120',
    colorName: '茶色',
    colorHex: '#78350F',
    chairModel: '#110-#120',
    heightRange: '116 ~ 123',
    extendRange: '113 ~ 128',
    gradeLabel: '國小低年級',
  },
  {
    model: '#125',
    colorName: '淡藍',
    colorHex: '#93C5FD',
    chairModel: '#125-#135',
    heightRange: '121 ~ 133',
    extendRange: '118 ~ 138',
    gradeLabel: '國小低年級',
  },
  {
    model: '#130',
    colorName: '藍色',
    colorHex: '#3B82F6',
    chairModel: '#125-#135',
    heightRange: '126 ~ 138',
    extendRange: '123 ~ 143',
    gradeLabel: '國小低年級 / 中年級',
  },
  {
    model: '#135',
    colorName: '深藍',
    colorHex: '#1E3A8A',
    chairModel: '#125-#135',
    heightRange: '131 ~ 143',
    extendRange: '128 ~ 148',
    gradeLabel: '國小中年級',
  },
  {
    model: '#140',
    colorName: '紅色',
    colorHex: '#EF4444',
    chairModel: '#140-#150',
    heightRange: '136 ~ 148',
    extendRange: '133 ~ 153',
    gradeLabel: '國小中年級',
  },
  {
    model: '#145',
    colorName: '橙色',
    colorHex: '#F97316',
    chairModel: '#140-#150',
    heightRange: '141 ~ 153',
    extendRange: '138 ~ 158',
    gradeLabel: '國小中年級 / 高年級',
  },
  {
    model: '#150',
    colorName: '黃色',
    colorHex: '#EAB308',
    chairModel: '#140-#150',
    heightRange: '146 ~ 158',
    extendRange: '143 ~ 163',
    gradeLabel: '國小高年級',
  },
  {
    model: '#155',
    colorName: '翠綠',
    colorHex: '#10B981',
    chairModel: '#155-#165',
    heightRange: '151 ~ 163',
    extendRange: '148 ~ 168',
    gradeLabel: '國小高年級',
  },
  {
    model: '#160',
    colorName: '綠色',
    colorHex: '#15803D',
    chairModel: '#155-#165',
    heightRange: '156 ~ 168',
    extendRange: '153 ~ 173',
    gradeLabel: '國小高年級 / 國中',
  },
  {
    model: '#165',
    colorName: '墨綠',
    colorHex: '#064E3B',
    chairModel: '#155-#165',
    heightRange: '161 ~ 173',
    extendRange: '158 ~ 178',
    gradeLabel: '國中 / 高中職',
  },
  {
    model: '#170',
    colorName: '暗紅',
    colorHex: '#881337',
    chairModel: '#170-#180',
    heightRange: '166 ~ 178',
    extendRange: '163 ~ 183',
    gradeLabel: '高中職',
  },
  {
    model: '#175',
    colorName: '白色',
    colorHex: '#F3F4F6',
    chairModel: '#170-#180',
    heightRange: '171 ~ 183',
    extendRange: '168 ~ 188',
    gradeLabel: '高中職',
  },
  {
    model: '#180',
    colorName: '黑色',
    colorHex: '#111827',
    chairModel: '#170-#180',
    heightRange: '176 ~ 188',
    extendRange: '173 ~ 193',
    gradeLabel: '高中職',
  },
];

export const CHAIR_SPECS: ChairSpec[] = [
  {
    model: '#110-#120',
    colorHex: '#78350F',
    heightRange: '106 ~ 123 cm',
    gradeLabel: '國小低年級 (對應 #110~#120 桌)',
  },
  {
    model: '#125-#135',
    colorHex: '#3B82F6',
    heightRange: '121 ~ 143 cm',
    gradeLabel: '國小低~中年級 (對應 #125~#135 桌)',
  },
  {
    model: '#140-#150',
    colorHex: '#EF4444',
    heightRange: '136 ~ 158 cm',
    gradeLabel: '國小中~高年級 (對應 #140~#150 桌)',
  },
  {
    model: '#155-#165',
    colorHex: '#15803D',
    heightRange: '151 ~ 173 cm',
    gradeLabel: '國小高年級 (對應 #155~#165 桌)',
  },
  {
    model: '#170-#180',
    colorHex: '#881337',
    heightRange: '166 ~ 188 cm',
    gradeLabel: '國中/高中職 (對應 #170~#180 桌)',
  },
];

export function getRecommendedModels(grade: number): { desk: DeskModel; chair: ChairModel } {
  if (grade === 1 || grade === 2) {
    return { desk: '#130', chair: '#125-#135' };
  } else if (grade === 3 || grade === 4) {
    return { desk: '#145', chair: '#140-#150' };
  } else {
    // Grade 5, 6 or others
    return { desk: '#155', chair: '#155-#165' };
  }
}
