// Демо-данные для прототипа Pabliki Client Radar

import { LeadTemperature, SlaStatus, Offer, SalesScript, ReplyClassification, DoNotContact, ManagerCoachingStats, FounderControlCenterStats } from "./types";
import { lostReasonTaxonomy as lostReasonTaxonomyImport } from "./types";
import { computeTemperature } from "./temperature";
import { computeSlaStatus, slaDeadlineAt } from "./sla";
import { computeDealProbability, computeMoneyPriorityScore } from "./moneyScore";

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
  // --- расширенная модель (опционально, не ломает существующие страницы) ---
  temperature?: LeadTemperature;
  slaStatus?: SlaStatus;
  slaDeadlineAt?: string;
  dealProbability?: number;
  potentialDealSize?: number;
  expectedMargin?: number;
  moneyPriorityScore?: number;
  isDecisionMaker?: boolean;
  sourceConfidence?: number;
  lastActivityAt?: string;
  lostReason?: string;
  isFounderBoosted?: boolean;
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
    temperature: computeTemperature("2026-06-29T08:00:00+06:00", undefined, "real_estate_launch"),
    slaStatus: computeSlaStatus("2026-06-29T08:00:00+06:00", "real_estate_launch"),
    slaDeadlineAt: slaDeadlineAt("2026-06-29T08:00:00+06:00", "real_estate_launch"),
    dealProbability: computeDealProbability({ contactConfidence: "high", budgetSignal: "high", triggerType: "real_estate_launch", nicheMoneyWeight: 1.0 }),
    potentialDealSize: 2200000, expectedMargin: 0.45,
    moneyPriorityScore: computeMoneyPriorityScore({
      dealProbability: computeDealProbability({ contactConfidence: "high", budgetSignal: "high", triggerType: "real_estate_launch", nicheMoneyWeight: 1.0 }),
      potentialDealSize: 2200000, expectedMargin: 0.45,
      temperature: computeTemperature("2026-06-29T08:00:00+06:00", undefined, "real_estate_launch"),
      slaStatus: computeSlaStatus("2026-06-29T08:00:00+06:00", "real_estate_launch"),
      inventoryFitScore: 0.9,
    }).score,
    isDecisionMaker: true, sourceConfidence: 0.85, lastActivityAt: "2026-06-29T08:00:00+06:00",
    isFounderBoosted: true,
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
    temperature: computeTemperature("2026-06-27T10:00:00+06:00", undefined, "new_branch"),
    slaStatus: computeSlaStatus("2026-06-27T10:00:00+06:00", "new_branch"),
    slaDeadlineAt: slaDeadlineAt("2026-06-27T10:00:00+06:00", "new_branch"),
    dealProbability: computeDealProbability({ contactConfidence: "high", budgetSignal: "medium", triggerType: "new_branch", nicheMoneyWeight: 0.75 }),
    potentialDealSize: 650000, expectedMargin: 0.4,
    moneyPriorityScore: computeMoneyPriorityScore({
      dealProbability: computeDealProbability({ contactConfidence: "high", budgetSignal: "medium", triggerType: "new_branch", nicheMoneyWeight: 0.75 }),
      potentialDealSize: 650000, expectedMargin: 0.4,
      temperature: computeTemperature("2026-06-27T10:00:00+06:00", undefined, "new_branch"),
      slaStatus: computeSlaStatus("2026-06-27T10:00:00+06:00", "new_branch"),
      inventoryFitScore: 0.8,
    }).score,
    isDecisionMaker: true, sourceConfidence: 0.75, lastActivityAt: "2026-06-27T10:00:00+06:00",
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
    temperature: computeTemperature("2026-06-26T09:00:00+06:00", undefined, "seasonal"),
    slaStatus: computeSlaStatus("2026-06-26T09:00:00+06:00", "seasonal"),
    slaDeadlineAt: slaDeadlineAt("2026-06-26T09:00:00+06:00", "seasonal"),
    dealProbability: computeDealProbability({ contactConfidence: "medium", budgetSignal: "medium", triggerType: "seasonal", nicheMoneyWeight: 0.5 }),
    potentialDealSize: 500000, expectedMargin: 0.35,
    moneyPriorityScore: computeMoneyPriorityScore({
      dealProbability: computeDealProbability({ contactConfidence: "medium", budgetSignal: "medium", triggerType: "seasonal", nicheMoneyWeight: 0.5 }),
      potentialDealSize: 500000, expectedMargin: 0.35,
      temperature: computeTemperature("2026-06-26T09:00:00+06:00", undefined, "seasonal"),
      slaStatus: computeSlaStatus("2026-06-26T09:00:00+06:00", "seasonal"),
      inventoryFitScore: 0.65,
    }).score,
    isDecisionMaker: false, sourceConfidence: 0.55, lastActivityAt: "2026-06-26T09:00:00+06:00",
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
    temperature: computeTemperature("2026-06-25T12:00:00+06:00", undefined, "promo"),
    slaStatus: computeSlaStatus("2026-06-25T12:00:00+06:00", "promo"),
    slaDeadlineAt: slaDeadlineAt("2026-06-25T12:00:00+06:00", "promo"),
    dealProbability: computeDealProbability({ contactConfidence: "medium", budgetSignal: "low", triggerType: "promo", nicheMoneyWeight: 0.45 }),
    potentialDealSize: 300000, expectedMargin: 0.3,
    moneyPriorityScore: computeMoneyPriorityScore({
      dealProbability: computeDealProbability({ contactConfidence: "medium", budgetSignal: "low", triggerType: "promo", nicheMoneyWeight: 0.45 }),
      potentialDealSize: 300000, expectedMargin: 0.3,
      temperature: computeTemperature("2026-06-25T12:00:00+06:00", undefined, "promo"),
      slaStatus: computeSlaStatus("2026-06-25T12:00:00+06:00", "promo"),
      inventoryFitScore: 0.6,
    }).score,
    isDecisionMaker: false, sourceConfidence: 0.45, lastActivityAt: "2026-06-25T12:00:00+06:00",
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
    temperature: computeTemperature("2026-06-24T09:00:00+06:00", undefined, "enrollment"),
    slaStatus: computeSlaStatus("2026-06-24T09:00:00+06:00", "enrollment"),
    slaDeadlineAt: slaDeadlineAt("2026-06-24T09:00:00+06:00", "enrollment"),
    dealProbability: computeDealProbability({ contactConfidence: "medium", budgetSignal: "medium", triggerType: "enrollment", nicheMoneyWeight: 0.6 }),
    potentialDealSize: 420000, expectedMargin: 0.35,
    moneyPriorityScore: computeMoneyPriorityScore({
      dealProbability: computeDealProbability({ contactConfidence: "medium", budgetSignal: "medium", triggerType: "enrollment", nicheMoneyWeight: 0.6 }),
      potentialDealSize: 420000, expectedMargin: 0.35,
      temperature: computeTemperature("2026-06-24T09:00:00+06:00", undefined, "enrollment"),
      slaStatus: computeSlaStatus("2026-06-24T09:00:00+06:00", "enrollment"),
      inventoryFitScore: 0.6,
    }).score,
    isDecisionMaker: false, sourceConfidence: 0.5, lastActivityAt: "2026-06-24T09:00:00+06:00",
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
    temperature: computeTemperature("2026-06-23T15:00:00+06:00", undefined, "meta_active_ads"),
    slaStatus: computeSlaStatus("2026-06-23T15:00:00+06:00", "meta_active_ads"),
    slaDeadlineAt: slaDeadlineAt("2026-06-23T15:00:00+06:00", "meta_active_ads"),
    dealProbability: computeDealProbability({ contactConfidence: "low", budgetSignal: "high", triggerType: "meta_active_ads", nicheMoneyWeight: 0.4 }),
    potentialDealSize: 500000, expectedMargin: 0.3,
    moneyPriorityScore: computeMoneyPriorityScore({
      dealProbability: computeDealProbability({ contactConfidence: "low", budgetSignal: "high", triggerType: "meta_active_ads", nicheMoneyWeight: 0.4 }),
      potentialDealSize: 500000, expectedMargin: 0.3,
      temperature: computeTemperature("2026-06-23T15:00:00+06:00", undefined, "meta_active_ads"),
      slaStatus: computeSlaStatus("2026-06-23T15:00:00+06:00", "meta_active_ads"),
      inventoryFitScore: 0.5,
    }).score,
    isDecisionMaker: false, sourceConfidence: 0.4, lastActivityAt: "2026-06-23T15:00:00+06:00",
  },

  // --- новые лиды: расширяем спектр температур / SLA / приоритетов ---
  {
    id: "L-1055", company: "Sunrise Mall", bin: "180550098712", category: "Ритейл / ТРЦ",
    subcategory: "Торговый центр", city: "Алматы", district: "Алмалинский район", address: "ул. Гоголя, 86",
    trigger: "payment_abandoned", triggerText: "Брошенная оплата на сайте после расчёта рекламного пакета",
    source: "Сайт Pabliki.kz", sourceUrl: "https://pabliki.kz/orders/8821", signalDate: "2026-06-29T07:00:00+06:00",
    score: 95,
    scoreBreakdown: { trigger: 25, niche: 18, contact: 15, geo: 15, budget: 10, freshness: 10, reliability: 5, penalty: -1 },
    scoreExplanation: "Брошенная оплата — клиент уже выбрал пакет и почти оплатил, контакт прямой и свежий. Критично связаться в первые часы, иначе сделка остывает быстро.",
    budgetMin: 600000, budgetMax: 1200000, package: "паблики ТРЦ-формата: городские + lifestyle + мамские",
    recommendedGeo: "Алматы, Алмалинский район", recommendedFormat: "пост + сторис",
    action: "call", status: "need_check", manager: "Дамир", contactConfidence: "high",
    contacts: { phone: "+7 727 250-10-10", whatsapp: "+7 701 250 1010", email: "marketing@sunrisemall.kz", website: "sunrisemall.kz" },
    whatsappMessage: "Здравствуйте! Видим, что вы начали оформлять размещение на Pabliki.kz, но не завершили оплату. Если остались вопросы по пакету или бюджету — помогу прямо сейчас, можем зафиксировать текущие условия.",
    followUp1d: "Здравствуйте! Напоминаю про начатый заказ на Pabliki.kz — пакет ещё актуален, помогу завершить оформление.",
    followUp3d: "Добрый день! Возвращаюсь по заказу Sunrise Mall — если бюджет изменился, можем пересобрать пакет под новые рамки.",
    temperature: computeTemperature("2026-06-29T07:00:00+06:00", undefined, "payment_abandoned"),
    slaStatus: computeSlaStatus("2026-06-29T07:00:00+06:00", "payment_abandoned"),
    slaDeadlineAt: slaDeadlineAt("2026-06-29T07:00:00+06:00", "payment_abandoned"),
    dealProbability: computeDealProbability({ contactConfidence: "high", budgetSignal: "high", triggerType: "payment_abandoned", nicheMoneyWeight: 0.85 }),
    potentialDealSize: 900000, expectedMargin: 0.5,
    moneyPriorityScore: computeMoneyPriorityScore({
      dealProbability: computeDealProbability({ contactConfidence: "high", budgetSignal: "high", triggerType: "payment_abandoned", nicheMoneyWeight: 0.85 }),
      potentialDealSize: 900000, expectedMargin: 0.5,
      temperature: computeTemperature("2026-06-29T07:00:00+06:00", undefined, "payment_abandoned"),
      slaStatus: computeSlaStatus("2026-06-29T07:00:00+06:00", "payment_abandoned"),
      inventoryFitScore: 0.85,
    }).score,
    isDecisionMaker: true, sourceConfidence: 0.9, lastActivityAt: "2026-06-29T07:00:00+06:00",
  },
  {
    id: "L-1058", company: "Tourist Plaza", bin: "200110044531", category: "HoReCa / общепит",
    subcategory: "Ресторан", city: "Астана", district: "Сарыаркинский район",
    trigger: "payment_abandoned", triggerText: "Брошенная оплата рекламного пакета на сайте — заявка из 22:40, контакт не выходил",
    source: "Сайт Pabliki.kz", sourceUrl: "https://pabliki.kz/orders/8790", signalDate: "2026-06-26T22:40:00+06:00",
    score: 90,
    scoreBreakdown: { trigger: 25, niche: 12, contact: 9, geo: 13, budget: 8, freshness: 3, reliability: 5, penalty: -1 },
    scoreExplanation: "Сигнал сильный (брошенная оплата), но прошло уже больше трёх суток без контакта — окно почти закрылось, нужен срочный звонок сегодня, иначе лид остынет.",
    budgetMin: 250000, budgetMax: 500000, package: "городские + lifestyle паблики Астаны",
    recommendedGeo: "Астана", recommendedFormat: "сторис + пост",
    action: "call", status: "need_check", manager: "Айгерим", contactConfidence: "medium",
    contacts: { phone: "+7 7172 90-20-30", instagram: "@touristplaza.astana" },
    whatsappMessage: "Здравствуйте! Заметили, что вы оформляли размещение на Pabliki.kz, но оплата не прошла. Пакет можем зафиксировать и помочь завершить заказ сегодня.",
    followUp1d: "Здравствуйте! Возвращаюсь по заказу Tourist Plaza — если ещё актуально, помогу оформить размещение.",
    followUp3d: "Добрый день! По заказу Tourist Plaza: если приоритеты изменились, дайте знать, пересоберём предложение.",
    temperature: computeTemperature("2026-06-26T22:40:00+06:00", undefined, "payment_abandoned"),
    slaStatus: computeSlaStatus("2026-06-26T22:40:00+06:00", "payment_abandoned"),
    slaDeadlineAt: slaDeadlineAt("2026-06-26T22:40:00+06:00", "payment_abandoned"),
    dealProbability: computeDealProbability({ contactConfidence: "medium", budgetSignal: "medium", triggerType: "payment_abandoned", nicheMoneyWeight: 0.45 }),
    potentialDealSize: 380000, expectedMargin: 0.4,
    moneyPriorityScore: computeMoneyPriorityScore({
      dealProbability: computeDealProbability({ contactConfidence: "medium", budgetSignal: "medium", triggerType: "payment_abandoned", nicheMoneyWeight: 0.45 }),
      potentialDealSize: 380000, expectedMargin: 0.4,
      temperature: computeTemperature("2026-06-26T22:40:00+06:00", undefined, "payment_abandoned"),
      slaStatus: computeSlaStatus("2026-06-26T22:40:00+06:00", "payment_abandoned"),
      inventoryFitScore: 0.6,
    }).score,
    isDecisionMaker: false, sourceConfidence: 0.65, lastActivityAt: "2026-06-26T22:40:00+06:00",
  },
  {
    id: "L-1061", company: "Family Park Almaty", bin: "170220033214", category: "Развлечения / семейный отдых",
    subcategory: "Парк развлечений", city: "Алматы", district: "Бостандыкский район",
    trigger: "new_venue", triggerText: "Открытие нового семейного парка развлечений — обнаружено лично основателем Pabliki",
    source: "Ручное добавление", signalDate: "2026-06-28T09:00:00+06:00",
    score: 94,
    scoreBreakdown: { trigger: 20, niche: 14, contact: 15, geo: 15, budget: 8, freshness: 8, reliability: 4, penalty: 0 },
    scoreExplanation: "Лид добавлен лично основателем агентства как приоритетный (founder boost) — открытие крупного семейного парка, сильный денежный потенциал и прямой контакт с владельцем.",
    budgetMin: 700000, budgetMax: 1500000, package: "мамские + lifestyle + городские паблики",
    recommendedGeo: "Алматы (вся база)", recommendedFormat: "пост + сторис + волны",
    action: "send_proposal", status: "new", manager: "Айгерим", contactConfidence: "high",
    contacts: { phone: "+7 701 900-44-55", whatsapp: "+7 701 900 4455", instagram: "@familypark.almaty" },
    whatsappMessage: "Здравствуйте! Поздравляем с открытием Family Park! Для такого запуска отлично заходят мамские и lifestyle паблики Алматы — соберём подборку с прогнозом охвата под открытие?",
    followUp1d: "Здравствуйте! Напоминаю по Family Park — можем стартовать размещение в первую неделю после открытия, это даёт максимум охвата.",
    followUp3d: "Добрый день! Возвращаюсь по Family Park — предлагаю короткий созвон, чтобы зафиксировать формат и бюджет.",
    temperature: computeTemperature("2026-06-28T09:00:00+06:00", undefined, "new_venue"),
    slaStatus: computeSlaStatus("2026-06-28T09:00:00+06:00", "new_venue"),
    slaDeadlineAt: slaDeadlineAt("2026-06-28T09:00:00+06:00", "new_venue"),
    dealProbability: computeDealProbability({ contactConfidence: "high", budgetSignal: "high", triggerType: "new_venue", nicheMoneyWeight: 0.7 }),
    potentialDealSize: 1100000, expectedMargin: 0.45,
    moneyPriorityScore: computeMoneyPriorityScore({
      dealProbability: computeDealProbability({ contactConfidence: "high", budgetSignal: "high", triggerType: "new_venue", nicheMoneyWeight: 0.7 }),
      potentialDealSize: 1100000, expectedMargin: 0.45,
      temperature: computeTemperature("2026-06-28T09:00:00+06:00", undefined, "new_venue"),
      slaStatus: computeSlaStatus("2026-06-28T09:00:00+06:00", "new_venue"),
      inventoryFitScore: 0.8,
    }).score,
    isDecisionMaker: true, sourceConfidence: 0.95, lastActivityAt: "2026-06-28T09:00:00+06:00",
    isFounderBoosted: true,
  },
  {
    id: "L-1009", company: "Karaganda Auto Service", category: "Авто / сервис",
    subcategory: "СТО", city: "Караганда",
    trigger: "directory_only", triggerText: "Найден в 2GIS, без явного триггера — давно не обработан",
    source: "2GIS", sourceUrl: "https://2gis.kz/karagandaservice", signalDate: "2026-03-01T10:00:00+06:00",
    score: 42,
    scoreBreakdown: { trigger: 6, niche: 8, contact: 4, geo: 10, budget: 2, freshness: 1, reliability: 3, penalty: -2 },
    scoreExplanation: "Старый сигнал из справочника без явного триггера — давно протух, контакт слабый. Кандидат на архивацию или повторную проверку перед закрытием.",
    budgetMin: 80000, budgetMax: 180000, package: "городские паблики",
    recommendedGeo: "Караганда", recommendedFormat: "пост",
    action: "review", status: "need_check", manager: "—", contactConfidence: "low",
    contacts: { website: "karagandaservice.kz" },
    whatsappMessage: "Здравствуйте! Подскажите, актуально ли для вас размещение в городских пабликах Караганды?",
    followUp1d: "Напоминаю про возможное размещение — если неактуально, закроем заявку.",
    followUp3d: "Финальное напоминание — если ответа не будет, переносим заявку в архив.",
    temperature: computeTemperature("2026-03-01T10:00:00+06:00", undefined, "directory_only"),
    slaStatus: computeSlaStatus("2026-03-01T10:00:00+06:00", "directory_only"),
    slaDeadlineAt: slaDeadlineAt("2026-03-01T10:00:00+06:00", "directory_only"),
    dealProbability: computeDealProbability({ contactConfidence: "low", budgetSignal: "low", triggerType: "directory_only", nicheMoneyWeight: 0.3 }),
    potentialDealSize: 130000, expectedMargin: 0.25,
    moneyPriorityScore: computeMoneyPriorityScore({
      dealProbability: computeDealProbability({ contactConfidence: "low", budgetSignal: "low", triggerType: "directory_only", nicheMoneyWeight: 0.3 }),
      potentialDealSize: 130000, expectedMargin: 0.25,
      temperature: computeTemperature("2026-03-01T10:00:00+06:00", undefined, "directory_only"),
      slaStatus: computeSlaStatus("2026-03-01T10:00:00+06:00", "directory_only"),
      inventoryFitScore: 0.4,
    }).score,
    isDecisionMaker: false, sourceConfidence: 0.2, lastActivityAt: "2026-03-01T10:00:00+06:00",
  },
  {
    id: "L-1005", company: "Trend Boutique", category: "Fashion / одежда",
    subcategory: "Бутик одежды", city: "Алматы", district: "Медеуский район",
    trigger: "promo", triggerText: "Акция к распродаже сезона — клиент отказался после КП",
    source: "Instagram", sourceUrl: "https://instagram.com/trendboutique", signalDate: "2026-06-10T11:00:00+06:00",
    score: 64,
    scoreBreakdown: { trigger: 14, niche: 9, contact: 9, geo: 13, budget: 4, freshness: 2, reliability: 2, penalty: -3 },
    scoreExplanation: "Клиент получил КП, но отказался по цене — сделка не закрыта, занесена в проигранные с указанием причины.",
    budgetMin: 100000, budgetMax: 250000, package: "женские + городские паблики",
    recommendedGeo: "Алматы", recommendedFormat: "пост",
    action: "review", status: "rejected", manager: "Дамир", contactConfidence: "medium",
    contacts: { phone: "+7 727 322-11-00", instagram: "@trendboutique.almaty" },
    whatsappMessage: "Здравствуйте! Высылаем обновлённое предложение по размещению Trend Boutique с учётом бюджета.",
    followUp1d: "Если бюджет изменится — будем рады вернуться к предложению.",
    followUp3d: "Финальный follow-up — оставляем заявку в базе для сезонной реактивации.",
    temperature: computeTemperature("2026-06-10T11:00:00+06:00", undefined, "promo"),
    slaStatus: computeSlaStatus("2026-06-10T11:00:00+06:00", "promo"),
    slaDeadlineAt: slaDeadlineAt("2026-06-10T11:00:00+06:00", "promo"),
    dealProbability: computeDealProbability({ contactConfidence: "medium", budgetSignal: "low", triggerType: "promo", nicheMoneyWeight: 0.4 }),
    potentialDealSize: 180000, expectedMargin: 0.3,
    moneyPriorityScore: computeMoneyPriorityScore({
      dealProbability: computeDealProbability({ contactConfidence: "medium", budgetSignal: "low", triggerType: "promo", nicheMoneyWeight: 0.4 }),
      potentialDealSize: 180000, expectedMargin: 0.3,
      temperature: computeTemperature("2026-06-10T11:00:00+06:00", undefined, "promo"),
      slaStatus: computeSlaStatus("2026-06-10T11:00:00+06:00", "promo"),
      inventoryFitScore: 0.4,
    }).score,
    isDecisionMaker: true, sourceConfidence: 0.5, lastActivityAt: "2026-06-12T15:00:00+06:00",
    lostReason: "price",
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

// ============================================================================
// Расширенный слой mock-данных: офферы, скрипты продаж, классификация ответов,
// чёрный список, причины проигрыша, коучинг менеджеров, Quick Win Queue,
// Founder Control Center.
// ============================================================================

export const offers: Offer[] = [
  {
    id: "OF-1", name: "Старт продаж ЖК — волна 3 паблика", niche: "Недвижимость / ЖК", channel: "городские + новостные паблики",
    packageDescription: "3 публикации в топ городских и новостных пабликах в течение недели старта продаж",
    priceFrom: 800000, priceTo: 1500000, conversionRateMock: 0.34, sampleSize: 22, status: "winner",
  },
  {
    id: "OF-2", name: "Открытие филиала — компактный пакет", niche: "Медицина / стоматология", channel: "районные паблики",
    packageDescription: "2 публикации в районных и семейных пабликах в первую неделю после открытия",
    priceFrom: 250000, priceTo: 500000, conversionRateMock: 0.28, sampleSize: 18, status: "winner",
  },
  {
    id: "OF-3", name: "Сезонная подборка lifestyle", niche: "Авто / салоны / прокат", channel: "lifestyle + городские паблики",
    packageDescription: "Сторис-волна + 1 пост в lifestyle пабликах на пике сезона",
    priceFrom: 200000, priceTo: 450000, conversionRateMock: 0.19, sampleSize: 14, status: "testing",
  },
  {
    id: "OF-4", name: "Акционный нативный пост", niche: "Beauty / косметология", channel: "женские паблики",
    packageDescription: "1 нативный пост + сторис в женских пабликах на время акции",
    priceFrom: 100000, priceTo: 300000, conversionRateMock: 0.22, sampleSize: 11, status: "testing",
  },
  {
    id: "OF-5", name: "Набор учеников — мамский пакет", niche: "Образование / курсы", channel: "мамские паблики",
    packageDescription: "2 публикации в мамских и районных пабликах на старте учебного сезона",
    priceFrom: 180000, priceTo: 400000, conversionRateMock: 0.16, sampleSize: 9, status: "testing",
  },
  {
    id: "OF-6", name: "Дополнение к таргету Meta", niche: "E-commerce / магазины", channel: "городские паблики",
    packageDescription: "1 пост в городских пабликах как нативное дополнение к активной таргетированной рекламе",
    priceFrom: 80000, priceTo: 250000, conversionRateMock: 0.08, sampleSize: 7, status: "retired",
  },
];

export const salesScripts: SalesScript[] = [
  {
    id: "SS-1", triggerType: "real_estate_launch", niche: "Недвижимость / ЖК",
    situation: "Первый контакт после старта продаж ЖК",
    scriptText: "Здравствуйте! Заметили старт продаж [ЖК]. Под старт продаж хорошо отрабатывают городские, районные и новостные паблики: охват по жителям города и доверие к проекту. Можем подготовить подборку под бюджет и прогноз охвата на первые недели. Удобно прислать короткое КП?",
  },
  {
    id: "SS-2", triggerType: "payment_abandoned", niche: undefined,
    situation: "Клиент начал оплату на сайте Pabliki.kz, но не завершил",
    scriptText: "Здравствуйте! Видим, что вы начали оформлять размещение на Pabliki.kz, но оплата не прошла. Если остались вопросы по пакету или бюджету — помогу прямо сейчас, можем зафиксировать текущие условия.",
  },
  {
    id: "SS-3", triggerType: "new_branch", niche: "Медицина / стоматология",
    situation: "Открытие нового филиала",
    scriptText: "Здравствуйте! Увидели, что вы открываете новый филиал в [район]. Для таких запусков хорошо работает нативное размещение в районных и городских пабликах: быстрый охват среди жителей района. Подскажите ориентир по бюджету?",
  },
  {
    id: "SS-4", triggerType: "any", niche: undefined,
    situation: "Возражение: «Дорого»",
    scriptText: "Понимаю, бюджет — важный момент. Давайте посмотрим на стоимость через охват: цена за контакт в наших пабликах обычно ниже, чем в таргетированной рекламе, а доверие к нативному формату выше. Можем собрать более компактный пакет под ваш бюджет — показать вариант?",
    objectionHandled: "дорого",
  },
  {
    id: "SS-5", triggerType: "any", niche: undefined,
    situation: "Возражение: «Пришлите КП»",
    scriptText: "Конечно, пришлю. Чтобы предложение было максимально точным — подскажите, пожалуйста, ориентир по бюджету и какой результат для вас важнее: охват, заявки или узнаваемость? Это займёт минуту, а КП будет конкретным, не шаблонным.",
    objectionHandled: "пришлите КП",
  },
  {
    id: "SS-6", triggerType: "any", niche: undefined,
    situation: "Возражение: «Мы подумаем»",
    scriptText: "Конечно, время на решение — это нормально. Подскажите, что именно нужно обсудить — бюджет, формат или сроки? Если полезно, могу прислать короткий кейс по похожей нише, чтобы решение было проще.",
    objectionHandled: "мы подумаем",
  },
  {
    id: "SS-7", triggerType: "seasonal", niche: "Авто / салоны / прокат",
    situation: "Сезонный всплеск спроса",
    scriptText: "Здравствуйте! Сейчас пик сезона на [услуга]. В городских и lifestyle-пабликах можно быстро поймать сезонную аудиторию. Соберём подборку под бюджет с прогнозом охвата?",
  },
  {
    id: "SS-8", triggerType: "enrollment", niche: "Образование / курсы",
    situation: "Набор учеников на новый сезон",
    scriptText: "Здравствуйте! Сезон набора — самое время заявить о школе. Мамские и районные паблики дают точный охват родителей. Соберём подборку под бюджет?",
  },
  {
    id: "SS-9", triggerType: "meta_active_ads", niche: undefined,
    situation: "Компания уже крутит платную рекламу — слабый прямой контакт",
    scriptText: "Здравствуйте! Видим, что вы активно продвигаетесь в соцсетях. Нативные посты в городских пабликах хорошо дополняют таргет — больше доверия и локального охвата. Показать прогноз?",
  },
  {
    id: "SS-10", triggerType: "directory_only", niche: undefined,
    situation: "Старый лид без явного триггера — реактивация перед архивацией",
    scriptText: "Здравствуйте! Подскажите, актуально ли для вас размещение в городских пабликах? Если нет — закроем заявку, чтобы не отвлекать.",
  },
];

export const replyClassifications: ReplyClassification[] = [
  {
    id: "RC-1", leadId: "L-1042", replyText: "Здравствуйте, да, интересно! Пришлите подборку и цены.",
    classification: "interested", suggestedNextAction: "Отправить подборку и КП в течение дня",
  },
  {
    id: "RC-2", leadId: "L-1039", replyText: "Слишком дорого для нас сейчас, у конкурентов дешевле.",
    classification: "objection_price", suggestedNextAction: "Предложить компактный пакет / применить скрипт «дорого»",
  },
  {
    id: "RC-3", leadId: "L-1036", replyText: "Сейчас не время, вернитесь через месяц-два.",
    classification: "objection_timing", suggestedNextAction: "Поставить follow-up через 6 недель, занести в реактивацию",
  },
  {
    id: "RC-4", leadId: "L-1031", replyText: "Спасибо, не интересно, у нас уже есть подрядчик.",
    classification: "not_interested", suggestedNextAction: "Закрыть лид, указать причину competitor",
  },
  {
    id: "RC-5", leadId: "L-1028", replyText: "Вы ошиблись номером, это личный телефон.",
    classification: "wrong_contact", suggestedNextAction: "Найти альтернативный контакт через 2GIS/сайт",
  },
  {
    id: "RC-6", leadId: "L-1022", replyText: "Мы уже размещаемся у вас через другого менеджера.",
    classification: "already_client", suggestedNextAction: "Передать лид текущему ответственному менеджеру",
  },
  {
    id: "RC-7", leadId: "L-1058", replyText: "Окей, посмотрю и напишу позже на этой неделе.",
    classification: "needs_followup", suggestedNextAction: "Поставить follow-up через 3 дня",
  },
  {
    id: "RC-8", leadId: "L-1061", replyText: "Звучит интересно, давайте созвонимся завтра в 11:00.",
    classification: "interested", suggestedNextAction: "Назначить звонок, подготовить аргументы по бюджету",
  },
];

export const doNotContactList: DoNotContact[] = [
  { bin: "990140012233", reason: "Прямой отказ от любых коммуникаций, повторное обращение запрещено", addedAt: "2026-05-02" },
  { phone: "+7 701 000-00-00", reason: "Жалоба на спам через WhatsApp", addedAt: "2026-05-20" },
  { bin: "880210099887", reason: "Закрытая компания (ликвидация по данным реестра)", addedAt: "2026-06-01" },
];

export { lostReasonTaxonomyImport as lostReasonTaxonomy };

export const managerCoachingStats: ManagerCoachingStats[] = [
  { manager: "Айгерим", avgResponseTimeMinutes: 38, conversionRate: 0.31, leadsHandled: 142, scoreVsTeamAvg: 12 },
  { manager: "Дамир", avgResponseTimeMinutes: 64, conversionRate: 0.24, leadsHandled: 118, scoreVsTeamAvg: -4 },
  { manager: "Нурлан", avgResponseTimeMinutes: 95, conversionRate: 0.17, leadsHandled: 76, scoreVsTeamAvg: -22 },
];

/** Лиды для экрана "Quick Win Queue": горячие/тёплые, SLA в норме или на грани, высокая вероятность сделки. */
export function getQuickWinQueue(): Lead[] {
  return leads.filter((l) =>
    (l.temperature === "hot" || l.temperature === "warming") &&
    (l.slaStatus === "on_time" || l.slaStatus === "warning") &&
    (l.dealProbability ?? 0) >= 0.5
  );
}

export const quickWinQueue: Lead[] = getQuickWinQueue();

export const founderControlCenterStats: FounderControlCenterStats = {
  hotLeadsToday: leads.filter((l) => l.temperature === "hot").length,
  leadsAtSlaRisk: leads.filter((l) => l.slaStatus === "warning" || l.slaStatus === "overdue").length,
  moneyPipelineTotal: leads.reduce((sum, l) => sum + (l.moneyPriorityScore ?? 0), 0),
  topMoneyPriorityLeadIds: [...leads]
    .sort((a, b) => (b.moneyPriorityScore ?? 0) - (a.moneyPriorityScore ?? 0))
    .slice(0, 3)
    .map((l) => l.id),
  managerLeaderboard: managerCoachingStats,
};
