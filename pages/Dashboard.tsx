
import React, { useState, useEffect, useMemo } from 'react';
import Icon from '../components/Icon';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PRAYER_TASKS, 
  AZKAR_CATEGORIES, 
  GOOD_DEED_CATEGORIES, 
  MUJAHADA_CATEGORIES, 
  MOTIVATIONAL_QUOTES,
  SECTION_INFO,
  TADABBUR_QUESTIONS,
  SYNC_MAPPINGS
} from '../constants';
import { 
  getLogForDate, 
  saveLog, 
  formatDate,
  getCustomTasks,
  saveCustomTask,
  deleteCustomTask,
  exportData,
  importData,
  getLogicalToday
} from '../services/storageService';
import { getOccasion, getGreeting } from '../services/dateUtils';
import { calculateScore } from '../services/scoreService';
import SectionCard from '../components/SectionCard';
import { DailyLog, SectionType, CustomTask } from '../types';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { NotificationService } from '../services/notificationService';

// متغير الإزاحة اليدوية (HIJRI_OFFSET): 
const HIJRI_OFFSET = -1; 

const Dashboard: React.FC = () => {
  const [currentDate] = useState(formatDate(getLogicalToday()));
  const [log, setLog] = useState<DailyLog>(getLogForDate(currentDate));
  const [customTasks, setCustomTasks] = useState<CustomTask[]>(getCustomTasks());
  
  const [openAzkarCategory, setOpenAzkarCategory] = useState<number | null>(null);
  const [openDeedCategory, setOpenDeedCategory] = useState<number | null>(null);
  const [openMujahadaCategory, setOpenMujahadaCategory] = useState<number | null>(null);
  const [openPrayerInfoCategory, setOpenPrayerInfoCategory] = useState<number | null>(null);
  const [openQuranSub, setOpenQuranSub] = useState<string | null>(null);

  const [manualInputs, setManualInputs] = useState<Record<string, string>>({});

  const dailyRotationIndex = useMemo(() => {
    const d = getLogicalToday();
    return d.getDate() + HIJRI_OFFSET;
  }, []);

  const formatArabicDate = (date: Date, forceHijri?: boolean) => {
    try {
      const dateToFormat = new Date(date);
      if (forceHijri) {
        dateToFormat.setDate(dateToFormat.getDate() + HIJRI_OFFSET);
      }
      
      const calendar = forceHijri ? 'islamic-umalqura' : 'gregory';
      
      return new Intl.DateTimeFormat(`ar-SA-u-ca-${calendar}-nu-latn`, { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        weekday: 'long'
      }).format(dateToFormat);
    } catch (e) { return date.toDateString(); }
  };

  const occasion = useMemo(() => getOccasion(getLogicalToday()), []);
  const greeting = useMemo(() => getGreeting(occasion), [occasion]);

  const quote = useMemo(() => {
    const quotes = MOTIVATIONAL_QUOTES[occasion] || MOTIVATIONAL_QUOTES.normal;
    return quotes[Math.abs(dailyRotationIndex) % quotes.length];
  }, [dailyRotationIndex, occasion]);

  const tadabburQuestion = useMemo(() => TADABBUR_QUESTIONS[Math.abs(dailyRotationIndex) % TADABBUR_QUESTIONS.length], [dailyRotationIndex]);

  const getDailyInfo = (section: keyof typeof SECTION_INFO) => [SECTION_INFO[section][Math.abs(dailyRotationIndex) % SECTION_INFO[section].length]];

  useEffect(() => { saveLog(log); }, [log]);

  // تحديث اليوم تلقائياً عند مرور وقت الفجر
  useEffect(() => {
    const checkDayTransition = () => {
      const newDate = formatDate(getLogicalToday());
      if (newDate !== currentDate) {
        window.location.reload();
      }
    };
    const interval = setInterval(checkDayTransition, 60000); // تحقق كل دقيقة
    return () => clearInterval(interval);
  }, [currentDate]);

  // Automatic Backup on Native
  useEffect(() => {
    const autoBackup = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          const data = exportData();
          const fileName = `zad_almuslim_auto_backup.json`;
          await Filesystem.writeFile({
            path: fileName,
            data: data,
            directory: Directory.Documents,
            encoding: Encoding.UTF8,
          });
          console.log('Auto backup saved');
        } catch (e) {
          console.error('Auto backup failed', e);
        }
      }
    };
    autoBackup();
  }, []);

  const prevDayScore = useMemo(() => {
    const yesterday = getLogicalToday();
    yesterday.setDate(yesterday.getDate() - 1);
    const prevLog = getLogForDate(formatDate(yesterday));
    return calculateScore(prevLog, customTasks);
  }, [customTasks]);

  const score = useMemo(() => calculateScore(log, customTasks), [log, customTasks]);

  const scoreDiff = score - prevDayScore;
  const scoreTrend = scoreDiff > 0 ? 'up' : scoreDiff < 0 ? 'down' : 'stable';
  const trendMessage = useMemo(() => {
    if (scoreTrend === 'up') return "ما شاء الله! تقدم ملحوظ عن الأمس، استمر في هذا العطاء.";
    if (scoreTrend === 'down') return "تراجع بسيط.. لا بأس، اليوم فرصة جديدة للتعويض والزيادة.";
    return "ثبات جميل، حاول أن تزيد اليوم ولو عملاً واحداً بسيطاً.";
  }, [scoreTrend]);

  const [showSettings, setShowSettings] = useState(false);

  const handleExport = async () => {
    const data = exportData();
    if (Capacitor.isNativePlatform()) {
      try {
        const fileName = `zad_almuslim_backup_${new Date().getTime()}.json`;
        const result = await Filesystem.writeFile({
          path: fileName,
          data: data,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });
        
        await Share.share({
          title: 'نسخة احتياطية لزاد المسلم',
          text: 'إليك النسخة الاحتياطية لبياناتك في تطبيق زاد المسلم',
          url: result.uri,
          dialogTitle: 'مشاركة النسخة الاحتياطية',
        });
        alert('تم إنشاء النسخة الاحتياطية بنجاح في مجلد المستندات');
      } catch (e) {
        console.error('Export failed', e);
        alert('فشل تصدير البيانات: ' + (e as Error).message);
      }
    } else {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zad_almuslim_backup_${new Date().getTime()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (importData(content)) {
        alert('تم استعادة البيانات بنجاح! سيتم إعادة تحميل الصفحة.');
        window.location.reload();
      } else {
        alert('فشل استيراد البيانات. تأكد من صحة الملف.');
      }
    };
    reader.readAsText(file);
  };

  const toggleTask = (section: keyof DailyLog, id: string) => {
    setLog(prev => {
      const currentList = prev[section] as string[];
      const isChecking = !currentList.includes(id);
      let newList = isChecking ? [...currentList, id] : currentList.filter(item => item !== id);
      
      let updatedLog = { ...prev, [section]: newList };

      // Sync logic
      if (SYNC_MAPPINGS[id]) {
        const { target, section: targetSection } = SYNC_MAPPINGS[id];
        const targetList = updatedLog[targetSection] as string[];
        
        if (isChecking) {
          if (!targetList.includes(target)) {
            updatedLog = { ...updatedLog, [targetSection]: [...targetList, target] };
          }
        } else {
          updatedLog = { ...updatedLog, [targetSection]: targetList.filter(item => item !== target) };
        }
      }
      
      return updatedLog;
    });
  };

  const addManualEntry = (type: 'notes' | 'mujahadaNotes', categoryIndex: number) => {
    const key = `${type}-${categoryIndex}`;
    const value = manualInputs[key];
    if (!value || !value.trim()) return;
    setLog(prev => ({ ...prev, [type]: [...prev[type], value.trim()] }));
    setManualInputs(prev => ({ ...prev, [key]: '' }));
  };

  const addCustomTask = (section: SectionType) => {
    const key = `custom-${section}`;
    const value = manualInputs[key];
    if (!value || !value.trim()) return;
    
    const newTask: CustomTask = {
      id: `custom-${Date.now()}`,
      label: value.trim(),
      section
    };
    
    saveCustomTask(newTask);
    setCustomTasks(prev => [...prev, newTask]);
    setManualInputs(prev => ({ ...prev, [key]: '' }));
  };

  const removeCustomTask = (id: string) => {
    deleteCustomTask(id);
    setCustomTasks(prev => prev.filter(t => t.id !== id));
    setLog(prev => ({
      ...prev,
      customTaskIds: prev.customTaskIds.filter(taskId => taskId !== id)
    }));
  };

  const quranCalculations = useMemo(() => {
    const readToday = Math.max(0, log.quranEnd - log.quranStart);
    const totalRead = log.quranEnd;
    const remaining = 604 - totalRead;
    const juz = Math.min(30, Math.ceil(totalRead / 20.2) || 1);
    const percentage = (totalRead / 604) * 100;
    
    const dailyTarget = log.quranGoal * 20; 
    const isGoalMet = readToday >= dailyTarget;

    const daysLeft = Math.ceil(remaining / (readToday || dailyTarget));
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysLeft);
    
    const completionWithOffset = new Date(completionDate);
    completionWithOffset.setDate(completionWithOffset.getDate() + HIJRI_OFFSET);

    const formattedCompletion = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'long' }).format(completionWithOffset);

    return { readToday, remaining, juz, percentage, isGoalMet, dailyTarget, formattedCompletion };
  }, [log.quranStart, log.quranEnd, log.quranGoal, log.quranGoal]);

  return (
    <div className="space-y-6 md:space-y-10 pb-12 animate-fade-in relative">
      {/* Prominent Daily Quote Banner - Improved for Light Mode */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1a1a1a] border-y-4 md:border-4 border-yellow-600/30 dark:border-yellow-900/40 p-8 md:p-12 rounded-none md:rounded-[3.5rem] relative overflow-hidden group shadow-2xl transition-colors duration-500"
      >
        <div className="absolute top-0 left-0 w-full h-full islamic-pattern opacity-[0.03] dark:opacity-10"></div>
        
        {/* Occasion Specific Decorations */}
        {occasion === 'ramadan' && (
          <>
            <div className="absolute top-4 right-4 text-yellow-600/20 dark:text-yellow-500/20 text-6xl animate-pulse">
              <Icon name="fa-moon" />
            </div>
            <div className="absolute bottom-4 left-4 text-yellow-600/20 dark:text-yellow-500/20 text-6xl animate-pulse">
              <Icon name="fa-star" />
            </div>
          </>
        )}
        {occasion === 'eid_fitr' && (
          <>
            <div className="absolute top-4 right-4 text-emerald-600/20 dark:text-emerald-500/20 text-6xl animate-bounce">
              <Icon name="fa-cookie" />
            </div>
            <div className="absolute bottom-4 left-4 text-emerald-600/20 dark:text-emerald-500/20 text-6xl animate-bounce">
              <Icon name="fa-gift" />
            </div>
          </>
        )}
        {occasion === 'eid_adha' && (
          <>
            <div className="absolute top-4 right-4 text-amber-600/20 dark:text-amber-500/20 text-6xl">
              <Icon name="fa-cow" />
            </div>
            <div className="absolute bottom-4 left-4 text-amber-600/20 dark:text-amber-500/20 text-6xl">
              <Icon name="fa-sheep" />
            </div>
          </>
        )}
        {occasion === 'normal' && (
          <>
            <div className="absolute top-4 right-4 text-yellow-600/10 dark:text-yellow-500/10 text-6xl">
              <Icon name="fa-sun" />
            </div>
            <div className="absolute bottom-4 left-4 text-yellow-600/10 dark:text-yellow-500/10 text-6xl">
              <Icon name="fa-heart" />
            </div>
          </>
        )}

        <div className="absolute -top-24 -right-24 w-64 h-64 bg-yellow-500/5 dark:bg-yellow-500/10 rounded-full blur-[80px] group-hover:bg-yellow-500/20 transition-all duration-700"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-yellow-500/5 dark:bg-yellow-500/10 rounded-full blur-[80px] group-hover:bg-yellow-500/20 transition-all duration-700"></div>
        
        <div className="relative z-10 text-center space-y-6">
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="h-[1px] w-12 bg-yellow-600/30"></div>
            <span className="text-yellow-700 dark:text-yellow-500 text-[10px] font-black uppercase tracking-[0.3em]">{greeting}</span>
            <div className="h-[1px] w-12 bg-yellow-600/30"></div>
          </div>
          
          <div className="space-y-3 md:space-y-4">
            <p className="text-2xl md:text-5xl font-black text-slate-800 dark:text-gray-100 leading-[1.3] quran-font drop-shadow-sm">
              {formatArabicDate(getLogicalToday(), true)}
            </p>
            <p className="text-lg md:text-2xl font-bold text-yellow-700/70 dark:text-yellow-500/60 quran-font">
              {formatArabicDate(getLogicalToday(), false)}
            </p>
          </div>
          
          <div className="pt-6 border-t border-yellow-600/10 max-w-md mx-auto">
            <p className="text-[10px] md:text-sm italic text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest font-black">
              {occasion === 'ramadan' ? 'نفحة رمضانية:' : occasion.startsWith('eid') ? 'تهنئة العيد:' : 'حكمة اليوم:'}
            </p>
            <p className="text-base md:text-lg font-bold text-slate-700 dark:text-gray-300 leading-relaxed px-2">
              "{quote.text}"
            </p>
            <span className="inline-block mt-4 px-6 py-1.5 bg-yellow-600/5 dark:bg-yellow-600/10 border border-yellow-600/20 rounded-full text-[9px] md:text-[10px] text-yellow-700 dark:text-yellow-500 font-black tracking-widest uppercase">
              {quote.source}
            </span>
          </div>

          {/* Score Comparison Section */}
          <div className="pt-8 mt-6 border-t border-yellow-600/10 max-w-lg mx-auto">
            <div className={`p-4 rounded-2xl border flex items-center gap-4 transition-all duration-500 ${
              scoreTrend === 'up' ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/20' :
              scoreTrend === 'down' ? 'bg-orange-50/50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/20' :
              'bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20'
            }`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-sm ${
                scoreTrend === 'up' ? 'bg-emerald-500 text-white' :
                scoreTrend === 'down' ? 'bg-orange-500 text-white' :
                'bg-blue-500 text-white'
              }`}>
                <Icon name={scoreTrend === 'up' ? 'fa-arrow-trend-up' : scoreTrend === 'down' ? 'fa-arrow-trend-down' : 'fa-minus'} />
              </div>
              <div className="text-right flex-grow">
                <p className={`text-xs font-black uppercase tracking-wider mb-1 ${
                  scoreTrend === 'up' ? 'text-emerald-700 dark:text-emerald-500' :
                  scoreTrend === 'down' ? 'text-orange-700 dark:text-orange-500' :
                  'text-blue-700 dark:text-blue-500'
                }`}>
                  تقييمك مقارنة بالأمس {scoreDiff !== 0 && `(${scoreDiff > 0 ? '+' : ''}${scoreDiff})`}
                </p>
                <p className="text-sm font-bold text-slate-700 dark:text-gray-300 leading-snug">
                  {trendMessage}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 px-1">
        {[
          { label: 'نقاط اليوم', value: score, highlight: true, icon: 'fa-star', theme: 'gold' },
          { label: 'تقدم الختمة', value: `${Math.round(quranCalculations.percentage)}%`, highlight: false, icon: 'fa-book-quran', theme: 'default' },
          { label: 'الزلات', value: log.mujahada.length + log.mujahadaNotes.length, highlight: false, icon: 'fa-triangle-exclamation', theme: 'danger' },
          { label: 'إجمالي الطاعات', value: log.prayers.length + log.azkar.length, highlight: false, icon: 'fa-pray', theme: 'default' },
          { label: 'أعمال البر', value: log.goodDeeds.length + log.notes.length, highlight: false, icon: 'fa-heart', theme: 'default' },
        ].map((stat, idx) => (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-[#151515] p-4 md:p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center shadow-lg transition-all"
          >
            <Icon name={stat.icon} className={`text-[10px] mb-2 ${stat.theme === 'danger' ? 'text-red-500/60' : 'text-yellow-600/60'}`} />
            <span className="text-gray-400 dark:text-gray-500 text-[8px] md:text-[9px] mb-1 font-black uppercase text-center leading-tight">{stat.label}</span>
            <span className={`text-2xl md:text-3xl font-black ${stat.theme === 'gold' ? 'gold-gradient' : stat.theme === 'danger' ? 'text-red-600' : 'text-slate-800 dark:text-gray-100'}`}>{stat.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <SectionCard title="ورد القرآن الكريم" icon="book_quran" infoItems={getDailyInfo('QURAN')} defaultOpen={false}>
          <div className="space-y-4">
            <div className="bg-yellow-50/50 dark:bg-[#1a1a1a] p-4 rounded-2xl border border-yellow-100 dark:border-gray-800 space-y-3">
               <div className="flex items-center justify-between">
                 <span className="text-[10px] font-black uppercase text-yellow-800 dark:text-yellow-600">هدف الختمات</span>
                 <div className="flex gap-2">
                   {[1, 2, 3, 4].map(g => (
                     <button 
                      key={g} 
                      onClick={() => setLog(p => ({...p, quranGoal: g as 1|2|3|4}))}
                      className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${log.quranGoal === g ? 'bg-yellow-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-400'}`}
                     >
                       {g === 1 ? '١' : g === 2 ? '٢' : g === 3 ? '٣' : '٤'}
                     </button>
                   ))}
                 </div>
               </div>
               <p className="text-[11px] text-yellow-700 dark:text-yellow-500 font-bold text-center border-t border-yellow-200/50 dark:border-gray-700 pt-2 italic">
                {log.quranGoal === 1 && "لختم القرآن مرة واحدة، عليك قراءة ٢٠ صفحة يومياً."}
                {log.quranGoal === 2 && "لختم القرآن مرتين، عليك قراءة ٤٠ صفحة يومياً."}
                {log.quranGoal === 3 && "لختم القرآن ٣ مرات، عليك قراءة ٦٠ صفحة يومياً."}
                {log.quranGoal === 4 && "لختم القرآن ٤ مرات، عليك قراءة ٨٠ صفحة يومياً."}
               </p>
            </div>

            <div className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
              <button onClick={() => setOpenQuranSub(openQuranSub === 'track' ? null : 'track')} className="w-full flex items-center justify-between p-4 bg-emerald-50/30 dark:bg-[#1a1a1a]">
                <span className="text-sm font-black text-emerald-700 dark:text-emerald-500">1. متابعة الورد (الكمّي)</span>
                <Icon name="fa-chevron-down" className={`text-xs transition-transform ${openQuranSub === 'track' ? 'rotate-180' : ''}`} />
              </button>
              {openQuranSub === 'track' && (
                <div className="p-4 bg-white dark:bg-[#151515] space-y-4 animate-fade-in">
                   <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase pr-1">من صفحة</label>
                      <input type="number" value={log.quranStart || ""} onChange={(e) => setLog(prev => ({...prev, quranStart: parseInt(e.target.value) || 0}))} className="w-full bg-gray-50 dark:bg-[#1a1a1a] p-4 rounded-xl text-center font-black text-yellow-600 outline-none border border-transparent focus:border-yellow-500/30" placeholder="0" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase pr-1">إلى صفحة</label>
                      <input type="number" value={log.quranEnd || ""} onChange={(e) => setLog(prev => ({...prev, quranEnd: parseInt(e.target.value) || 0}))} className="w-full bg-gray-50 dark:bg-[#1a1a1a] p-4 rounded-xl text-center font-black text-yellow-600 outline-none border border-transparent focus:border-yellow-500/30" placeholder="0" />
                    </div>
                   </div>

                   {quranCalculations.readToday > 0 ? (
                      <div className="bg-emerald-500 text-white p-3 rounded-xl text-center animate-bounce shadow-lg">
                        <Icon name="fa-check-circle" className="mr-2" />
                        <span className="text-xs font-black">فتح الله عليك! قرأت {quranCalculations.readToday} صفحة</span>
                      </div>
                   ) : (
                      <div className="bg-orange-50 dark:bg-orange-900/10 text-orange-700 dark:text-orange-500 p-3 rounded-xl text-center border border-orange-100 dark:border-orange-900/20">
                        <Icon name="fa-heart" className="mr-2" />
                        <span className="text-xs font-black">أما اشتقت لحديث ربك؟ ابدأ وردك الآن</span>
                      </div>
                   )}

                   <div className="grid grid-cols-3 gap-2">
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-center">
                        <span className="text-[8px] text-gray-400 block font-black uppercase">الجزء</span>
                        <span className="text-sm font-black text-slate-700 dark:text-gray-200">{quranCalculations.juz}</span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-center">
                        <span className="text-[8px] text-gray-400 block font-black uppercase">المتبقي</span>
                        <span className="text-sm font-black text-slate-700 dark:text-gray-200">{quranCalculations.remaining} ص</span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-center">
                        <span className="text-[8px] text-gray-400 block font-black uppercase">الختمة</span>
                        <span className="text-[9px] font-black text-yellow-600 leading-tight">{quranCalculations.formattedCompletion}</span>
                      </div>
                   </div>

                   <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-black text-gray-400">
                        <span>خريطة المصحف</span>
                        <span>{Math.round(quranCalculations.percentage)}%</span>
                      </div>
                      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-0.5">
                        <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-1000" style={{ width: `${quranCalculations.percentage}%` }}></div>
                      </div>
                   </div>
                </div>
              )}
            </div>

            <div className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
              <button onClick={() => setOpenQuranSub(openQuranSub === 'tadabbur' ? null : 'tadabbur')} className="w-full flex items-center justify-between p-4 bg-blue-50/30 dark:bg-[#1a1a1a]">
                <span className="text-sm font-black text-blue-700 dark:text-blue-500">2. قسم التدبر (الكيفي)</span>
                <Icon name="fa-chevron-down" className={`text-xs transition-transform ${openQuranSub === 'tadabbur' ? 'rotate-180' : ''}`} />
              </button>
              {openQuranSub === 'tadabbur' && (
                <div className="p-4 bg-white dark:bg-[#151515] space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-blue-600 uppercase pr-1">سؤال التدبر اليومي</label>
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-xl border-r-4 border-blue-500 text-blue-800 dark:text-blue-300 text-xs font-bold leading-relaxed">
                      {tadabburQuestion}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase">آية استوقفتني</label>
                      <textarea 
                        value={log.quranTadabburNote}
                        onChange={(e) => setLog(p => ({...p, quranTadabburNote: e.target.value}))}
                        className="w-full bg-gray-50 dark:bg-[#1a1a1a] p-3 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-blue-500/30 min-h-[60px]"
                        placeholder="اكتب هنا الآية التي شعرت أنها تخاطبك..."
                      ></textarea>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase">العمل بالآية</label>
                      <textarea 
                        value={log.quranActionNote}
                        onChange={(e) => setLog(p => ({...p, quranActionNote: e.target.value}))}
                        className="w-full bg-gray-50 dark:bg-[#1a1a1a] p-3 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-emerald-500/30 min-h-[60px]"
                        placeholder="سأطبق هذه الآية اليوم من خلال..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
              <button onClick={() => setOpenQuranSub(openQuranSub === 'other' ? null : 'other')} className="w-full flex items-center justify-between p-4 bg-purple-50/30 dark:bg-[#1a1a1a]">
                <span className="text-sm font-black text-purple-700 dark:text-purple-500">3. السماع والوجل</span>
                <Icon name="fa-chevron-down" className={`text-xs transition-transform ${openQuranSub === 'other' ? 'rotate-180' : ''}`} />
              </button>
              {openQuranSub === 'other' && (
                <div className="p-4 bg-white dark:bg-[#151515] space-y-4 animate-fade-in">
                   <label className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Icon name="fa-headphones" className="text-purple-600" />
                        <span className="text-xs font-bold">ورد السماع</span>
                      </div>
                      <input type="checkbox" checked={log.quranListening} onChange={(e) => setLog(p => ({...p, quranListening: e.target.checked}))} className="w-5 h-5 rounded text-purple-600" />
                   </label>
                   <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <Icon name="fa-person-praying" className="text-purple-600" />
                        <span className="text-xs font-bold">سجدات التلاوة</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setLog(p => ({...p, quranSujudCount: Math.max(0, p.quranSujudCount - 1)}))} className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 text-purple-600">-</button>
                        <span className="w-8 text-center font-black">{log.quranSujudCount}</span>
                        <button onClick={() => setLog(p => ({...p, quranSujudCount: p.quranSujudCount + 1}))} className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 text-purple-600">+</button>
                      </div>
                   </div>
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="قسم الصلاة" icon="person_praying" infoItems={getDailyInfo('PRAYER')}>
          <div className="space-y-4">
            {/* Educational Info Accordions */}
            <div className="space-y-3">
              {[
                {
                  title: "1️⃣ الصلوات المفروضة (اليومية)",
                  content: (
                    <div className="space-y-6">
                      {[
                        { 
                          title: "🌅 الفجر", 
                          tasks: [
                            { id: 'fajr_sunnah', label: 'سنة الفجر (ركعتان)' },
                            { id: 'fajr', label: 'صلاة الفجر (فرض)' },
                            { id: 'fajr_azkar', label: 'أذكار بعد الصلاة', syncTarget: 'fajr_azkar_sync' },
                          ] 
                        },
                        { 
                          title: "☀️ الظهر", 
                          tasks: [
                            { id: 'dhuhr_sunnah_before', label: 'سنة قبل الظهر (4 ركعات)' },
                            { id: 'dhuhr', label: 'صلاة الظهر (فرض)' },
                            { id: 'dhuhr_sunnah_after', label: 'سنة بعد الظهر (ركعتان)' },
                            { id: 'dhuhr_azkar', label: 'أذكار بعد الصلاة', syncTarget: 'dhuhr_azkar_sync' },
                          ] 
                        },
                        { 
                          title: "🌇 العصر", 
                          tasks: [
                            { id: 'asr_sunnah', label: 'سنة العصر (4 ركعات – غير مؤكدة)' },
                            { id: 'asr', label: 'صلاة العصر (فرض)' },
                            { id: 'asr_azkar', label: 'أذكار بعد الصلاة', syncTarget: 'asr_azkar_sync' },
                          ] 
                        },
                        { 
                          title: "🌆 المغرب", 
                          tasks: [
                            { id: 'maghrib', label: 'صلاة المغرب (فرض)' },
                            { id: 'maghrib_sunnah', label: 'سنة المغرب (ركعتان)' },
                            { id: 'maghrib_azkar', label: 'أذكار بعد الصلاة', syncTarget: 'maghrib_azkar_sync' },
                          ] 
                        },
                        { 
                          title: "🌃 العشاء", 
                          tasks: [
                            { id: 'isha', label: 'صلاة العشاء (فرض)' },
                            { id: 'isha_sunnah', label: 'سنة العشاء (ركعتان)' },
                            { id: 'isha_azkar', label: 'أذكار بعد الصلاة', syncTarget: 'isha_azkar_sync' },
                          ] 
                        },
                      ].map((sub, sIdx) => (
                        <div key={sIdx} className="space-y-2">
                          <h5 className="text-[11px] font-black text-slate-800 dark:text-gray-200 pr-2 border-r-2 border-yellow-500/50">{sub.title}</h5>
                          <div className="grid grid-cols-1 gap-1.5">
                            {sub.tasks.map(task => (
                              <label key={task.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 cursor-pointer hover:bg-yellow-50/50 transition-all">
                                <input type="checkbox" checked={log.prayers.includes(task.id)} onChange={() => toggleTask('prayers', task.id)} className="w-4 h-4 text-yellow-600" />
                                <span className="text-xs font-bold text-slate-700 dark:text-gray-300">{task.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                },
                {
                  title: "2️⃣ صلاة الوتر",
                  content: (
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'witr_1', label: 'ركعة واحدة' },
                        { id: 'witr_3', label: 'ثلاث ركعات' },
                        { id: 'witr_5', label: 'خمس ركعات' },
                        { id: 'witr_7', label: 'سبع ركعات' },
                        { id: 'witr_9', label: 'تسع ركعات' },
                        { id: 'witr_11', label: 'إحدى عشرة ركعة' },
                      ].map(task => (
                        <label key={task.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 cursor-pointer">
                          <input type="checkbox" checked={log.prayers.includes(task.id)} onChange={() => toggleTask('prayers', task.id)} className="w-4 h-4 text-yellow-600" />
                          <span className="text-xs font-bold text-slate-700 dark:text-gray-300">{task.label}</span>
                        </label>
                      ))}
                    </div>
                  )
                },
                {
                  title: "3️⃣ الرواتب (السنن المؤكدة)",
                  content: (
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: 'rawatib_fajr_2', label: '2 قبل الفجر', source: 'fajr_sunnah' },
                        { id: 'rawatib_dhuhr_4', label: '4 قبل الظهر', source: 'dhuhr_sunnah_before' },
                        { id: 'rawatib_dhuhr_after_2', label: '2 بعد الظهر', source: 'dhuhr_sunnah_after' },
                        { id: 'rawatib_maghrib_2', label: '2 بعد المغرب', source: 'maghrib_sunnah' },
                        { id: 'rawatib_isha_2', label: '2 بعد العشاء', source: 'isha_sunnah' },
                      ].map(task => {
                        const isSynced = task.source && log.prayers.includes(task.source);
                        return (
                          <label key={task.id} className={`flex items-center gap-3 p-2.5 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 transition-all ${isSynced ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}>
                            <input 
                              type="checkbox" 
                              checked={log.prayers.includes(task.id)} 
                              onChange={() => !isSynced && toggleTask('prayers', task.id)} 
                              disabled={isSynced}
                              className="w-4 h-4 text-yellow-600" 
                            />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-700 dark:text-gray-300">{task.label}</span>
                              {isSynced && <span className="text-[9px] text-emerald-600 font-bold">تم التحديد من قسم الصلوات اليومية</span>}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )
                },
                {
                  title: "4️⃣ قيام الليل",
                  content: (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'qiyam_2', label: 'ركعتان' },
                          { id: 'qiyam_4', label: '4 ركعات' },
                          { id: 'qiyam_6', label: '6 ركعات' },
                          { id: 'qiyam_8', label: '8 ركعات' },
                          { id: 'qiyam_10', label: '10 ركعات' },
                        ].map(task => (
                          <label key={task.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 cursor-pointer">
                            <input type="checkbox" checked={log.prayers.includes(task.id)} onChange={() => toggleTask('prayers', task.id)} className="w-4 h-4 text-yellow-600" />
                            <span className="text-xs font-bold text-slate-700 dark:text-gray-300">{task.label}</span>
                          </label>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2 border-t border-gray-100 dark:border-gray-800 pt-3">
                        {[
                          { id: 'qiyam_qunut', label: 'دعاء القنوت' },
                          { id: 'qiyam_istighfar', label: 'استغفار' },
                        ].map(task => (
                          <label key={task.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-50/30 dark:bg-blue-900/10 cursor-pointer">
                            <input type="checkbox" checked={log.prayers.includes(task.id)} onChange={() => toggleTask('prayers', task.id)} className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-bold text-blue-700 dark:text-blue-400">{task.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                },
                {
                  title: "5️⃣ صلاة الضحى",
                  content: (
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'duha_2', label: 'ركعتان' },
                        { id: 'duha_4', label: '4 ركعات' },
                        { id: 'duha_6', label: '6 ركعات' },
                        { id: 'duha_8', label: '8 ركعات' },
                      ].map(task => (
                        <label key={task.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 cursor-pointer">
                          <input type="checkbox" checked={log.prayers.includes(task.id)} onChange={() => toggleTask('prayers', task.id)} className="w-4 h-4 text-yellow-600" />
                          <span className="text-xs font-bold text-slate-700 dark:text-gray-300">{task.label}</span>
                        </label>
                      ))}
                    </div>
                  )
                },
                {
                  title: "6️⃣ صلوات الجمعة",
                  content: (
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: 'jumuah_ghusl', label: 'الاغتسال للجمعة' },
                        { id: 'jumuah_early', label: 'التبكير للمسجد' },
                        { id: 'jumuah_fard', label: 'صلاة الجمعة (فرض)' },
                        { id: 'jumuah_sunnah_before', label: 'سنة قبل الجمعة' },
                        { id: 'jumuah_sunnah_after', label: 'سنة بعد الجمعة' },
                      ].map(task => (
                        <label key={task.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-50/30 dark:bg-emerald-900/10 cursor-pointer">
                          <input type="checkbox" checked={log.prayers.includes(task.id)} onChange={() => toggleTask('prayers', task.id)} className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{task.label}</span>
                        </label>
                      ))}
                    </div>
                  )
                },
                {
                  title: "7️⃣ صلوات العيد",
                  content: (
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: 'eid_fitr', label: 'صلاة عيد الفطر' },
                        { id: 'eid_adha', label: 'صلاة عيد الأضحى' },
                        { id: 'eid_takbir', label: 'التكبيرات' },
                      ].map(task => (
                        <label key={task.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-yellow-50/30 dark:bg-yellow-900/10 cursor-pointer">
                          <input type="checkbox" checked={log.prayers.includes(task.id)} onChange={() => toggleTask('prayers', task.id)} className="w-4 h-4 text-yellow-600" />
                          <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">{task.label}</span>
                        </label>
                      ))}
                    </div>
                  )
                },
                {
                  title: "8️⃣ صلوات المناسبات الخاصة",
                  content: (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h6 className="text-[10px] font-black text-blue-600 uppercase pr-2 border-r-2 border-blue-500">🌧️ صلاة الاستسقاء</h6>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'istisqa_prayer', label: 'صلاة الاستسقاء' },
                            { id: 'istisqa_dua', label: 'الدعاء بعدها' },
                          ].map(task => (
                            <label key={task.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-50/30 dark:bg-blue-900/10 cursor-pointer">
                              <input type="checkbox" checked={log.prayers.includes(task.id)} onChange={() => toggleTask('prayers', task.id)} className="w-4 h-4 text-blue-600" />
                              <span className="text-xs font-bold text-blue-700 dark:text-blue-400">{task.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h6 className="text-[10px] font-black text-gray-500 uppercase pr-2 border-r-2 border-gray-400">🌑 صلاة الكسوف / الخسوف</h6>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'kusuf_prayer', label: 'صلاة الكسوف' },
                            { id: 'khusuf_prayer', label: 'صلاة الخسوف' },
                          ].map(task => (
                            <label key={task.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 cursor-pointer">
                              <input type="checkbox" checked={log.prayers.includes(task.id)} onChange={() => toggleTask('prayers', task.id)} className="w-4 h-4 text-gray-600" />
                              <span className="text-xs font-bold text-gray-700 dark:text-gray-400">{task.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h6 className="text-[10px] font-black text-emerald-600 uppercase pr-2 border-r-2 border-emerald-500">🙏 صلاة الاستخارة</h6>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'istikhara_prayer', label: 'ركعتان استخارة' },
                            { id: 'istikhara_dua', label: 'دعاء الاستخارة' },
                          ].map(task => (
                            <label key={task.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-50/30 dark:bg-emerald-900/10 cursor-pointer">
                              <input type="checkbox" checked={log.prayers.includes(task.id)} onChange={() => toggleTask('prayers', task.id)} className="w-4 h-4 text-emerald-600" />
                              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{task.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h6 className="text-[10px] font-black text-purple-600 uppercase pr-2 border-r-2 border-purple-500">🕊️ صلاة الجنازة</h6>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'janaza_attendance', label: 'حضور صلاة الجنازة' },
                            { id: 'janaza_dua', label: 'الدعاء للميت' },
                          ].map(task => (
                            <label key={task.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-purple-50/30 dark:bg-purple-900/10 cursor-pointer">
                              <input type="checkbox" checked={log.prayers.includes(task.id)} onChange={() => toggleTask('prayers', task.id)} className="w-4 h-4 text-purple-600" />
                              <span className="text-xs font-bold text-purple-700 dark:text-purple-400">{task.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                },
                {
                  title: "9️⃣ صلوات التطوع المطلق",
                  content: (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'nawafil_2', label: 'ركعتان' },
                          { id: 'nawafil_4', label: '4 ركعات' },
                        ].map(task => (
                          <label key={task.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 cursor-pointer">
                            <input type="checkbox" checked={log.prayers.includes(task.id)} onChange={() => toggleTask('prayers', task.id)} className="w-4 h-4 text-yellow-600" />
                            <span className="text-xs font-bold text-slate-700 dark:text-gray-300">{task.label}</span>
                          </label>
                        ))}
                      </div>
                      <div className="p-3 rounded-xl bg-yellow-50/30 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-yellow-700 dark:text-yellow-500">تطوع (أكثر)</span>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setLog(p => ({...p, nawafilCount: Math.max(0, p.nawafilCount - 1)}))}
                              className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 text-yellow-600 shadow-sm border border-yellow-100 dark:border-gray-700 font-bold"
                            >-</button>
                            <input 
                              type="number" 
                              value={log.nawafilCount || ''} 
                              onChange={(e) => setLog(p => ({...p, nawafilCount: parseInt(e.target.value) || 0}))}
                              className="w-12 text-center bg-transparent font-black text-sm outline-none"
                              placeholder="0"
                            />
                            <button 
                              onClick={() => setLog(p => ({...p, nawafilCount: (p.nawafilCount || 0) + 1}))}
                              className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 text-yellow-600 shadow-sm border border-yellow-100 dark:border-gray-700 font-bold"
                            >+</button>
                          </div>
                        </div>
                        <p className="text-[9px] text-yellow-600/70 font-bold text-center">أدخل عدد الركعات الإضافية التي صليتها</p>
                      </div>
                    </div>
                  )
                }
              ].map((item, idx) => (
                <div key={idx} className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                  <button 
                    onClick={() => setOpenPrayerInfoCategory(openPrayerInfoCategory === idx ? null : idx)} 
                    className="w-full flex items-center justify-between p-4 bg-yellow-50/30 dark:bg-[#1a1a1a] hover:bg-yellow-100/50 transition-colors"
                  >
                    <span className="text-xs font-black text-yellow-700 dark:text-yellow-500">{item.title}</span>
                    <Icon name="fa-chevron-down" className={`text-[10px] transition-transform ${openPrayerInfoCategory === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {openPrayerInfoCategory === idx && (
                    <div className="p-4 bg-white dark:bg-[#151515] animate-fade-in border-t border-gray-50 dark:border-gray-800">
                      {item.content}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Custom Tasks */}
            {customTasks.filter(t => t.section === SectionType.PRAYER).length > 0 && (
              <div className="bg-gray-50/50 dark:bg-[#1a1a1a] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                <h4 className="text-[10px] font-black uppercase text-gray-500 mb-3">مهام الصلاة المضافة يدوياً</h4>
                <div className="grid grid-cols-2 gap-2">
                  {customTasks.filter(t => t.section === SectionType.PRAYER).map(task => (
                    <div key={task.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-[#151515] border border-gray-100 dark:border-gray-800 shadow-sm">
                      <label className="flex items-center gap-3 cursor-pointer flex-grow">
                        <input type="checkbox" checked={log.customTaskIds.includes(task.id)} onChange={() => toggleTask('customTaskIds', task.id)} className="w-4 h-4 text-yellow-600" />
                        <span className="text-xs font-bold text-slate-700 dark:text-gray-200">{task.label}</span>
                      </label>
                      <button onClick={() => removeCustomTask(task.id)} className="text-red-500/50 hover:text-red-500 transition-colors">
                        <Icon name="fa-trash-can" className="text-[10px]" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 p-2 bg-gray-50/50 dark:bg-[#1a1a1a] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
              <input 
                type="text" 
                placeholder="إضافة عمل صلاة يدوي دائم..." 
                value={manualInputs[`custom-${SectionType.PRAYER}`] || ''} 
                onChange={(e) => setManualInputs(p => ({...p, [`custom-${SectionType.PRAYER}`]: e.target.value}))} 
                className="flex-grow bg-transparent text-xs p-2 outline-none" 
              />
              <button onClick={() => addCustomTask(SectionType.PRAYER)} className="bg-yellow-600 text-white w-8 h-8 rounded-xl flex items-center justify-center shadow-sm">
                <Icon name="fa-plus" className="text-xs" />
              </button>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="قسم الأذكار" icon="person_praying" infoItems={getDailyInfo('AZKAR')}>
          <div className="space-y-3">
            {/* Custom Tasks for Azkar */}
            {customTasks.filter(t => t.section === SectionType.AZKAR).length > 0 && (
              <div className="bg-purple-50/30 dark:bg-[#1a1a1a] p-4 rounded-2xl border border-purple-100 dark:border-gray-800">
                <h4 className="text-[10px] font-black uppercase text-purple-800 dark:text-purple-600 mb-3">أذكار مضافة يدوياً</h4>
                <div className="grid grid-cols-1 gap-2">
                  {customTasks.filter(t => t.section === SectionType.AZKAR).map(task => (
                    <div key={task.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-[#151515] border border-gray-100 dark:border-gray-800 shadow-sm">
                      <label className="flex items-center gap-3 cursor-pointer flex-grow">
                        <input type="checkbox" checked={log.customTaskIds.includes(task.id)} onChange={() => toggleTask('customTaskIds', task.id)} className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-bold text-slate-700 dark:text-gray-200">{task.label}</span>
                      </label>
                      <button onClick={() => removeCustomTask(task.id)} className="text-red-500/50 hover:text-red-500 transition-colors">
                        <Icon name="fa-trash-can" className="text-[10px]" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 p-2 bg-purple-50/20 dark:bg-[#1a1a1a] rounded-2xl border border-dashed border-purple-200 dark:border-gray-800">
              <input 
                type="text" 
                placeholder="إضافة ذكر يدوي دائم..." 
                value={manualInputs[`custom-${SectionType.AZKAR}`] || ''} 
                onChange={(e) => setManualInputs(p => ({...p, [`custom-${SectionType.AZKAR}`]: e.target.value}))} 
                className="flex-grow bg-transparent text-xs p-2 outline-none" 
              />
              <button onClick={() => addCustomTask(SectionType.AZKAR)} className="bg-purple-600 text-white w-8 h-8 rounded-xl flex items-center justify-center shadow-sm">
                <Icon name="fa-plus" className="text-xs" />
              </button>
            </div>
            {AZKAR_CATEGORIES.map((cat, idx) => (
              <div key={idx} className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                <button onClick={() => setOpenAzkarCategory(openAzkarCategory === idx ? null : idx)} className="w-full flex items-center justify-between p-4 bg-purple-50/30 dark:bg-[#1a1a1a]">
                  <span className="text-sm font-black text-purple-700 dark:text-purple-500">{cat.category}</span>
                  <Icon name="fa-chevron-down" className={`text-xs transition-transform ${openAzkarCategory === idx ? 'rotate-180' : ''}`} />
                </button>
                {openAzkarCategory === idx && (
                  <div className="p-4 bg-white dark:bg-[#151515] space-y-2 animate-fade-in">
                    {cat.tasks.map(task => {
                      const syncSource = Object.entries(SYNC_MAPPINGS).find(([_, val]) => val.target === task.id)?.[0];
                      const isSynced = syncSource && log.prayers.includes(syncSource);

                      return (
                        <label key={task.id} className={`flex items-start gap-3 p-3 rounded-xl transition-all ${isSynced ? 'opacity-70 cursor-not-allowed' : 'hover:bg-purple-50/30 cursor-pointer'}`}>
                          <input 
                            type="checkbox" 
                            checked={log.azkar.includes(task.id)} 
                            onChange={() => !isSynced && toggleTask('azkar', task.id)} 
                            disabled={isSynced}
                            className="mt-1 w-4 h-4 text-purple-600" 
                          />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold">{task.label}</span>
                            {task.description && !isSynced && <span className="text-[9px] text-gray-500">{task.description}</span>}
                            {isSynced && <span className="text-[9px] text-emerald-600 font-bold">تم التحديد من قسم الصلوات اليومية</span>}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="أعمال البر والطاعات" icon="heart" infoItems={getDailyInfo('GOOD_DEEDS')}>
          <div className="space-y-3">
            {/* Custom Tasks for Good Deeds */}
            {customTasks.filter(t => t.section === SectionType.GOOD_DEEDS).length > 0 && (
              <div className="bg-emerald-50/30 dark:bg-[#1a1a1a] p-4 rounded-2xl border border-emerald-100 dark:border-gray-800">
                <h4 className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-600 mb-3">أعمال بر مضافة يدوياً (+ نقاط)</h4>
                <div className="grid grid-cols-1 gap-2">
                  {customTasks.filter(t => t.section === SectionType.GOOD_DEEDS).map(task => (
                    <div key={task.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-[#151515] border border-gray-100 dark:border-gray-800 shadow-sm">
                      <label className="flex items-center gap-3 cursor-pointer flex-grow">
                        <input type="checkbox" checked={log.customTaskIds.includes(task.id)} onChange={() => toggleTask('customTaskIds', task.id)} className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-700 dark:text-gray-200">{task.label}</span>
                      </label>
                      <button onClick={() => removeCustomTask(task.id)} className="text-red-500/50 hover:text-red-500 transition-colors">
                        <Icon name="fa-trash-can" className="text-[10px]" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 p-2 bg-emerald-50/20 dark:bg-[#1a1a1a] rounded-2xl border border-dashed border-emerald-200 dark:border-gray-800">
              <input 
                type="text" 
                placeholder="إضافة عمل بر يدوي دائم..." 
                value={manualInputs[`custom-${SectionType.GOOD_DEEDS}`] || ''} 
                onChange={(e) => setManualInputs(p => ({...p, [`custom-${SectionType.GOOD_DEEDS}`]: e.target.value}))} 
                className="flex-grow bg-transparent text-xs p-2 outline-none" 
              />
              <button onClick={() => addCustomTask(SectionType.GOOD_DEEDS)} className="bg-emerald-600 text-white w-8 h-8 rounded-xl flex items-center justify-center shadow-sm">
                <Icon name="fa-plus" className="text-xs" />
              </button>
            </div>

            {GOOD_DEED_CATEGORIES.map((cat, idx) => (
              <div key={idx} className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                <button onClick={() => setOpenDeedCategory(openDeedCategory === idx ? null : idx)} className="w-full flex items-center justify-between p-4 bg-emerald-50/30 dark:bg-[#1a1a1a]">
                  <span className="text-sm font-black text-emerald-700 dark:text-emerald-500">{cat.category}</span>
                  <Icon name="fa-chevron-down" className={`text-xs transition-transform ${openDeedCategory === idx ? 'rotate-180' : ''}`} />
                </button>
                {openDeedCategory === idx && (
                  <div className="p-4 bg-white dark:bg-[#151515] space-y-2 animate-fade-in">
                    {cat.tasks.map(task => (
                      <label key={task.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-emerald-50/30 transition-all cursor-pointer">
                        <input type="checkbox" checked={log.goodDeeds.includes(task.id)} onChange={() => toggleTask('goodDeeds', task.id)} className="mt-1 w-4 h-4 text-emerald-600" />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">{task.label}</span>
                          <span className="text-[9px] text-gray-500">{task.description}</span>
                        </div>
                      </label>
                    ))}
                    <div className="flex gap-2 mt-4 pt-2 border-t border-gray-50">
                       <input type="text" placeholder="غير ذلك..." value={manualInputs[`notes-${idx}`] || ''} onChange={(e) => setManualInputs(p => ({...p, [`notes-${idx}`]: e.target.value}))} className="flex-grow bg-gray-50 dark:bg-[#1a1a1a] text-xs p-3 rounded-xl outline-none" />
                       <button onClick={() => addManualEntry('notes', idx)} className="bg-emerald-600 text-white px-4 rounded-xl"><Icon name="fa-plus" className="inline-block" /></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="مجاهدة النفس" icon="shield" infoItems={getDailyInfo('MUJAHADA')}>
          <div className="space-y-3">
            {/* Custom Tasks for Mujahada */}
            {customTasks.filter(t => t.section === SectionType.MUJAHADA).length > 0 && (
              <div className="bg-red-50/30 dark:bg-[#1a1a1a] p-4 rounded-2xl border border-red-100 dark:border-gray-800">
                <h4 className="text-[10px] font-black uppercase text-red-800 dark:text-red-600 mb-3">مجاهدات مضافة يدوياً (- نقاط)</h4>
                <div className="grid grid-cols-1 gap-2">
                  {customTasks.filter(t => t.section === SectionType.MUJAHADA).map(task => (
                    <div key={task.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-[#151515] border border-gray-100 dark:border-gray-800 shadow-sm">
                      <label className="flex items-center gap-3 cursor-pointer flex-grow">
                        <input type="checkbox" checked={log.customTaskIds.includes(task.id)} onChange={() => toggleTask('customTaskIds', task.id)} className="w-4 h-4 text-red-600" />
                        <span className="text-xs font-bold text-slate-700 dark:text-gray-200">{task.label}</span>
                      </label>
                      <button onClick={() => removeCustomTask(task.id)} className="text-red-500/50 hover:text-red-500 transition-colors">
                        <Icon name="fa-trash-can" className="text-[10px]" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 p-2 bg-red-50/20 dark:bg-[#1a1a1a] rounded-2xl border border-dashed border-red-200 dark:border-gray-800">
              <input 
                type="text" 
                placeholder="إضافة مجاهدة يدوية دائمة..." 
                value={manualInputs[`custom-${SectionType.MUJAHADA}`] || ''} 
                onChange={(e) => setManualInputs(p => ({...p, [`custom-${SectionType.MUJAHADA}`]: e.target.value}))} 
                className="flex-grow bg-transparent text-xs p-2 outline-none" 
              />
              <button onClick={() => addCustomTask(SectionType.MUJAHADA)} className="bg-red-600 text-white w-8 h-8 rounded-xl flex items-center justify-center shadow-sm">
                <Icon name="fa-plus" className="text-xs" />
              </button>
            </div>

            {MUJAHADA_CATEGORIES.map((cat, idx) => (
              <div key={idx} className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                <button onClick={() => setOpenMujahadaCategory(openMujahadaCategory === idx ? null : idx)} className="w-full flex items-center justify-between p-4 bg-red-50/30 dark:bg-[#1a1a1a]">
                  <span className="text-sm font-black text-red-700 dark:text-red-500">{cat.category}</span>
                  <Icon name="fa-chevron-down" className={`text-xs transition-transform ${openMujahadaCategory === idx ? 'rotate-180' : ''}`} />
                </button>
                {openMujahadaCategory === idx && (
                  <div className="p-4 bg-white dark:bg-[#151515] space-y-2 animate-fade-in">
                    {cat.tasks.map(task => (
                      <label key={task.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-red-50/30 transition-all cursor-pointer">
                        <input type="checkbox" checked={log.mujahada.includes(task.id)} onChange={() => toggleTask('mujahada', task.id)} className="mt-1 w-4 h-4 text-red-600" />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">{task.label}</span>
                          <span className="text-[9px] text-gray-500">{task.description}</span>
                        </div>
                      </label>
                    ))}
                    <div className="flex gap-2 mt-4 pt-2 border-t border-gray-50">
                       <input type="text" placeholder="غير ذلك..." value={manualInputs[`mujahadaNotes-${idx}`] || ''} onChange={(e) => setManualInputs(p => ({...p, [`mujahadaNotes-${idx}`]: e.target.value}))} className="flex-grow bg-gray-50 dark:bg-[#1a1a1a] text-xs p-3 rounded-xl outline-none" />
                       <button onClick={() => addManualEntry('mujahadaNotes', idx)} className="bg-red-600 text-white px-4 rounded-xl"><Icon name="fa-plus" className="inline-block" /></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
      {/* Settings & Backup Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <button 
          onClick={() => setShowSettings(true)}
          className="w-14 h-14 bg-yellow-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform border-4 border-white dark:border-gray-900"
        >
          <Icon name="fa-cog" className="text-xl" />
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-[#151515]">
              <h3 className="text-lg font-black text-slate-800 dark:text-gray-100">الإعدادات والنسخ الاحتياطي</h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <Icon name="fa-times" className="text-xl" />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                  <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed font-bold">
                    <Icon name="fa-exclamation-circle" className="mr-1" />
                    يتم تخزين بياناتك محلياً على جهازك فقط. ننصح بعمل نسخة احتياطية دورياً لضمان عدم فقدان بياناتك عند تغيير الجهاز أو حذف التطبيق.
                  </p>
                </div>

                <button 
                  onClick={handleExport}
                  className="w-full flex items-center justify-between p-5 rounded-2xl bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Icon name="fa-file_export" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black">تصدير نسخة احتياطية</p>
                      <p className="text-[10px] opacity-70">حفظ بياناتك في ملف خارجي</p>
                    </div>
                  </div>
                  <Icon name="fa-chevron_left" className="text-xs group-hover:-translate-x-1 transition-transform" />
                </button>

                <label className="w-full flex items-center justify-between p-5 rounded-2xl bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Icon name="fa-file_import" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black">استيراد نسخة احتياطية</p>
                      <p className="text-[10px] opacity-70">استعادة بياناتك من ملف سابق</p>
                    </div>
                  </div>
                  <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                  <Icon name="fa-chevron_left" className="text-xs group-hover:-translate-x-1 transition-transform" />
                </label>

                <button 
                  onClick={() => NotificationService.testNotification()}
                  className="w-full flex items-center justify-between p-5 rounded-2xl bg-yellow-600 text-white shadow-lg hover:bg-yellow-700 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Icon name="fa-bell" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black">تجربة الإشعارات</p>
                      <p className="text-[10px] opacity-70">إرسال إشعار تجريبي الآن</p>
                    </div>
                  </div>
                  <Icon name="fa-chevron_left" className="text-xs group-hover:-translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">زاد المسلم - الإصدار 1.0.0</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
