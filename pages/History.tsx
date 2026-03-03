
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getLogs, getCustomTasks, getLogicalToday, formatDate } from '../services/storageService';
import { DailyLog } from '../types';
import { PRAYER_TASKS, AZKAR_CATEGORIES, GOOD_DEED_CATEGORIES, MUJAHADA_CATEGORIES, SYNC_MAPPINGS } from '../constants';
import { PdfService } from '../services/pdfService';
import { getHijriParts, hijriToGregorian, HIJRI_MONTHS } from '../services/dateUtils';

interface BreakdownItem {
  label: string;
  points: number;
  type: 'pos' | 'neg';
  category: string;
}

type ModalType = 'full' | 'goodDeeds' | 'mujahada';

// متغير الإزاحة اليدوية (HIJRI_OFFSET): 
const HIJRI_OFFSET = -1; 

const HijriDatePicker: React.FC<{ 
  label: string, 
  value: string, 
  onChange: (val: string) => void 
}> = ({ label, value, onChange }) => {
  const parts = useMemo(() => {
    const d = new Date(value);
    return getHijriParts(isNaN(d.getTime()) ? new Date() : d, HIJRI_OFFSET);
  }, [value]);
  
  const [day, setDay] = useState(parts.day);
  const [month, setMonth] = useState(parts.month);
  const [year, setYear] = useState(parts.year);

  // Sync state when value prop changes
  useEffect(() => {
    setDay(parts.day);
    setMonth(parts.month);
    setYear(parts.year);
  }, [parts.day, parts.month, parts.year]);

  const handleDayChange = (newDay: number) => {
    setDay(newDay);
    const newDate = hijriToGregorian(newDay, month, year, HIJRI_OFFSET);
    onChange(formatDate(newDate));
  };

  const handleMonthChange = (newMonth: number) => {
    setMonth(newMonth);
    const newDate = hijriToGregorian(day, newMonth, year, HIJRI_OFFSET);
    onChange(formatDate(newDate));
  };

  const handleYearChange = (newYear: number) => {
    setYear(newYear);
    const newDate = hijriToGregorian(day, month, newYear, HIJRI_OFFSET);
    onChange(formatDate(newDate));
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-black text-gray-400 mb-1 pr-1">{label}</label>
      <div className="grid grid-cols-3 gap-1 bg-gray-50 dark:bg-[#1a1a1a] p-2 rounded-2xl border-2 border-transparent focus-within:border-yellow-500/30">
        <select 
          value={day} 
          onChange={(e) => handleDayChange(parseInt(e.target.value))}
          className="bg-transparent text-[10px] font-black outline-none cursor-pointer"
        >
          {Array.from({ length: 30 }, (_, i) => i + 1).map(d => (
            <option key={d} value={d} className="dark:bg-[#1a1a1a]">{d}</option>
          ))}
        </select>
        <select 
          value={month} 
          onChange={(e) => handleMonthChange(parseInt(e.target.value))}
          className="bg-transparent text-[10px] font-black outline-none cursor-pointer"
        >
          {HIJRI_MONTHS.map((m, i) => (
            <option key={i} value={i + 1} className="dark:bg-[#1a1a1a]">{m}</option>
          ))}
        </select>
        <select 
          value={year} 
          onChange={(e) => handleYearChange(parseInt(e.target.value))}
          className="bg-transparent text-[10px] font-black outline-none cursor-pointer"
        >
          {Array.from({ length: 10 }, (_, i) => 1445 + i).map(y => (
            <option key={y} value={y} className="dark:bg-[#1a1a1a]">{y}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

const History: React.FC = () => {
  const [startDate, setStartDate] = useState(() => {
    const d = getLogicalToday();
    d.setDate(d.getDate() - 30); // Default to last 30 days
    return formatDate(d);
  });
  const [endDate, setEndDate] = useState(() => {
    return formatDate(getLogicalToday());
  });
  
  const [isHijriMode, setIsHijriMode] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [activeBreakdownDate, setActiveBreakdownDate] = useState<string | null>(null);
  const [modalType, setModalType] = useState<ModalType>('full');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState('');
  const reportRef = useRef<HTMLDivElement>(null);

  const logs = useMemo(() => getLogs(), []);

  const formatArabicDate = (dateStr: string, forceHijri?: boolean) => {
    try {
      const date = new Date(dateStr);
      const useHijri = forceHijri ?? isHijriMode;
      
      if (useHijri) {
        date.setDate(date.getDate() + HIJRI_OFFSET);
      }
      
      const calendar = useHijri ? 'islamic-umalqura' : 'gregory';
      
      return new Intl.DateTimeFormat(`ar-SA-u-ca-${calendar}-nu-latn`, { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        weekday: 'long'
      }).format(date);
    } catch (e) { return dateStr; }
  };

  const filteredDates = useMemo(() => {
    return Object.keys(logs)
      .filter(date => date >= startDate && date <= endDate)
      .sort((a, b) => b.localeCompare(a));
  }, [logs, startDate, endDate]);

  const getDayDetails = (log: DailyLog) => {
    const posItems: BreakdownItem[] = [];
    const negItems: BreakdownItem[] = [];
    const fardIds = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

    fardIds.forEach(id => {
      const task = PRAYER_TASKS.find(t => t.id === id);
      if (log.prayers.includes(id)) {
        posItems.push({ label: task?.label || id, points: 10, type: 'pos', category: 'الفرائض' });
      } else {
        negItems.push({ label: `فوات ${task?.label || id}`, points: -10, type: 'neg', category: 'التقصير' });
      }
    });

    const syncedTargets = Object.values(SYNC_MAPPINGS).map(m => m.target);

    log.prayers.filter(id => !fardIds.includes(id) && !syncedTargets.includes(id)).forEach(id => {
      const task = PRAYER_TASKS.find(t => t.id === id);
      posItems.push({ label: task?.label || id, points: 10, type: 'pos', category: 'النوافل' });
    });

    if (log.nawafilCount > 0) {
      posItems.push({ label: `تطوع مطلق (${log.nawafilCount} ركعة)`, points: log.nawafilCount * 10, type: 'pos', category: 'النوافل' });
    }

    log.azkar.filter(id => !syncedTargets.includes(id)).forEach(id => {
      let task = null;
      for (const cat of AZKAR_CATEGORIES) { task = cat.tasks.find(t => t.id === id); if (task) break; }
      posItems.push({ label: task?.label || id, points: 10, type: 'pos', category: 'الأذكار' });
    });

    log.goodDeeds.forEach(id => {
      let task = null;
      for (const cat of GOOD_DEED_CATEGORIES) { task = cat.tasks.find(t => t.id === id); if (task) break; }
      posItems.push({ label: task?.label || id, points: 10, type: 'pos', category: 'أعمال البر' });
    });
    log.notes.forEach(note => posItems.push({ label: note, points: 10, type: 'pos', category: 'أعمال إضافية' }));

    if (log.quranEnd > log.quranStart) posItems.push({ label: `قراءة القرآن (${log.quranEnd - log.quranStart} ص)`, points: 10, type: 'pos', category: 'القرآن' });
    if (log.quranTadabburNote) posItems.push({ label: 'تدبر آية', points: 10, type: 'pos', category: 'القرآن' });
    if (log.quranActionNote) posItems.push({ label: 'تطبيق عملي', points: 10, type: 'pos', category: 'القرآن' });

    log.mujahada.forEach(id => {
      let task = null;
      for (const cat of MUJAHADA_CATEGORIES) { task = cat.tasks.find(t => t.id === id); if (task) break; }
      negItems.push({ label: task?.label || id, points: -10, type: 'neg', category: 'المجاهدة' });
    });
    log.mujahadaNotes.forEach(note => negItems.push({ label: note, points: -10, type: 'neg', category: 'المجاهدة' }));

    log.customTaskIds.forEach(id => {
      const task = getCustomTasks().find(t => t.id === id);
      if (task) {
        if (task.section === 'MUJAHADA') {
          negItems.push({ label: task.label, points: -10, type: 'neg', category: 'المجاهدة (يدوي)' });
        } else {
          posItems.push({ label: task.label, points: 10, type: 'pos', category: 'مهام يدوية' });
        }
      }
    });

    const posTotal = posItems.reduce((acc, item) => acc + item.points, 0);
    const negTotal = negItems.reduce((acc, item) => acc + item.points, 0);
    return { posItems, negItems, posTotal, negTotal, netTotal: posTotal + negTotal };
  };

  const handleOpenModal = (date: string, type: ModalType) => {
    setActiveBreakdownDate(date);
    setModalType(type);
  };

  const handlePdfAction = async (action: 'save' | 'share') => {
    setIsGeneratingPdf(true);
    setPdfProgress('جاري تحضير البيانات...');
    try {
      const fileName = `zad_almuslim_report_${startDate}_to_${endDate}.pdf`;
      setPdfProgress('جاري توليد التقرير...');
      const blob = await PdfService.generatePdf('professional-report', fileName);
      if (blob) {
        setPdfProgress('جاري الحفظ...');
        if (action === 'save') {
          await PdfService.savePdf(blob, fileName);
        } else {
          await PdfService.sharePdf(blob, fileName);
        }
      }
    } catch (error) {
      console.error('PDF Action failed:', error);
      alert('حدث خطأ أثناء توليد التقرير');
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress('');
    }
  };

  const totalNetScore = useMemo(() => {
    return filteredDates.reduce((acc, date) => acc + getDayDetails(logs[date]).netTotal, 0);
  }, [filteredDates, logs]);

  return (
    <div className="animate-fade-in space-y-6 pb-12 print:p-0 relative">
      {/* PDF Compatibility Styles - Fixes oklch/oklab error for html2canvas */}
      <style>{`
        #professional-report, #professional-report * {
          --tw-text-opacity: 1 !important;
          --tw-bg-opacity: 1 !important;
          --tw-border-opacity: 1 !important;
          --tw-shadow: 0 0 #0000 !important;
          --tw-shadow-colored: 0 0 #0000 !important;
          box-shadow: none !important;
          text-shadow: none !important;
        }
        #professional-report {
          color: #000000 !important;
          background-color: #ffffff !important;
        }
        .bg-white { background-color: #ffffff !important; }
        .bg-slate-900 { background-color: #0f172a !important; }
        .bg-yellow-600 { background-color: #ca8a04 !important; }
        .bg-emerald-600 { background-color: #059669 !important; }
        .bg-yellow-500 { background-color: #eab308 !important; }
        .bg-slate-100 { background-color: #f1f5f9 !important; }
        .bg-slate-50 { background-color: #f8fafc !important; }
        .bg-emerald-50 { background-color: #ecfdf5 !important; }
        .bg-emerald-50\/30 { background-color: rgba(236, 253, 245, 0.3) !important; }
        .bg-red-50 { background-color: #fef2f2 !important; }
        .bg-red-50\/30 { background-color: rgba(254, 242, 242, 0.3) !important; }
        .bg-slate-50\/30 { background-color: rgba(248, 250, 252, 0.3) !important; }
        .text-white { color: #ffffff !important; }
        .text-black { color: #000000 !important; }
        .text-slate-900 { color: #0f172a !important; }
        .text-slate-800 { color: #1e293b !important; }
        .text-slate-700 { color: #334155 !important; }
        .text-slate-600 { color: #475569 !important; }
        .text-slate-500 { color: #64748b !important; }
        .text-yellow-700 { color: #a16207 !important; }
        .text-yellow-600 { color: #ca8a04 !important; }
        .text-yellow-600\/40 { color: rgba(202, 138, 4, 0.4) !important; }
        .text-emerald-700 { color: #047857 !important; }
        .text-emerald-600 { color: #059669 !important; }
        .text-red-700 { color: #b91c1c !important; }
        .text-red-600 { color: #dc2626 !important; }
        .text-red-500 { color: #ef4444 !important; }
        .text-gray-500 { color: #6b7280 !important; }
        .text-gray-400 { color: #9ca3af !important; }
        .text-gray-300 { color: #d1d5db !important; }
        .border-yellow-600 { border-color: #ca8a04 !important; }
        .border-yellow-600\/20 { border-color: rgba(202, 138, 4, 0.2) !important; }
        .border-slate-100 { border-color: #f1f5f9 !important; }
        .border-slate-200 { border-color: #e2e8f0 !important; }
        .border-emerald-100 { border-color: #d1fae5 !important; }
        .border-emerald-100\/50 { border-color: rgba(209, 250, 229, 0.5) !important; }
        .border-red-100 { border-color: #fee2e2 !important; }
        .border-red-100\/50 { border-color: rgba(254, 226, 226, 0.5) !important; }
        .border-gray-100 { border-color: #f3f4f6 !important; }
        .border-b-8 { border-bottom-width: 8px !important; }
        .border-b-2 { border-bottom-width: 2px !important; }
        .border-b { border-bottom-width: 1px !important; }
        .gold-gradient {
          background: none !important;
          background-clip: border-box !important;
          -webkit-background-clip: border-box !important;
          color: #d4af37 !important;
          text-fill-color: #d4af37 !important;
          -webkit-text-fill-color: #d4af37 !important;
        }
        /* Dark-mode overrides for the professional report clone */
        .dark #professional-report, .dark #professional-report * {
          color: #e6eef8 !important;
          background-color: transparent !important;
          border-color: rgba(255,255,255,0.06) !important;
        }
        .dark #professional-report { background-color: #0b1220 !important; }
        .dark #professional-report .bg-white { background-color: #0b1220 !important; color: #e6eef8 !important; }
        .dark #professional-report .bg-slate-100 { background-color: #0b1220 !important; }
        .dark #professional-report .bg-slate-50 { background-color: #071018 !important; }
        .dark #professional-report .text-slate-900, .dark #professional-report .text-slate-800 { color: #e6eef8 !important; }
        .dark #professional-report .text-gray-400 { color: #9ca3af !important; }
        .dark #professional-report .bg-slate-900 { background-color: #071018 !important; }
        .dark #professional-report .bg-yellow-500 { background-color: #b45309 !important; }
        .dark #professional-report .bg-yellow-600 { background-color: #92400e !important; }
      `}</style>
      {/* Print / ERP single-page styles */}
      <style>{`
        /* Ensure the professional report prints as a single A4-styled page */
        #professional-report {
          width: 210mm !important;
          min-height: 297mm !important;
          box-sizing: border-box !important;
          padding: 20mm !important;
          background: #ffffff !important;
          color: #0f172a !important;
          font-size: 12pt !important;
        }

        #professional-report h1, #professional-report h2, #professional-report h3 {
          page-break-after: avoid;
        }

        #professional-report table {
          width: 100% !important;
          border-collapse: collapse !important;
          font-size: 11pt !important;
        }

        #professional-report th, #professional-report td {
          padding: 8px 10px !important;
          border: 1px solid #e6e6e6 !important;
          vertical-align: middle !important;
        }

        /* Condensed ERP-style table for per-day rows */
        #professional-report .erp-table th { background: #f3f4f6 !important; color: #0f172a !important; }
        #professional-report .erp-table td { color: #1f2937 !important; }

        /* Reduce visual clutter and enforce single-page when possible */
        #professional-report .mb-12 { margin-bottom: 0 !important; }

        /* Force print-friendly colors even if dark mode is active */
        @media print {
          html, body { background: white !important; color: black !important; }
          #professional-report { background: #ffffff !important; color: #0f172a !important; }
          nav, header, .print\:hidden { display: none !important; }
          .rounded-[2.5rem], .rounded-[3rem] { border-radius: 8px !important; }
        }
      `}</style>

      {/* PDF Generation Overlay */}
      {isGeneratingPdf && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-white">
          <div className="w-24 h-24 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin mb-6"></div>
          <h2 className="text-2xl font-black mb-2 quran-font">جاري إنشاء التقرير الاحترافي</h2>
          <p className="text-sm font-bold text-yellow-500 animate-pulse">{pdfProgress}</p>
        </div>
      )}

      {/* Hidden Professional Report Template */}
      <div id="professional-report" className="fixed -left-[9999px] top-0 w-[210mm] bg-white dark:bg-[#071018] text-black dark:text-gray-100 p-[25mm] font-sans" dir="rtl">
        {/* Header Section with Logo */}
        <div className="flex justify-between items-start border-b-8 border-yellow-600 pb-10 mb-10">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-yellow-600 rounded-[2rem] flex items-center justify-center text-white text-6xl font-black shadow-2xl shadow-yellow-600/20 quran-font">
              ز
            </div>
            <div className="space-y-2">
              <h1 className="text-5xl font-black text-slate-900 quran-font tracking-tighter">زاد المسلم</h1>
              <p className="text-lg font-bold text-yellow-700 uppercase tracking-[0.2em]">التقرير الإيماني الاستراتيجي</p>
              <div className="h-1 w-24 bg-slate-200 mt-4"></div>
            </div>
          </div>
          <div className="text-left space-y-1">
            <div className="bg-slate-900 text-white px-4 py-2 rounded-xl mb-4 text-center">
              <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">معرف التقرير</p>
              <p className="text-sm font-black">ZM-{new Date().getTime().toString().slice(-6)}</p>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">تاريخ الإصدار</p>
            <p className="text-sm font-bold text-slate-800">{new Date().toLocaleDateString('ar-SA')}</p>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mb-12">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-6 border-b border-gray-100 pb-2">الملخص التنفيذي</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
              <p className="text-[9px] font-black opacity-60 uppercase mb-2">إجمالي النقاط</p>
              <p className="text-4xl font-black">{totalNetScore}</p>
            </div>
            <div className="bg-emerald-600 text-white p-6 rounded-3xl shadow-xl">
              <p className="text-[9px] font-black opacity-60 uppercase mb-2">أيام الالتزام</p>
              <p className="text-4xl font-black">{filteredDates.length}</p>
            </div>
            <div className="bg-yellow-500 text-white p-6 rounded-3xl shadow-xl">
              <p className="text-[9px] font-black opacity-60 uppercase mb-2">متوسط الأداء</p>
              <p className="text-4xl font-black">{filteredDates.length > 0 ? Math.round(totalNetScore / filteredDates.length) : 0}</p>
            </div>
            <div className="bg-slate-100 p-6 rounded-3xl border border-slate-200">
              <p className="text-[9px] font-black text-gray-400 uppercase mb-2">أعلى رصيد</p>
              <p className="text-4xl font-black text-slate-800">
                {filteredDates.length > 0 ? Math.max(...filteredDates.map(d => getDayDetails(logs[d]).netTotal)) : 0}
              </p>
            </div>
          </div>
        </div>

        {/* Performance Analysis Table */}
        <div className="mb-12">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-6 border-b border-gray-100 pb-2">تحليل الأداء التفصيلي</h2>
          <table className="w-full text-right border-collapse overflow-hidden rounded-2xl border border-slate-100 erp-table">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[9px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="p-5">التاريخ</th>
                <th className="p-5">القرآن (صفحات)</th>
                <th className="p-5">الصلوات</th>
                <th className="p-5">الأذكار</th>
                <th className="p-5">أعمال البر</th>
                <th className="p-5">المجاهدة</th>
                <th className="p-5 text-center">الصافي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredDates.map(date => {
                const log = logs[date];
                const { netTotal } = getDayDetails(log);
                return (
                  <tr key={date} className="text-[10px] font-bold text-slate-700">
                    <td className="p-5 bg-slate-50/30">{formatArabicDate(date)}</td>
                    <td className="p-5">{log.quranEnd > log.quranStart ? `${log.quranEnd - log.quranStart} ص` : '-'}</td>
                    <td className="p-5">{log.prayers.length} / 5</td>
                    <td className="p-5">{log.azkar.length}</td>
                    <td className="p-5">{log.goodDeeds.length + log.notes.length}</td>
                    <td className="p-5 text-red-500">{log.mujahada.length + log.mujahadaNotes.length}</td>
                    <td className="p-5 text-center">
                      <span className={`px-3 py-1 rounded-full font-black ${netTotal >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {netTotal > 0 ? `+${netTotal}` : netTotal}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Detailed Daily Breakdown - Arabic narrative per day (ERP-style) */}
        <div className="mb-12">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-6 border-b border-gray-100 pb-2">التفصيل اليومي</h2>
          <div className="space-y-6">
            {filteredDates.map(date => {
              const dayLog = logs[date];
              const { posItems, negItems, netTotal } = getDayDetails(dayLog);
              return (
                <div key={date} className="p-6 rounded-2xl border border-slate-100 bg-white dark:bg-[#071018] dark:border-gray-800 text-slate-900 dark:text-gray-200">
                  <h3 className="text-sm font-black text-slate-900 dark:text-gray-100 mb-2">{formatArabicDate(date)} — {formatArabicDate(date, true)}</h3>
                  <p className="text-[13px] font-bold text-slate-700 dark:text-gray-300 mb-3">جملة الأداء: إجمالي النقاط لهذا اليوم <span className={`font-extrabold ${netTotal >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{netTotal > 0 ? `+${netTotal}` : netTotal}</span>.</p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-[12px] font-black text-emerald-700 mb-2">الأعمال والإيجابيات ({posItems.length})</h4>
                      {posItems.length > 0 ? (
                        <ul className="list-decimal list-inside text-[12px] text-slate-700 space-y-1">
                          {posItems.map((it, i) => (
                            <li key={i}><span className="font-bold">{it.label}</span> — <span className="text-gray-500">{it.category}</span> ({it.points > 0 ? `+${it.points}` : it.points})</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[12px] text-gray-500 italic">لم تُسجل أعمال إيجابية لهذا اليوم.</p>
                      )}
                    </div>

                    <div>
                      <h4 className="text-[12px] font-black text-red-700 mb-2">الزلات والملاحظات ({negItems.length})</h4>
                      {negItems.length > 0 ? (
                        <ul className="list-disc list-inside text-[12px] text-slate-700 space-y-1">
                          {negItems.map((it, i) => (
                            <li key={i}><span className="font-bold">{it.label}</span> — <span className="text-gray-500">{it.category}</span> ({it.points})</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[12px] text-gray-500 italic">لم تُسجل زلات لهذا اليوم.</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 text-[12px] text-gray-600">
                    <p className="font-black">ملاحظة موجزة:</p>
                    <p>
                      في {formatArabicDate(date)} كان إجمالي الأعمال {posItems.length} عناصر، والملاحظات {negItems.length} عناصر. هذه الخلاصة تُسهل مراجعة الأداء اليومي بشكل سريع ومفصّل.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Strategic Insights */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              نقاط القوة والتميز
            </h3>
            <div className="bg-emerald-50/30 p-6 rounded-3xl border border-emerald-100/50 space-y-3">
              <p className="text-[10px] font-bold text-slate-600 leading-relaxed">
                • تم تحقيق {filteredDates.filter(d => logs[d].prayers.length >= 5).length} يوماً من الالتزام الكامل بالصلوات الخمس.
              </p>
              <p className="text-[10px] font-bold text-slate-600 leading-relaxed">
                • إجمالي صفحات القرآن المقروءة: {filteredDates.reduce((acc, d) => acc + Math.max(0, logs[d].quranEnd - logs[d].quranStart), 0)} صفحة.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-red-700 uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              فرص التحسين والمجاهدة
            </h3>
            <div className="bg-red-50/30 p-6 rounded-3xl border border-red-100/50 space-y-3">
              <p className="text-[10px] font-bold text-slate-600 leading-relaxed">
                • تم تسجيل {filteredDates.reduce((acc, d) => acc + logs[d].mujahada.length + logs[d].mujahadaNotes.length, 0)} زلة تتطلب مزيداً من اليقظة.
              </p>
              <p className="text-[10px] font-bold text-slate-600 leading-relaxed">
                • أيام التقصير في السنن الرواتب: {filteredDates.filter(d => logs[d].prayers.length < 10).length} يوماً.
              </p>
            </div>
          </div>
        </div>

        {/* Professional Stamp & Signature */}
        <div className="flex justify-between items-center mb-12">
          <div className="text-center space-y-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">توقيع المستخدم</p>
            <div className="w-48 h-12 border-b-2 border-slate-200"></div>
          </div>
          <div className="relative">
            <div className="w-32 h-32 border-4 border-yellow-600/20 rounded-full flex items-center justify-center rotate-12">
              <div className="text-center">
                <p className="text-[8px] font-black text-yellow-600/40 uppercase tracking-widest">ZAD AL-MUSLIM</p>
                <p className="text-xl font-black text-yellow-600/40 quran-font">مُعتمد</p>
                <p className="text-[8px] font-black text-yellow-600/40 uppercase tracking-widest">OFFICIAL STAMP</p>
              </div>
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ختم المؤسسة</p>
            <div className="w-48 h-12 border-b-2 border-slate-200"></div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-10 border-t border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-600 rounded-xl flex items-center justify-center text-white font-black text-xl">ز</div>
            <div>
              <p className="text-[10px] font-black text-slate-900">زاد المسلم</p>
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">رفيقك الإيماني الذكي</p>
            </div>
          </div>
          <div className="text-left">
            <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.4em]">CONFIDENTIAL REPORT</p>
            <p className="text-[8px] font-bold text-gray-400">© {new Date().getFullYear()} Zad Al-Muslim App. All rights reserved.</p>
          </div>
        </div>
      </div>
      {/* Dynamic Detail Modal */}
      {activeBreakdownDate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl" onClick={() => setActiveBreakdownDate(null)}>
          <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border-4 border-yellow-600/30" onClick={e => e.stopPropagation()}>
            <div className={`p-8 bg-gradient-to-br text-white relative ${
              modalType === 'goodDeeds' ? 'from-emerald-700 via-emerald-600 to-emerald-800' :
              modalType === 'mujahada' ? 'from-red-700 via-red-600 to-red-800' :
              'from-yellow-700 via-yellow-600 to-yellow-800'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-black mb-1 quran-font">
                    {modalType === 'goodDeeds' ? 'تفاصيل أعمال البر' : 
                     modalType === 'mujahada' ? 'كشف الزلات والمجاهدة' : 
                     'التقرير الإيماني الشامل'}
                  </h2>
                  <p className="text-xs font-bold opacity-90">{formatArabicDate(activeBreakdownDate, false)}</p>
                  <p className="text-sm font-black text-white/70">{formatArabicDate(activeBreakdownDate, true)}</p>
                </div>
                <button onClick={() => setActiveBreakdownDate(null)} className="w-12 h-12 rounded-full bg-white/20 dark:bg-gray-700/30 hover:bg-white/40 dark:hover:bg-gray-600/40 flex items-center justify-center transition-all">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>
            
            <div className="flex-grow overflow-y-auto p-8 space-y-8">
              {(modalType === 'full') && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-3xl text-center border-2 border-emerald-100">
                    <span className="text-[10px] font-black text-emerald-600 block mb-1">الإيجابي</span>
                    <span className="text-3xl font-black text-emerald-600">+{getDayDetails(logs[activeBreakdownDate]).posTotal}</span>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-3xl text-center border-2 border-red-100">
                    <span className="text-[10px] font-black text-red-600 block mb-1">السلبي</span>
                    <span className="text-3xl font-black text-red-600">{getDayDetails(logs[activeBreakdownDate]).negTotal}</span>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/10 p-5 rounded-3xl text-center border-4 border-yellow-500 shadow-xl">
                    <span className="text-[10px] font-black text-yellow-600 block mb-1">الصافي</span>
                    <span className="text-3xl font-black text-yellow-600">{getDayDetails(logs[activeBreakdownDate]).netTotal}</span>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {(modalType === 'full' || modalType === 'goodDeeds') && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-black text-emerald-700 flex items-center gap-2"><i className="fas fa-star"></i> الطاعات وأعمال الخير</h3>
                    {getDayDetails(logs[activeBreakdownDate]).posItems.filter(i => modalType === 'full' || i.category.includes('البر') || i.category.includes('إضافية')).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-emerald-50/30 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/20">
                        <div><span className="text-xs font-bold block dark:text-emerald-500">{item.label}</span><span className="text-[9px] text-gray-400 dark:text-gray-500">{item.category}</span></div>
                        <span className="text-emerald-600 dark:text-emerald-400 font-black">+{item.points}</span>
                      </div>
                    ))}
                    {modalType === 'goodDeeds' && getDayDetails(logs[activeBreakdownDate]).posItems.filter(i => i.category.includes('البر') || i.category.includes('إضافية')).length === 0 && (
                      <div className="text-center py-10 text-gray-400 text-xs italic">لم يتم تسجيل أعمال بر لهذا اليوم</div>
                    )}
                  </div>
                )}

                {(modalType === 'full' || modalType === 'mujahada') && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-black text-red-700 flex items-center gap-2"><i className="fas fa-exclamation-circle"></i> الزلات والمجاهدة</h3>
                    {getDayDetails(logs[activeBreakdownDate]).negItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-red-50/30 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100/50 dark:border-red-900/20">
                        <div><span className="text-xs font-bold block dark:text-red-500">{item.label}</span><span className="text-[9px] text-gray-400 dark:text-gray-500">{item.category}</span></div>
                        <span className="text-red-600 dark:text-red-400 font-black">{item.points}</span>
                      </div>
                    ))}
                    {modalType === 'mujahada' && getDayDetails(logs[activeBreakdownDate]).negItems.length === 0 && (
                      <div className="text-center py-10 text-emerald-600 text-xs font-black">الحمد لله، يومك خالٍ من الزلات المسجلة</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary Card */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-[3rem] p-10 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-yellow-600"></div>
        <h2 className="text-gray-400 dark:text-gray-500 text-[10px] mb-2 font-black tracking-widest uppercase">رصيد الإيمان الكلي</h2>
        <div className="text-8xl font-black gold-gradient mb-6 drop-shadow-xl">{totalNetScore}</div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="text-[11px] text-yellow-800 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 px-6 py-2 rounded-full border border-yellow-200 dark:border-yellow-900/30 font-black">
            <i className="fas fa-calendar-alt ml-2"></i> {formatArabicDate(startDate)} - {formatArabicDate(endDate)}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => handlePdfAction('save')} 
              disabled={isGeneratingPdf}
              className="text-[11px] bg-slate-800 text-white px-6 py-2 rounded-full hover:bg-slate-700 transition-all flex items-center gap-2 print:hidden shadow-lg disabled:opacity-50"
            >
              <i className={`fas ${isGeneratingPdf ? 'fa-spinner fa-spin' : 'fa-download'}`}></i> 
              {isGeneratingPdf ? 'جاري التحميل...' : 'حفظ التقرير PDF'}
            </button>
            <button 
              onClick={() => handlePdfAction('share')} 
              disabled={isGeneratingPdf}
              className="text-[11px] bg-yellow-600 text-white px-6 py-2 rounded-full hover:bg-yellow-700 transition-all flex items-center gap-2 print:hidden shadow-lg disabled:opacity-50"
            >
              <i className={`fas ${isGeneratingPdf ? 'fa-spinner fa-spin' : 'fa-share-nodes'}`}></i> 
              {isGeneratingPdf ? 'جاري المعالجة...' : 'مشاركة التقرير'}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tools */}
      <div className="bg-white dark:bg-[#151515] p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-lg flex flex-col md:flex-row gap-6 items-center print:hidden">
        <div className="grid grid-cols-2 gap-4 w-full">
          {isHijriMode ? (
            <>
              <HijriDatePicker label="من تاريخ (هجري)" value={startDate} onChange={setStartDate} />
              <HijriDatePicker label="إلى تاريخ (هجري)" value={endDate} onChange={setEndDate} />
            </>
          ) : (
            <>
              <div className="flex flex-col">
                <label className="text-[10px] font-black text-gray-400 mb-1 pr-1">من تاريخ</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-gray-50 dark:bg-[#1a1a1a] p-3 rounded-2xl text-xs font-black outline-none border-2 border-transparent focus:border-yellow-500/30" />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-black text-gray-400 mb-1 pr-1">إلى تاريخ</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-gray-50 dark:bg-[#1a1a1a] p-3 rounded-2xl text-xs font-black outline-none border-2 border-transparent focus:border-yellow-500/30" />
              </div>
            </>
          )}
        </div>
        <button 
          onClick={() => setIsHijriMode(!isHijriMode)} 
          className={`px-8 py-4 rounded-2xl shadow-xl font-black text-sm transition-all flex items-center justify-center gap-2 w-full md:w-auto ${isHijriMode ? 'bg-yellow-600 text-white hover:bg-yellow-700' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
        >
          <i className={`fas ${isHijriMode ? 'fa-kaaba' : 'fa-calendar-day'}`}></i>
          {isHijriMode ? 'عرض بالميلادي' : 'عرض بالهجري'}
        </button>

        <div className="flex flex-col bg-gray-100 dark:bg-[#1a1a1a] p-4 rounded-2xl gap-2 w-full md:w-64">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">حجم الجدول: {zoom}%</span>
            <button onClick={() => setZoom(100)} className="text-[9px] font-black text-yellow-600 hover:underline">إعادة ضبط</button>
          </div>
          <input 
            type="range" 
            min="60" 
            max="120" 
            step="5"
            value={zoom} 
            onChange={(e) => setZoom(parseInt(e.target.value))}
            className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-600"
          />
          <div className="flex justify-between text-[8px] font-black text-gray-400 px-1">
            <span>صغير جداً</span>
            <span>طبيعي</span>
            <span>كبير</span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="relative group/table">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none opacity-0 group-hover/table:opacity-100 transition-opacity md:hidden">
          <div className="bg-yellow-600/80 text-white p-2 rounded-full animate-pulse shadow-lg">
            <i className="fas fa-chevron-left"></i>
          </div>
        </div>
        
        <div 
          className="bg-white dark:bg-[#151515] rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 transition-all duration-300"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', marginBottom: `${(zoom - 100) * 2}px` }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-right min-w-[1000px] border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#1a1a1a] text-[10px] text-gray-500 uppercase font-black tracking-widest">
                  <th className="p-6 md:p-8 border-l border-gray-100 dark:border-gray-800">التاريخ ({isHijriMode ? 'الهجري' : 'الميلادي'})</th>
                  <th className="p-6 md:p-8">القرآن</th>
                  <th className="p-6 md:p-8">الصلوات</th>
                  <th className="p-6 md:p-8">الأذكار</th>
                  <th className="p-6 md:p-8">أعمال البر</th>
                  <th className="p-6 md:p-8 text-red-600">المجاهدة</th>
                  <th className="p-6 md:p-8 text-center">المجموع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredDates.map((date, idx) => {
                  const log = logs[date];
                  const { netTotal } = getDayDetails(log);
                  const hasZalla = log.mujahada.length + log.mujahadaNotes.length > 0;
                  const cellPadding = zoom < 80 ? 'p-3 md:p-4' : zoom < 100 ? 'p-4 md:p-6' : 'p-6 md:p-8';
                  const fontSize = zoom < 80 ? 'text-[11px]' : zoom < 100 ? 'text-xs' : 'text-sm';
                  const badgeSize = zoom < 80 ? 'px-1.5 py-0.5' : zoom < 100 ? 'px-2 py-1' : 'px-3 py-1.5';
                  const iconSize = zoom < 80 ? 'w-7 h-7 md:w-8 md:h-8' : zoom < 100 ? 'w-8 h-8 md:w-10 md:h-10' : 'w-10 h-10 md:w-12 md:h-12';

                  return (
                    <motion.tr 
                      key={date}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-yellow-50/20 dark:hover:bg-yellow-900/10 transition-all group relative"
                    >
                      <td onClick={() => handleOpenModal(date, 'full')} className={`${cellPadding} border-l border-gray-100 dark:border-gray-800 cursor-pointer`}>
                        <div className="flex flex-col whitespace-nowrap">
                          <span className={`${fontSize} font-black text-slate-800 dark:text-gray-100 group-hover:text-yellow-700 transition-colors`}>
                             {formatArabicDate(date)}
                          </span>
                          <span className="text-[9px] text-gray-400 mt-1 font-bold">
                            {isHijriMode ? formatArabicDate(date, false) : formatArabicDate(date, true)}
                          </span>
                        </div>
                      </td>
                      <td className={cellPadding}>
                        {log.quranEnd > log.quranStart ? (
                          <div className={`inline-flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 ${badgeSize} rounded-full border border-yellow-200 whitespace-nowrap`}>
                            <i className="fas fa-book-quran text-yellow-600"></i>
                            <span className={`${zoom < 100 ? 'text-[9px]' : 'text-[10px]'} font-black`}>ص {log.quranStart}-{log.quranEnd}</span>
                          </div>
                        ) : <span className="text-gray-200">-</span>}
                      </td>
                      <td className={cellPadding}>
                        <div className="flex items-center gap-1 md:gap-2">
                          {['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map(f => (
                            <div key={f} className={`${zoom < 80 ? 'w-2.5 h-2.5 md:w-3 md:h-3' : zoom < 100 ? 'w-3 h-3 md:w-3.5 md:h-3.5' : 'w-3.5 h-3.5 md:w-4 md:h-4'} rounded-full border-2 ${log.prayers.includes(f) ? 'bg-emerald-500 border-emerald-100' : 'bg-red-500/20 border-red-500/40'}`}></div>
                          ))}
                        </div>
                      </td>
                      <td className={cellPadding}>
                        <span className={`inline-flex items-center justify-center ${zoom < 100 ? 'text-[9px]' : 'text-[10px]'} font-black bg-purple-50 dark:bg-purple-900/20 text-purple-600 ${badgeSize} rounded-2xl border border-purple-100 whitespace-nowrap`}>
                          {log.azkar.length} ذِكر
                        </span>
                      </td>
                      <td className={cellPadding}>
                        <div className="flex items-center gap-2 md:gap-4">
                          <span className={`inline-flex items-center justify-center ${zoom < 100 ? 'text-[9px]' : 'text-[10px]'} font-black bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 ${badgeSize} rounded-2xl border border-emerald-100 min-w-[60px] text-center whitespace-nowrap`}>
                            {log.goodDeeds.length + log.notes.length} عملاً
                          </span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleOpenModal(date, 'goodDeeds'); }}
                            className={`${iconSize} flex-shrink-0 rounded-2xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 hover:scale-110 transition-all shadow-xl shadow-emerald-500/30`}
                          >
                             <i className={`fas fa-eye ${zoom < 100 ? 'text-xs md:text-sm' : 'text-sm md:text-lg'}`}></i>
                          </button>
                        </div>
                      </td>
                      <td className={cellPadding}>
                        <div className="flex items-center gap-2 md:gap-4">
                          <span className={`inline-flex items-center justify-center ${zoom < 100 ? 'text-[9px]' : 'text-[10px]'} font-black ${badgeSize} rounded-2xl border min-w-[60px] text-center whitespace-nowrap bg-red-50 dark:bg-red-900/40 text-red-600 border-red-100 transition-all ${hasZalla ? 'shadow-lg shadow-red-500/20 font-extrabold' : 'opacity-60'}`}>
                            {log.mujahada.length + log.mujahadaNotes.length} زلة
                          </span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleOpenModal(date, 'mujahada'); }}
                            className={`${iconSize} flex-shrink-0 rounded-2xl flex items-center justify-center transition-all shadow-xl bg-red-600 text-white shadow-red-600/30 hover:bg-red-700 hover:scale-110 ${!hasZalla ? 'opacity-40 grayscale-[0.5]' : 'animate-pulse'}`}
                          >
                            <i className={`fas fa-eye ${zoom < 100 ? 'text-xs md:text-sm' : 'text-sm md:text-lg'}`}></i>
                          </button>
                        </div>
                      </td>
                      <td 
                        onClick={(e) => { e.stopPropagation(); handleOpenModal(date, 'full'); }}
                        className={`${cellPadding} text-center cursor-pointer group/cell`}
                      >
                        <span className={`inline-flex items-center justify-center ${zoom < 80 ? 'px-3 py-1.5 md:px-4 md:py-2 text-[8px] md:text-[9px]' : zoom < 100 ? 'px-4 py-2 md:px-5 md:py-2.5 text-[9px] md:text-[10px]' : 'px-5 py-2.5 md:px-6 md:py-3 text-[10px] md:text-xs'} font-black shadow-xl transition-transform group-hover/cell:scale-110 whitespace-nowrap ${netTotal >= 0 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-red-600'} text-white min-w-[70px] md:min-w-[80px]`}>
                          {netTotal > 0 ? `+${netTotal}` : netTotal}
                        </span>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          nav, header, .print\\:hidden { display: none !important; }
          body { background: white !important; padding: 20px !important; color: black !important; }
          .rounded-[2.5rem], .rounded-[3rem] { border-radius: 10px !important; border: 1px solid #eee !important; box-shadow: none !important; }
          table { width: 100% !important; border-collapse: collapse !important; }
          th, td { border: 1px solid #eee !important; padding: 12px !important; }
          .gold-gradient { -webkit-text-fill-color: black !important; color: black !important; font-weight: 900 !important; }
        }
      `}</style>
    </div>
  );
};

export default History;
