// Демо-данные для прототипа Pabliki Client Radar

export type Priority = "hot" | "warm" | "watch" | "base";

export function priorityOf(score: number): Priority {
  if (score >= 90) return "hot";
  if (score >= 75) return "warm";
  if (score >= 50) return "watch";
  return "base";
}

export const priorityMeta: Record<Priority, { label: string; badge: string; row: string; dot: string }> = {
  hot:   { label: "Горячий",   badge: "bg-red-100 text-red-700 ring-red-200",       row: "border-l-red-500",    dot: "bg-red-500" },
  warm:  { label: "Тёплый",    badge: "bg-amber-100 text-amber-700 ring-amber-200", row: "border-l-amber-400",  dot: "bg-amber-400" },
  watch: { label: "Наблюдать", badge: "bg-sky-100 text-sky-700 ring-sky-200",       row: "border-l-sky-400",    dot: "bg-sky-400" },
  base:  { label: "База",      badge: "bg-slate-100 text-slate-500 ring-slate-200", row: "border-l-slate-300",  dot: "bg-slate-300" },
};

export const triggerLabels: Record<string, string> = {
  real_estate_launch: "Старт продаж ЖК",
  new_branch: "Новый филиал",
  new_venue: "Открытие заведения",
  payment_abandoned: "Брошенная оплата",
  selection_abandoned: "Брошенная подборка",
  meta_active_ads: "Активная реклама в Meta",
  enrollment: "Набор учеников",
  seasonal: "Сезонный спрос",
  promo: "Запуск акции",
  reactivation: "Повторный клиент",
  tender: "Тендер / госзакупка",
  site_request: "Заявки с сайта",
  directory_only: "Найден в 2GIS",
};

export const actionLabels: Record<string, string> = {
  write_whatsapp: "Написать WhatsApp",
  call: "Позвонить",
  send_proposal: "Отправить КП",
  build_selection: "Собрать подборку",
  follow_up: "Поставить follow-up",
  review: "Проверить",
};

export const statusLabels: Record<string, string> = {
  new: "Новый",
  need_check: "Нужно проверить",
  need_write: "Нужно написать",
  written: "Написали",
  replied: "Ответил",
  need_proposal: "Нужно КП",
  proposal_sent: "КП отправлено",
  negotiation: "Переговоры",
  payment: "Оплата",
  rejected: "Отказ",
  return_later: "Вернуться позже",
};

export type Lead = {
  id: string;
  company: string;
  bin?: string;
  category: string;
  subcategory?: string;
  city: string;
  district?: string;
  address?: string;
  trigger: string;
  triggerText: string;
  source: string;
  sourceUrl?: string;
  signalDate: string;
  score: number;
  scoreBreakdown: { trigger: number; niche: number; contact: number; geo: number; budget: number; freshness: number; reliability: number; penalty: number };
  scoreExplanation: string;
  budgetMin: number;
  budgetMax: number;
  package: string;
  recommendedGeo: string;
  recommendedFormat: string;
  action: string;
  status: string;
  manager?: string;
  contactConfidence: "high" | "medium" | "low";
  contacts: { phone?: string; whatsapp?: string; instagram?: string; email?: string; website?: string };
  whatsappMessage: string;
  followUp1d: string;
  followUp3d: string;
};

export const leads: Lead[] = [
  {
    id: "L-1042", company: "ЖК Prime House", bin: "190240021547", category: "Недвижимость / ЖК",
    subcategory: "ЖК бизнес-класса", city: "Астана", district: "Есильский район", address: "пр. Мангилик Ел, 55",
    trigger: "real_estate_launch", triggerText: "Старт продаж первой очереди ЖК Prime House",
    source: "Новости / RSS", sourceUrl: "https://news.kz/prime-house", signalDate: "2026-06-29",
    score: 97,
    scoreBreakdown: { trigger: 24, niche: 20, contact: 15, geo: 15, budget: 10, freshness: 10, reliability: 4, penalty: -1 },
    scoreExplanation: "Старт продаж ЖК в Астане — сильнейший рекламный повод в самой денежной нише, сигнал свежий (сегодня), есть прямой контакт и развитая база пабликов. Признаки крупного бюджета. Горячий лид: сформировать КП и связаться сегодня.",
    budgetMin: 1500000, budgetMax: 2500000, package: "городские + районные + новостные паблики Астаны",
    recommendedGeo: "Астана (вся база)", recommendedFormat: "пост + сторис + волны",
    action: "send_proposal", status: "new", manager: "Айгерим", contactConfidence: "high",
    contacts: { phone: "+7 7172 55-00-11", whatsapp: "+7 701 555 0011", instagram: "@primehouse.astana", website: "primehouse.kz" },
    whatsappMessage: "Здравствуйте! Заметили старт продаж ЖК Prime House в Астане — поздравляем с запуском. Под старт продаж хорошо отрабатывают городские, районные и новостные паблики Астаны: охват по жителям города и доверие к проекту на старте. Можем подготовить подборку под ваш бюджет и прогноз по охвату на первые недели продаж. Удобно прислать короткое КП?",
    followUp1d: "Здравствуйте! Напоминаю по поводу размещения под старт продаж Prime House. Если актуально — сегодня соберу подборку пабликов Астаны и пришлю прогноз охвата. На какой бюджет ориентируемся?",
    followUp3d: "Добрый день! Возвращаюсь по Prime House. На старте продаж важны первые недели охвата — можем запустить волну размещений быстро. Предлагаю короткий созвон на 10 минут, когда удобно?",
  },
  {
    id: "L-1039", company: "Dent Plus", bin: "210340118822", category: "Медицина / стоматология",
    subcategory: "Стоматология", city: "Алматы", district: "Бостандыкский район", address: "ул. Тимирязева, 42",
    trigger: "new_branch", triggerText: "Открытие нового филиала стоматологии Dent Plus",
    source: "Google Places", sourceUrl: "https://maps.google.com/dentplus", signalDate: "2026-06-27",
    score: 92,
    scoreBreakdown: { trigger: 21, niche: 15, contact: 15, geo: 15, budget: 5, freshness: 8, reliability: 4, penalty: 0 },
    scoreExplanation: "Новый филиал стоматологии в Алматы (район с базой пабликов), есть прямой WhatsApp, свежий сигнал (2 дня), надёжный источник Google Places. Денежная ниша. Рекомендуется написать WhatsApp сегодня.",
    budgetMin: 400000, budgetMax: 800000, package: "городские + районные + семейные/женские паблики",
    recommendedGeo: "Алматы, Бостандыкский район", recommendedFormat: "пост + сторис",
    action: "write_whatsapp", status: "need_write", manager: "Дамир", contactConfidence: "high",
    contacts: { phone: "+7 727 311-22-33", whatsapp: "+7 708 311 2233", instagram: "@dentplus.almaty", website: "dentplus.kz" },
    whatsappMessage: "Здравствуйте! Увидели, что вы открываете новый филиал Dent Plus в Бостандыкском районе Алматы. Для таких запусков хорошо работает нативное размещение в районных и городских пабликах: быстрый охват среди жителей района и доверие к клинике. Можем собрать короткую подборку под бюджет и показать прогноз по охвату. Подскажите ориентир по бюджету?",
    followUp1d: "Здравствуйте! Напоминаю по размещению под открытие филиала Dent Plus. Если актуально — сегодня соберу подборку районных пабликов и пришлю прогноз охвата.",
    followUp3d: "Добрый день! Возвращаюсь по Dent Plus. Под открытие важны первые недели — можем стартовать с компактной подборки по Бостандыкскому району. Прислать вариант?",
  },
  {
    id: "L-1036", company: "AutoRent KZ", category: "Авто / салоны / прокат",
    subcategory: "Прокат авто", city: "Алматы", district: "Медеуский район",
    trigger: "seasonal", triggerText: "Сезонный рост спроса на прокат авто (лето)",
    source: "Wordstat / тренды", sourceUrl: "https://wordstat.example/autorent", signalDate: "2026-06-26",
    score: 88,
    scoreBreakdown: { trigger: 15, niche: 16, contact: 9, geo: 15, budget: 5, freshness: 8, reliability: 3, penalty: 0 },
    scoreExplanation: "Сезонный всплеск спроса на прокат авто в Алматы, денежная ниша, гео хорошо закрыто пабликами. Контакт средней уверенности (телефон). Рекомендуется позвонить и предложить сезонную подборку.",
    budgetMin: 300000, budgetMax: 700000, package: "городские + авто + lifestyle паблики",
    recommendedGeo: "Алматы (вся база)", recommendedFormat: "сторис + пост",
    action: "call", status: "need_check", manager: "Дамир", contactConfidence: "medium",
    contacts: { phone: "+7 727 444-55-66", instagram: "@autorent.kz", website: "autorent.kz" },
    whatsappMessage: "Здравствуйте! Лето — пик спроса на прокат авто. В городских и lifestyle-пабликах Алматы можно быстро поймать сезонную аудиторию. Соберём подборку под бюджет с прогнозом охвата?",
    followUp1d: "Напоминаю про сезонное размещение AutoRent — пик уже идёт, можем стартовать быстро.",
    followUp3d: "Сезон в разгаре — предлагаю короткую подборку lifestyle-пабликов под прокат. Прислать?",
  },
  {
    id: "L-1031", company: "Beauty Lab", category: "Beauty / косметология",
    subcategory: "Косметология", city: "Шымкент",
    trigger: "promo", triggerText: "Запуск акции -30% на процедуры к открытию сезона",
    source: "Instagram", sourceUrl: "https://instagram.com/beautylab", signalDate: "2026-06-25",
    score: 81,
    scoreBreakdown: { trigger: 17, niche: 11, contact: 9, geo: 13, budget: 5, freshness: 6, reliability: 2, penalty: 0 },
    scoreExplanation: "Активная акция в косметологии Шымкента, гео с базой пабликов, контакт средний (Instagram/телефон). Тёплый лид — подготовить нишевое сообщение и подборку женских пабликов.",
    budgetMin: 150000, budgetMax: 450000, package: "женские + районные + городские паблики",
    recommendedGeo: "Шымкент", recommendedFormat: "сторис + пост",
    action: "build_selection", status: "need_proposal", manager: "Айгерим", contactConfidence: "medium",
    contacts: { phone: "+7 7252 33-44-55", instagram: "@beautylab.shymkent" },
    whatsappMessage: "Здравствуйте! Увидели вашу акцию в Beauty Lab. Под акции отлично заходят женские и районные паблики Шымкента — быстрый локальный охват. Соберём подборку под бюджет с прогнозом?",
    followUp1d: "Напоминаю про размещение под акцию Beauty Lab — пока акция активна, охват работает лучше всего.",
    followUp3d: "Возвращаюсь по Beauty Lab — могу собрать компактную подборку женских пабликов под акцию. Прислать?",
  },
  {
    id: "L-1028", company: "EnglishGo", category: "Образование / курсы",
    subcategory: "Языковые курсы", city: "Караганда",
    trigger: "enrollment", triggerText: "Набор учеников на новый учебный сезон",
    source: "2GIS", sourceUrl: "https://2gis.kz/englishgo", signalDate: "2026-06-24",
    score: 78,
    scoreBreakdown: { trigger: 18, niche: 13, contact: 9, geo: 12, budget: 5, freshness: 6, reliability: 3, penalty: 0 },
    scoreExplanation: "Набор учеников в языковую школу Караганды — хороший сезонный повод, ниша средней денежности, гео закрыто пабликами. Тёплый лид: мамские и районные паблики.",
    budgetMin: 250000, budgetMax: 600000, package: "мамские + районные + городские паблики",
    recommendedGeo: "Караганда", recommendedFormat: "пост + сторис",
    action: "write_whatsapp", status: "new", manager: "—", contactConfidence: "medium",
    contacts: { phone: "+7 7212 22-33-44", instagram: "@englishgo.krg", website: "englishgo.kz" },
    whatsappMessage: "Здравствуйте! Сезон набора — самое время заявить о школе EnglishGo. Мамские и районные паблики Караганды дают точный охват родителей. Соберём подборку под бюджет?",
    followUp1d: "Напоминаю про набор EnglishGo — пик заявок обычно в первые недели сезона.",
    followUp3d: "Возвращаюсь по EnglishGo — предлагаю подборку мамских пабликов под набор. Прислать?",
  },
  {
    id: "L-1022", company: "Mega Furniture", category: "E-commerce / магазины",
    subcategory: "Мебель", city: "Актобе",
    trigger: "meta_active_ads", triggerText: "Активная реклама в Meta Ad Library — мебельный магазин",
    source: "Meta Ad Library", sourceUrl: "https://facebook.com/ads/library", signalDate: "2026-06-23",
    score: 72,
    scoreBreakdown: { trigger: 22, niche: 12, contact: 4, geo: 11, budget: 10, freshness: 4, reliability: 3, penalty: -2 },
    scoreExplanation: "Компания уже крутит рекламу в Meta — явный признак бюджета. Но контакт слабый (только сайт), гео среднее. Наблюдать/прогревать: найти прямой контакт, предложить нативное размещение как дополнение к таргету.",
    budgetMin: 200000, budgetMax: 800000, package: "городские + lifestyle + нишевые паблики",
    recommendedGeo: "Актобе", recommendedFormat: "пост",
    action: "follow_up", status: "need_check", manager: "—", contactConfidence: "low",
    contacts: { website: "megafurniture.kz", instagram: "@mega.furniture" },
    whatsappMessage: "Здравствуйте! Видим, что вы активно продвигаетесь в соцсетях. Нативные посты в городских пабликах Актобе хорошо дополняют таргет — больше доверия и локального охвата. Показать прогноз?",
    followUp1d: "Напоминаю — нативное размещение усиливает ваш текущий таргет в Meta. Собрать подборку?",
    followUp3d: "Возвращаюсь по Mega Furniture — можем протестировать пару городских пабликов под ваш ассортимент.",
  },
];

export const dashboardMetrics = {
  signalsToday: 486,
  leadsToday: 132,
  hotLeads: 27,
  potentialTurnover: 18700000,
  toHandleToday: 14,
};

export const topNiches = [
  { name: "Недвижимость", value: 38 },
  { name: "Медицина", value: 31 },
  { name: "Авто", value: 24 },
  { name: "Образование", value: 19 },
  { name: "Beauty", value: 16 },
  { name: "Общепит", value: 12 },
];

export const topCities = [
  { name: "Алматы", value: 52 },
  { name: "Астана", value: 41 },
  { name: "Шымкент", value: 23 },
  { name: "Караганда", value: 14 },
  { name: "Актобе", value: 9 },
];

export const sourcesBreakdown = [
  { name: "Google Places", value: 34, color: "#2563EB" },
  { name: "2GIS", value: 22, color: "#3B82F6" },
  { name: "Новости / RSS", value: 18, color: "#60A5FA" },
  { name: "Сайт Pabliki.kz", value: 14, color: "#93C5FD" },
  { name: "Meta Ad Library", value: 7, color: "#1D4ED8" },
  { name: "Ручной / импорт", value: 5, color: "#BFDBFE" },
];

export const funnel = [
  { stage: "Новый", value: 132 },
  { stage: "Написали", value: 74 },
  { stage: "Ответил", value: 41 },
  { stage: "КП отправлено", value: 23 },
  { stage: "Переговоры", value: 12 },
  { stage: "Оплата", value: 6 },
];

export const tasksToday = [
  { id: "T-1", lead: "ЖК Prime House", type: "send_proposal", due: "Сегодня 12:00", manager: "Айгерим", priority: "hot" },
  { id: "T-2", lead: "Dent Plus", type: "write_whatsapp", due: "Сегодня 14:00", manager: "Дамир", priority: "hot" },
  { id: "T-3", lead: "AutoRent KZ", type: "call", due: "Сегодня 16:00", manager: "Дамир", priority: "warm" },
  { id: "T-4", lead: "Beauty Lab", type: "build_selection", due: "Сегодня 17:30", manager: "Айгерим", priority: "warm" },
  { id: "T-5", lead: "EnglishGo", type: "write_whatsapp", due: "Завтра 10:00", manager: "—", priority: "warm" },
];

export function tenge(n: number): string {
  return n.toLocaleString("ru-RU").replace(/,/g, " ") + " ₸";
}
