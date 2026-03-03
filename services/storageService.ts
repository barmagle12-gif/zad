
import { DailyLog } from '../types';
import { getFajrTime } from './prayerTimes';

const STORAGE_KEY = 'zad_almuslim_logs';
const CUSTOM_TASKS_KEY = 'zad_almuslim_custom_tasks';

/**
 * يحصل على التاريخ "المنطقي" لليوم.
 * اليوم الجديد يبدأ مع صلاة الفجر وليس منتصف الليل.
 */
export const getLogicalToday = (): Date => {
  const now = new Date();
  const fajr = getFajrTime(now);
  
  const fajrToday = new Date(now);
  fajrToday.setHours(fajr.hours, fajr.minutes, 0, 0);
  
  if (now.getTime() < fajrToday.getTime()) {
    // قبل الفجر، نعتبر أننا ما زلنا في "أمس" منطقياً
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    return yesterday;
  }
  return now;
};

export const getLogs = (): Record<string, DailyLog> => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};

export const saveLog = (log: DailyLog) => {
  const logs = getLogs();
  logs[log.date] = log;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
};

export const getLogForDate = (date: string): DailyLog => {
  const logs = getLogs();
  if (logs[date]) {
    const log = logs[date];
    // Migration/Defaults for new fields
    return {
      ...log,
      mujahadaNotes: log.mujahadaNotes || [],
      quranTadabburNote: log.quranTadabburNote || "",
      quranActionNote: log.quranActionNote || "",
      quranListening: log.quranListening || false,
      quranSujudCount: log.quranSujudCount || 0,
      quranGoal: log.quranGoal || 1,
      nawafilCount: log.nawafilCount || 0,
      customTaskIds: log.customTaskIds || []
    };
  }
  
  // إذا كان اليوم جديداً، نبحث عن آخر صفحة وصل إليها في السجلات السابقة
  const allDates = Object.keys(logs).sort();
  const previousDates = allDates.filter(d => d < date);
  const lastQuranEnd = previousDates.length > 0 ? logs[previousDates[previousDates.length - 1]].quranEnd : 0;

  return {
    date,
    prayers: [],
    azkar: [],
    goodDeeds: [],
    mujahada: [],
    quranStart: lastQuranEnd, // جلب صفحة النهاية من آخر سجل متاح
    quranEnd: lastQuranEnd,
    quranTadabburNote: "",
    quranActionNote: "",
    quranListening: false,
    quranSujudCount: 0,
    quranGoal: 1,
    nawafilCount: 0,
    notes: [],
    mujahadaNotes: [],
    customTaskIds: []
  };
};

export const getCustomTasks = (): import('../types').CustomTask[] => {
  const data = localStorage.getItem(CUSTOM_TASKS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveCustomTask = (task: import('../types').CustomTask) => {
  const tasks = getCustomTasks();
  tasks.push(task);
  localStorage.setItem(CUSTOM_TASKS_KEY, JSON.stringify(tasks));
};

export const deleteCustomTask = (id: string) => {
  const tasks = getCustomTasks();
  const filtered = tasks.filter(t => t.id !== id);
  localStorage.setItem(CUSTOM_TASKS_KEY, JSON.stringify(filtered));
};

export const formatDate = (date: Date): string => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

export { getFajrTime };

export const exportData = (): string => {
  const logs = getLogs();
  const customTasks = getCustomTasks();
  return JSON.stringify({ logs, customTasks, version: '1.0' }, null, 2);
};

export const importData = (jsonData: string) => {
  try {
    const data = JSON.parse(jsonData);
    if (data.logs) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.logs));
    }
    if (data.customTasks) {
      localStorage.setItem(CUSTOM_TASKS_KEY, JSON.stringify(data.customTasks));
    }
    return true;
  } catch (e) {
    console.error('Import failed', e);
    return false;
  }
};

/**
 * Ensure the app has persistent storage keys initialized on first run.
 * This writes explicit objects to localStorage so the app will work
 * fully offline after the first local write.
 */
export const initAppStorage = () => {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({}));
    }

    const existingTasks = localStorage.getItem(CUSTOM_TASKS_KEY);
    if (!existingTasks) {
      localStorage.setItem(CUSTOM_TASKS_KEY, JSON.stringify([]));
    }
  } catch (e) {
    console.error('Failed to initialize app storage', e);
  }
};
