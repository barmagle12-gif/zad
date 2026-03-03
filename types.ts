
export interface DailyLog {
  date: string;
  prayers: string[];
  azkar: string[];
  goodDeeds: string[];
  mujahada: string[];
  quranStart: number;
  quranEnd: number;
  quranTadabburNote: string;
  quranActionNote: string;
  quranListening: boolean;
  quranSujudCount: number;
  quranGoal: 1 | 2 | 3 | 4; // عدد الختمات المستهدفة في الشهر
  nawafilCount: number;
  notes: string[];
  mujahadaNotes: string[];
  customTaskIds: string[]; // IDs of custom tasks checked today
}

export interface CustomTask {
  id: string;
  label: string;
  section: SectionType;
}

export interface Quote {
  text: string;
  source: string;
}

export interface TaskItem {
  id: string;
  label: string;
  description?: string;
  verse?: string;
  hadith?: string;
}

export enum SectionType {
  PRAYER = 'PRAYER',
  AZKAR = 'AZKAR',
  QURAN = 'QURAN',
  GOOD_DEEDS = 'GOOD_DEEDS',
  MUJAHADA = 'MUJAHADA'
}
