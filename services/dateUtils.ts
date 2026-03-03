
export type Occasion = 'ramadan' | 'eid_fitr' | 'eid_adha' | 'normal';

export const HIJRI_MONTHS = [
  "محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة",
  "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
];

export function getOccasion(date: Date = new Date()): Occasion {
  const month = date.getMonth(); // 0-indexed
  const day = date.getDate();
  const year = date.getFullYear();

  if (year === 2026) {
    // Ramadan 2026: Feb 18 - March 19
    if ((month === 1 && day >= 18) || (month === 2 && day <= 19)) {
      return 'ramadan';
    }
    // Eid al-Fitr 2026: March 20 - March 22
    if (month === 2 && day >= 20 && day <= 22) {
      return 'eid_fitr';
    }
    // Eid al-Adha 2026: May 27 - May 30
    if (month === 4 && day >= 27 && day <= 30) {
      return 'eid_adha';
    }
  }

  // Default fallback for other years or normal days
  return 'normal';
}

export function getGreeting(occasion: Occasion): string {
  switch (occasion) {
    case 'ramadan': return 'رمضان مبارك';
    case 'eid_fitr': return 'عيد فطر سعيد';
    case 'eid_adha': return 'عيد أضحى مبارك';
    default: return 'يومك مبارك';
  }
}

export function formatHijriDate(date: Date, offset: number = -1): string {
  try {
    const dateToFormat = new Date(date);
    dateToFormat.setDate(dateToFormat.getDate() + offset);
    
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      weekday: 'long'
    }).format(dateToFormat);
  } catch (e) { return date.toDateString(); }
}

export function getHijriParts(date: Date, offset: number = -1): { day: number, month: number, year: number } {
  const dateToFormat = new Date(date);
  if (isNaN(dateToFormat.getTime())) return { day: 1, month: 1, year: 1446 };
  dateToFormat.setDate(dateToFormat.getDate() + offset);
  
  const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  });
  
  try {
    const parts = formatter.formatToParts(dateToFormat);
    const getPart = (type: string) => parseInt(parts.find(p => p.type === type)?.value || "0");
    
    return {
      day: getPart('day'),
      month: getPart('month'),
      year: getPart('year')
    };
  } catch (e) {
    return { day: 1, month: 1, year: 1446 };
  }
}

export function hijriToGregorian(day: number, month: number, year: number, offset: number = -1): Date {
  // Use a heuristic or Intl to find the date. 
  // Rough estimate: Hijri year 1446 is approx 2024-2025
  let date = new Date(year + 579, month - 1, day); 
  date.setHours(12, 0, 0, 0); // Use noon for stability
  
  // Refine search (max 60 days range)
  for (let i = -60; i < 60; i++) {
    const testDate = new Date(date.getTime() + i * 24 * 60 * 60 * 1000);
    testDate.setHours(12, 0, 0, 0);
    const parts = getHijriParts(testDate, offset);
    if (parts.day === day && parts.month === month && parts.year === year) {
      return testDate;
    }
  }
  return date;
}
