
import { DailyLog, CustomTask, SectionType } from '../types';
import { SYNC_MAPPINGS } from '../constants';

export const calculateScore = (log: DailyLog, customTasks: CustomTask[]) => {
  let currentScore = 0;
  const fardIds = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  fardIds.forEach(id => currentScore += log.prayers.includes(id) ? 10 : -10);
  
  const syncedTargets = Object.values(SYNC_MAPPINGS).map(m => m.target);
  const filteredPrayers = log.prayers.filter(id => !fardIds.includes(id) && !syncedTargets.includes(id));
  const filteredAzkar = log.azkar.filter(id => !syncedTargets.includes(id));

  currentScore += (filteredPrayers.length + filteredAzkar.length + log.goodDeeds.length + log.notes.length) * 10;
  currentScore -= (log.mujahada.length + log.mujahadaNotes.length) * 10;
  
  // Nawafil count points
  currentScore += (log.nawafilCount || 0) * 10;

  // Custom tasks scoring
  log.customTaskIds.forEach(id => {
    const task = customTasks.find(t => t.id === id);
    if (task) {
      if (task.section === SectionType.MUJAHADA) {
        currentScore -= 10;
      } else {
        currentScore += 10;
      }
    }
  });

  const readToday = Math.max(0, log.quranEnd - log.quranStart);
  if (readToday > 0) currentScore += 10;
  if (log.quranTadabburNote) currentScore += 10;
  if (log.quranActionNote) currentScore += 10;
  if (log.quranListening) currentScore += 10;
  if (log.quranSujudCount > 0) currentScore += 10;

  return currentScore;
};
