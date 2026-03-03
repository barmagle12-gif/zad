import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const NotificationService = {
  async requestPermissions() {
    if (Capacitor.isNativePlatform()) {
      const status = await LocalNotifications.requestPermissions();
      return status.display === 'granted';
    }
    return false;
  },

  async scheduleReminders() {
    if (!Capacitor.isNativePlatform()) return;

    // Clear existing notifications first to avoid duplicates
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel(pending);
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          title: "حان وقت الصلاة",
          body: "أقم صلاتك تنعم بحياتك.. لا تنسَ صلاة الفريضة.",
          id: 1,
          schedule: { at: new Date(Date.now() + 1000 * 60 * 60 * 4), repeats: true, every: 'day' }, // Example: in 4 hours
          sound: 'beep.wav',
          actionTypeId: "",
          extra: null
        },
        {
          title: "ورد القرآن الكريم",
          body: "هل قرأت وردك اليوم؟ القرآن ربيع القلوب ونور الصدور.",
          id: 2,
          schedule: { at: new Date(Date.now() + 1000 * 60 * 60 * 10), repeats: true, every: 'day' }, // Example: in 10 hours
          sound: 'beep.wav',
        },
        {
          title: "رسالة تحفيزية",
          body: "رمضان فرصة للتغيير.. اجعل يومك أفضل من أمسك بالذكر والطاعة.",
          id: 3,
          schedule: { at: new Date(Date.now() + 1000 * 60 * 60 * 2), repeats: true, every: 'day' }, // Example: in 2 hours
        }
      ]
    });
  },

  async testNotification() {
    if (!Capacitor.isNativePlatform()) {
      alert("الإشعارات تعمل فقط على تطبيق الموبايل الحقيقي.");
      return;
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          title: "تجربة الإشعارات",
          body: "تطبيق زاد المسلم يعمل بنجاح!",
          id: 99,
          schedule: { at: new Date(Date.now() + 5000) }, // in 5 seconds
        }
      ]
    });
  }
};
