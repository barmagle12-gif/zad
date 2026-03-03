
import { TaskItem, Quote } from './types';

export interface TaskCategory {
  category: string;
  tasks: TaskItem[];
}

export const TADABBUR_QUESTIONS = [
  "ما هي الرسالة التي أراد الله إيصالها لك في وردك اليوم؟",
  "استخرج صفة من صفات عباد الرحمن وردت في قراءتك اليوم.",
  "هل مررت بآية شعرت أنها تصف حالك تماماً؟ ما هي؟",
  "آية قرأتها اليوم جعلتك تشعر بعظمة الخالق.. اذكرها.",
  "ما هو النهي الذي استوقفك اليوم وقررت أن تجتنبه؟",
  "آية فيها وعد من الله للمؤمنين أدخلت السرور على قلبك؟",
  "كيف يمكنك تطبيق إحدى آيات وردك اليوم في تعاملك مع الناس؟"
];

export const PRAYER_TASKS: TaskItem[] = [
  // الفجر
  { id: 'fajr_sunnah', label: 'سنة الفجر (ركعتان)' },
  { id: 'fajr', label: 'صلاة الفجر (فرض)' },
  { id: 'fajr_azkar', label: 'أذكار بعد الصلاة (الفجر)' },
  // الظهر
  { id: 'dhuhr_sunnah_before', label: 'سنة قبل الظهر (4 ركعات)' },
  { id: 'dhuhr', label: 'صلاة الظهر (فرض)' },
  { id: 'dhuhr_sunnah_after', label: 'سنة بعد الظهر (ركعتان)' },
  { id: 'dhuhr_azkar', label: 'أذكار بعد الصلاة (الظهر)' },
  // العصر
  { id: 'asr_sunnah', label: 'سنة العصر (4 ركعات)' },
  { id: 'asr', label: 'صلاة العصر (فرض)' },
  { id: 'asr_azkar', label: 'أذكار بعد الصلاة (العصر)' },
  // المغرب
  { id: 'maghrib', label: 'صلاة المغرب (فرض)' },
  { id: 'maghrib_sunnah', label: 'سنة المغرب (ركعتان)' },
  { id: 'maghrib_azkar', label: 'أذكار بعد الصلاة (المغرب)' },
  // العشاء
  { id: 'isha', label: 'صلاة العشاء (فرض)' },
  { id: 'isha_sunnah', label: 'سنة العشاء (ركعتان)' },
  { id: 'isha_azkar', label: 'أذكار بعد الصلاة (العشاء)' },
  // الوتر
  { id: 'witr_1', label: 'صلاة الوتر (ركعة)' },
  { id: 'witr_3', label: 'صلاة الوتر (3 ركعات)' },
  { id: 'witr_5', label: 'صلاة الوتر (5 ركعات)' },
  { id: 'witr_7', label: 'صلاة الوتر (7 ركعات)' },
  { id: 'witr_9', label: 'صلاة الوتر (9 ركعات)' },
  { id: 'witr_11', label: 'صلاة الوتر (11 ركعة)' },
  // الرواتب
  { id: 'rawatib_fajr_2', label: '2 قبل الفجر' },
  { id: 'rawatib_dhuhr_4', label: '4 قبل الظهر' },
  { id: 'rawatib_dhuhr_after_2', label: '2 بعد الظهر' },
  { id: 'rawatib_maghrib_2', label: '2 بعد المغرب' },
  { id: 'rawatib_isha_2', label: '2 بعد العشاء' },
  // قيام الليل
  { id: 'qiyam_2', label: 'قيام الليل (ركعتان)' },
  { id: 'qiyam_4', label: 'قيام الليل (4 ركعات)' },
  { id: 'qiyam_6', label: 'قيام الليل (6 ركعات)' },
  { id: 'qiyam_8', label: 'قيام الليل (8 ركعات)' },
  { id: 'qiyam_10', label: 'قيام الليل (10 ركعات)' },
  { id: 'qiyam_qunut', label: 'دعاء القنوت' },
  { id: 'qiyam_istighfar', label: 'استغفار (قيام الليل)' },
  // الضحى
  { id: 'duha_2', label: 'صلاة الضحى (ركعتان)' },
  { id: 'duha_4', label: 'صلاة الضحى (4 ركعات)' },
  { id: 'duha_6', label: 'صلاة الضحى (6 ركعات)' },
  { id: 'duha_8', label: 'صلاة الضحى (8 ركعات)' },
  // الجمعة
  { id: 'jumuah_ghusl', label: 'الاغتسال للجمعة' },
  { id: 'jumuah_early', label: 'التبكير للمسجد' },
  { id: 'jumuah_fard', label: 'صلاة الجمعة (فرض)' },
  { id: 'jumuah_sunnah_before', label: 'سنة قبل الجمعة' },
  { id: 'jumuah_sunnah_after', label: 'سنة بعد الجمعة' },
  // العيد
  { id: 'eid_fitr', label: 'صلاة عيد الفطر' },
  { id: 'eid_adha', label: 'صلاة عيد الأضحى' },
  { id: 'eid_takbir', label: 'التكبيرات' },
  // مناسبات خاصة
  { id: 'istisqa_prayer', label: 'صلاة الاستسقاء' },
  { id: 'istisqa_dua', label: 'الدعاء بعد الاستسقاء' },
  { id: 'kusuf_prayer', label: 'صلاة الكسوف' },
  { id: 'khusuf_prayer', label: 'صلاة الخسوف' },
  { id: 'istikhara_prayer', label: 'ركعتان استخارة' },
  { id: 'istikhara_dua', label: 'دعاء الاستخارة' },
  { id: 'janaza_attendance', label: 'حضور صلاة الجنازة' },
  { id: 'janaza_dua', label: 'الدعاء للميت' },
  // تطوع مطلق
  { id: 'nawafil_2', label: 'تطوع (ركعتان)' },
  { id: 'nawafil_4', label: 'تطوع (4 ركعات)' },
  { id: 'nawafil_more', label: 'تطوع (أكثر)' },
];

export const AZKAR_CATEGORIES: TaskCategory[] = [
  {
    category: 'أذكار ما بعد الصلوات الخمس',
    tasks: [
      { id: 'fajr_azkar_sync', label: 'أذكار بعد صلاة الفجر', description: 'المعقبات بعد الفريضة' },
      { id: 'dhuhr_azkar_sync', label: 'أذكار بعد صلاة الظهر', description: 'المعقبات بعد الفريضة' },
      { id: 'asr_azkar_sync', label: 'أذكار بعد صلاة العصر', description: 'المعقبات بعد الفريضة' },
      { id: 'maghrib_azkar_sync', label: 'أذكار بعد صلاة المغرب', description: 'المعقبات بعد الفريضة' },
      { id: 'isha_azkar_sync', label: 'أذكار بعد صلاة العشاء', description: 'المعقبات بعد الفريضة' },
    ]
  },
  {
    category: 'أذكار الأوقات واليوم',
    tasks: [
      { id: 'morning_azkar', label: 'أذكار الصباح', description: 'الحصن الحصين لبداية اليوم' },
      { id: 'evening_azkar', label: 'أذكار المساء', description: 'سكينة الروح وختام اليوم' },
      { id: 'sleep_azkar', label: 'أذكار النوم', description: 'للحفظ والهدوء قبل المنام' },
      { id: 'wake_azkar', label: 'أذكار الاستيقاظ', description: 'أول ما يلهج به اللسان عند القيام' },
    ]
  },
  {
    category: 'أذكار الصلاة والمساجد',
    tasks: [
      { id: 'mosque_entry', label: 'دعاء دخول/خروج المسجد', description: 'أدب الدخول لبيوت الله' },
      { id: 'adhan_dua', label: 'الدعاء بعد الأذان', description: 'وقت استجابة لا يُرد' },
    ]
  },
  {
    category: 'أذكار مطلقة (بالعداد)',
    tasks: [
      { id: 'istighfar_100', label: 'الاستغفار (100 مرة)', description: 'أستغفر الله وأتوب إليه' },
      { id: 'salawat_100', label: 'الصلاة على النبي (100 مرة)', description: 'من صلى علي واحدة صلى الله عليه بها عشراً' },
      { id: 'tasbeeh_100', label: 'التسبيح والتحميد (100 مرة)', description: 'سبحان الله وبحمده' },
      { id: 'tahlil_100', label: 'التهليل (100 مرة)', description: 'لا إله إلا الله وحده لا شريك له' },
    ]
  },
  {
    category: 'أدعية مأثورة ومناسبات',
    tasks: [
      { id: 'sayyid_istighfar', label: 'سيد الاستغفار', description: 'أعظم صيغ الاستغفار' },
      { id: 'iftar_dua', label: 'دعاء الإفطار', description: 'ذهب الظمأ وابتلت العروق' },
      { id: 'qadr_dua', label: 'دعاء ليلة القدر', description: 'اللهم إنك عفو تحب العفو فاعف عني' },
      { id: 'distress_dua', label: 'دعاء الكرب والهم', description: 'لا إله إلا أنت سبحانك إني كنت من الظالمين' },
    ]
  }
];

export const GOOD_DEED_CATEGORIES: TaskCategory[] = [
  {
    category: 'طاعات الجوارح والبدن',
    tasks: [
      { id: 'iftar', label: 'إفطار صائم', description: 'ولو بشق تمرة أو شربة ماء' },
      { id: 'harm_removal', label: 'إماطة الأذى', description: 'تنظيف الطريق أو المسجد' },
      { id: 'sadaqa_hidden', label: 'الصدقة الخفية', description: 'دفع مبلغ بسيط دون أن يعلم أحد' },
      { id: 'silat_rahim', label: 'صلة الرحم', description: 'اتصال هاتفى أو زيارة لقرابة مقطوعة' },
      { id: 'helping_needy', label: 'السعي في حاجة محتاج', description: 'قضاء مصلحة لشخص لا يستطيع' },
    ]
  },
  {
    category: 'طاعات اللسان والبيان',
    tasks: [
      { id: 'kind_word', label: 'الكلمة الطيبة', description: 'جبر خاطر مكسور بكلمة حنونة' },
      { id: 'salam', label: 'إفشاء السلام', description: 'البدء بالسلام على من عرفت ومن لم تعرف' },
      { id: 'reconciliation', label: 'إصلاح ذات البين', description: 'التوفيق بين شخصين متخاصمين' },
      { id: 'dua_others', label: 'الدعاء بظهر الغيب', description: 'أن تدعو لغيرك بكل ما تحب لنفسك' },
      { id: 'good_advice', label: 'الأمر بالمعروف', description: 'نصيحة رقيقة بأسلوب لين' },
    ]
  },
  {
    category: 'طاعات القرآن والتدبر',
    tasks: [
      { id: 'quran_tadabbur_daily', label: 'التدبر اليومي', description: 'تأمل آية واحدة وفهم معناها بعمق' },
      { id: 'verse_meaning', label: 'البحث عن معنى آية', description: 'قراءة تفسير آية واحدة غامضة يومياً' },
      { id: 'tajweed', label: 'تحسين التلاوة', description: 'محاولة ضبط أحكام التجويد أثناء القراءة' },
    ]
  },
  {
    category: 'طاعات الوقت والتركيز',
    tasks: [
      { id: 'early_prayer', label: 'التبكير للصلاة', description: 'التواجد في المسجد أو على السجادة قبل الأذان' },
      { id: 'itikaf_part', label: 'الاعتكاف الجزئي', description: 'الجلوس في المسجد أو مصلاك بعد الفجر للذكر' },
      { id: 'sahar_time', label: 'اغتنام وقت السحر', description: 'الاستغفار والدعاء قبل الفجر بـ 15 دقيقة' },
      { id: 'time_saving', label: 'حفظ الوقت', description: 'ترك الفضول من الكلام ووسائل التواصل' },
    ]
  },
  {
    category: 'طاعات القلب والسريرة',
    tasks: [
      { id: 'ikhlas', label: 'الإخلاص', description: 'تجديد النية قبل كل عمل أنه لله فقط' },
      { id: 'shukr_sujud', label: 'سجدة الشكر', description: 'السجود عند سماع خبر سار أو استشعار نعمة' },
      { id: 'tawakkul', label: 'التوكل', description: 'تسليم الأمر لله في مشكلة تقلقك' },
      { id: 'clean_heart', label: 'سلامة الصدر', description: 'أن تنام وليس في قلبك ذرة كره لأحد' },
      { id: 'khashya', label: 'الخشية', description: 'استشعار مراقبة الله لك في الخلوة' },
      { id: 'rida', label: 'الرضا', description: 'شكر الله على كل حال في السراء والضراء' },
    ]
  }
];

export const MUJAHADA_CATEGORIES: TaskCategory[] = [
  {
    category: 'محرمات الكلام واللسان',
    tasks: [
      { id: 'gheeba', label: 'الغيبة', description: 'ذكر أخيك بما يكره في غيبته' },
      { id: 'namima', label: 'النميمة', description: 'نقل الكلام بين الناس بنية الإفساد' },
      { id: 'lying', label: 'الكذب', description: 'تزييف الحقائق ولو بالمزاح' },
      { id: 'fuhsh', label: 'الفحش والسب', description: 'التلفظ بألفاظ نابية أو شتم الغير' },
      { id: 'false_witness', label: 'قول الزور', description: 'الشهادة الباطلة أو تضليل الحقيقة' },
      { id: 'mockery', label: 'السخرية والاستهزاء', description: 'التقليل من شأن الآخرين وشكلهم' },
    ]
  },
  {
    category: 'محرمات السماع',
    tasks: [
      { id: 'listen_gheeba', label: 'سماع الغيبة', description: 'الجلوس في مجلس يُغتاب فيه الناس دون إنكار' },
      { id: 'spying', label: 'التجسس', description: 'استراق السمع على أسرار الآخرين دون إذنهم' },
      { id: 'music_waste', label: 'المعازف الصاخبة', description: 'ما يلهي عن ذكر الله ويحرك الشهوات' },
      { id: 'fitna_news', label: 'سماع الفتنة', description: 'الاستماع للأخبار الكاذبة التي تثير الفوضى' },
    ]
  },
  {
    category: 'محرمات المشي والحركة',
    tasks: [
      { id: 'walk_munkar', label: 'السعي للمنكر', description: 'المشي لمكان فيه معصية أو مجالس لهو محرم' },
      { id: 'arrogance_walk', label: 'الخيلاء والتكبر', description: 'المشي بتبختر وتكبر على عباد الله' },
      { id: 'road_harm', label: 'أذية الطريق', description: 'ترك ما يؤذي الناس في طريقهم' },
      { id: 'intrusion', label: 'التطفل', description: 'الذهاب لأماكن خاصة دون دعوة أو استئذان' },
    ]
  },
  {
    category: 'محرمات الخواطر والأفكار',
    tasks: [
      { id: 'bad_thought_god', label: 'سوء الظن بالله', description: 'القنوط من رحمة الله أو الاعتراض على القدر' },
      { id: 'bad_thought_people', label: 'سوء الظن بالناس', description: 'تفسير تصرفاتهم دائماً بالشر' },
      { id: 'sin_planning', label: 'التخطيط لمعصية', description: 'إشغال العقل بكيفية فعل الذنب' },
      { id: 'inner_contempt', label: 'الاحتقار الداخلي', description: 'أن تظن في نفسك أنك أفضل من فلان' },
      { id: 'heedlessness', label: 'الغفلة المستمرة', description: 'نسيان الموت والآخرة والانغماس في الدنيا' },
    ]
  },
  {
    category: 'محرمات المشاعر والقلوب',
    tasks: [
      { id: 'hasad', label: 'الحسد', description: 'تمني زوال النعمة عن الآخرين' },
      { id: 'rancor', label: 'الغل والحقد', description: 'إضمار الكراهية للمؤمنين وعدم العفو' },
      { id: 'riya', label: 'الرياء', description: 'فعل الطاعة ليراك الناس ويثنوا عليك' },
      { id: 'ujb', label: 'العُجب', description: 'الإعجاب بالنفس والغرور بالعبادة' },
      { id: 'hardness', label: 'القسوة', description: 'عدم التأثر بالقرآن أو بآلام المحتاجين' },
    ]
  }
];

export const SECTION_INFO = {
  PRAYER: [
    { type: 'آية', text: 'وَأَقِمِ الصَّلَاةَ طَرَفَيِ النَّهارِ وَزُلَفًا مِنَ اللَّيْلِ ۚ إِنَّ الْحَسَناتِ يُذْهِبْنَ السَّيِّئاتِ' },
    { type: 'حديث', text: 'أرأيتُم لو أنَّ نَهْرًا ببابِ أحدِكم يغتسلُ منه كلَّ يومٍ خمسَ مرَّاتٍ، هل يَبقَى من دَرَنِه شيءٌ؟' },
    { type: 'أثر', text: 'الصلاة ميزان، فمن وفى استوفى.' }
  ],
  QURAN: [
    { type: 'آية', text: 'كِتابٌ أَنْزَلْناهُ إِلَيْكَ مُبارَكٌ لِيَدَّبَّرُوا آياتِهِ وَلِيَتَذَكَّرَ أُولُو الْأَلْبابِ' },
    { type: 'حديث', text: 'يُقالُ لصاحِبِ القُرآنِ: اقرَأْ وارتَقِ ورتِّلْ كما كُنْتَ تُرتِّلُ في الدُّنيا؛ فإنَّ منزلتَكَ عندَ آخِرِ آيةٍ تقرَؤُها.' },
    { type: 'أثر', text: 'إنّ هذا القرآن مأدبة الله، فتعلموا من مأدبته ما استطعتم.' }
  ],
  AZKAR: [
    { type: 'آية', text: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلا تَكْفُرُونِ' },
    { type: 'حديث', text: 'مَثَلُ الَّذي يذكُرُ ربَّه والَّذي لا يذكُرُ ربَّه؛ مَثَلُ الحيِّ والميِّتِ.' },
    { type: 'أثر', text: 'مساكين أهل الدنيا، خرجوا منها وما ذاقوا أطيب ما فيها.. ذكر الله.' }
  ],
  GOOD_DEEDS: [
    { type: 'آية', text: 'لَنْ تَنالُوا الْبِرَّ حَتَّى تُنْفِقُوا مِمَّا تُحِبُّونَ' },
    { type: 'حديث', text: 'كلُّ سُلامَى من الناسِ عليه صدقةٌ كلَّ يومٍ تطلُعُ فيه الشمسُ..' },
    { type: 'أثر', text: 'صنائع المعروف تقي مصارع السوء.' }
  ],
  MUJAHADA: [
    { type: 'آية', text: 'وَنَفْسٍ وَما سَوَّاها * فَأَلْهَمَها فُجُورَها وَتَقْواها * قَدْ أَفْلَحَ مَنْ زَكَّاها' },
    { type: 'حديث', text: 'المجاهدُ من جاهد نفسه في الله.' },
    { type: 'أثر', text: 'من غض بصره عن الحرام، أورثه الله حلاوة يجدها في قلبه إلى يوم يلقاه.' }
  ]
};

export const SYNC_MAPPINGS: Record<string, { target: string, section: 'prayers' | 'azkar' }> = {
  // السنن الرواتب
  'fajr_sunnah': { target: 'rawatib_fajr_2', section: 'prayers' },
  'dhuhr_sunnah_before': { target: 'rawatib_dhuhr_4', section: 'prayers' },
  'dhuhr_sunnah_after': { target: 'rawatib_dhuhr_after_2', section: 'prayers' },
  'maghrib_sunnah': { target: 'rawatib_maghrib_2', section: 'prayers' },
  'isha_sunnah': { target: 'rawatib_isha_2', section: 'prayers' },
  // الأذكار
  'fajr_azkar': { target: 'fajr_azkar_sync', section: 'azkar' },
  'dhuhr_azkar': { target: 'dhuhr_azkar_sync', section: 'azkar' },
  'asr_azkar': { target: 'asr_azkar_sync', section: 'azkar' },
  'maghrib_azkar': { target: 'maghrib_azkar_sync', section: 'azkar' },
  'isha_azkar': { target: 'isha_azkar_sync', section: 'azkar' },
};

export const MOTIVATIONAL_QUOTES: Record<string, Quote[]> = {
  ramadan: [
    { text: "يا باغي الخير أقبل، ويا باغي الشر أقصر.", source: "حديث شريف" },
    { text: "الصوم لي وأنا أجزي به.. تخيل عظمة الجزاء من عظمة الجازي!", source: "حديث قدسي" },
    { text: "الصيام ليس حبساً عن الطعام، بل هو حرية للروح من قيود الطين.", source: "حكمة" },
    { text: "ليكن صومك صوماً للقلب عن الهوى، قبل أن يكون صوماً للبطن عن القوت.", source: "أثر" },
    { text: "ابتسامتك في وجه أخيك وأنت صائم.. صدقة تطفئ غضب الرب.", source: "حديث شريف" },
    { text: "رمضان مضمار سباق، فلا يسبقنك إلى الله أحد.", source: "أثر" },
    { text: "تراويحك هي محطة التزود بالوقود لروحك المنهكة.", source: "حكمة" },
    { text: "أبواب الجنة مفتوحة الآن.. ابحث عن بابك الخاص بالعمل الصالح.", source: "حكمة" },
    { text: "مضى الشهر كأنه ساعة، فاجعل ساعتك الأخيرة هي الأجمل.", source: "حكمة" },
    { text: "إفطارك للصائم ليس مجرد لقمة، بل هو ميثاق محبة في ميزانك.", source: "أثر" },
  ],
  eid_fitr: [
    { text: "تقبل الله منا ومنكم صالح الأعمال.. عيدكم مبارك.", source: "تهنئة" },
    { text: "للصائم فرحتان: فرحة عند فطره، وفرحة عند لقاء ربه.. هنيئاً لك الفرحة الأولى.", source: "حديث شريف" },
    { text: "العيد لمن أطاع الله، وليس لمن لبس الجديد.", source: "أثر" },
    { text: "اجعل فرحة العيد شكراً لله على تمام النعمة.", source: "حكمة" },
    { text: "كحك العيد حلو، لكن حلاوة الطاعة في القلب أبقى.", source: "حكمة" },
  ],
  eid_adha: [
    { text: "لبيك اللهم لبيك.. لبيك لا شريك لك لبيك.", source: "التلبية" },
    { text: "ما من أيام العمل الصالح فيهن أحب إلى الله من هذه الأيام (العشر).", source: "حديث شريف" },
    { text: "الأضحية سنة أبينا إبراهيم، ورمز للفداء والطاعة.", source: "حكمة" },
    { text: "تقبل الله ضحاياكم ورفع قدركم في الدارين.", source: "دعاء" },
    { text: "العيد فرصة لصلة الرحم وإطعام المسكين.. لا تنسَ نصيبهم.", source: "أثر" },
  ],
  normal: [
    { text: "الجنة تُبنى بالذكر، فإذا أمسك الذاكر عن الذكر أمسكت الملائكة عن البناء.", source: "أثر" },
    { text: "إن لم تزد على الدنيا شيئاً، كنت أنت زائداً عليها.", source: "حكمة" },
    { text: "خفف أثقالك بالاستغفار، فالمسير طويل.", source: "حكمة" },
    { text: "يا باغي الخير أقبل، فاليوم غرسٌ وغداً حصاد.", source: "أثر" },
    { text: "اجعل مصحفك أنيسك، تجد الله في كل آية يرتلها قلبك.", source: "حكمة" },
    { text: "من جاهد نفسه اليوم، استراح في غدٍ لا ينتهي.", source: "أثر" },
    { text: "كل سجدة هي رسالة حب للسماء، فصوب رسائلك بدقة.", source: "حكمة" },
    { text: "ربَّ معصية أورثت ذلاً وانكساراً، خير من طاعة أورثت عزاً واستكباراً.", source: "ابن عطاء الله السكندري" },
    { text: "تذوق حلاوة 'وعجلت إليك رب لترضى' في بدارك للصلاة.", source: "أثر" },
    { text: "مجاهدة الخواطر هي معركة الأذكياء، فكن يقظاً بقلبك.", source: "أثر" },
    { text: "استحِ من الله في خلوتك، يرفع قدرك في جلوتك.", source: "أثر" },
    { text: "القرآن لا يعطيك أسراره إلا إذا أعطيته كلك.", source: "حكمة" },
    { text: "الوتر جنة الأرض، فلا تحرم نفسك من مناجاة الملك.", source: "أثر" },
    { text: "تذكر: 'وما تقدموا لأنفسكم من خير تجدوه عند الله'.", source: "آية قرآنية" },
    { text: "عامل الله باليقين، يعاملك بالمعجزات.", source: "حكمة" },
    { text: "من غض بصره عن الحرام، أورثه الله حلاوة يجدها في قلبه.", source: "أثر" },
    { text: "ليكن لسانك رطباً بذكر الله، حتى في زحام يومك.", source: "حديث شريف" },
    { text: "الدعاء سهم القدر، فأرسل سهامك في جوف الليل.", source: "أثر" },
    { text: "طهر مشاعرك من الغل، ليدخل نور الإيمان بغير حجاب.", source: "أثر" },
    { text: "نفسك إن لم تشغلها بالحق، شغلتك بالباطل.", source: "الإمام الشافعي" },
    { text: "لا تنظر إلى صغر المعصية، بل انظر إلى عظمة من عصيت.", source: "أثر" },
    { text: "صناعة المعروف تقي مصارع السوء.. ابحث عن محتاج اليوم.", source: "أثر" },
    { text: "قيمة المرء ما يحسنه، فأحسن عبادتك يحسن الله حالك.", source: "أثر" },
  ]
};
