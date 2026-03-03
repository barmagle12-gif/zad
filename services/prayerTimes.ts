
/**
 * مواعيد صلاة الفجر لعام 2026 (تقديرية للقاهرة)
 * يمكن تعديلها بدقة أكبر لاحقاً
 */
export function getFajrTime(date: Date): { hours: number, minutes: number } {
  const month = date.getMonth(); // 0-11
  
  // مواعيد تقريبية لصلاة الفجر في القاهرة 2026
  const fajrTimes = [
    { hours: 5, minutes: 18 }, // يناير
    { hours: 5, minutes: 12 }, // فبراير
    { hours: 4, minutes: 57 }, // مارس
    { hours: 4, minutes: 18 }, // أبريل
    { hours: 3, minutes: 39 }, // مايو
    { hours: 3, minutes: 14 }, // يونيو
    { hours: 3, minutes: 18 }, // يوليو
    { hours: 3, minutes: 42 }, // أغسطس
    { hours: 4, minutes: 9 },  // سبتمبر
    { hours: 4, minutes: 30 }, // أكتوبر
    { hours: 4, minutes: 54 }, // نوفمبر
    { hours: 5, minutes: 14 }, // ديسمبر
  ];
  
  return fajrTimes[month];
}
