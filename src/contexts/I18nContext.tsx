import { createContext, useContext, useState, ReactNode } from "react";

export type LangCode = "uz" | "en" | "ru";

type Dict = Record<string, string>;

const dictionaries: Record<LangCode, Dict> = {
  uz: {
    appName: "Polatov Boboyor",
    tagline: "Ingliz tilini A1 dan C1 gacha o'rgan",
    getStarted: "Boshlash",
    login: "Kirish",
    signup: "Ro'yxatdan o'tish",
    email: "Elektron pochta",
    password: "Parol",
    continue: "Davom etish",
    chooseLevel: "Darajangizni tanlang",
    levelHint: "O'zingizga mos darajani tanlang",
    lessons: "Darslar",
    grammar: "Grammatika",
    vocabulary: "Lug'at",
    settings: "Sozlamalar",
    appearance: "Ko'rinish",
    light: "Yorug'",
    dark: "Qorong'i",
    language: "Til",
    about: "Ilova haqida",
    version: "Versiya",
    unlock: "Premium",
    premiumTitle: "Premium ga o'ting",
    premiumDesc: "Barcha darslar, grammatika va AI o'qituvchi bilan to'liq kirish.",
    monthly: "Oylik",
    yearly: "Yillik",
    payNow: "Hoziroq to'lash",
    locked: "Qulflangan",
    home: "Bosh sahifa",
    progress: "Jarayon",
    streak: "O'tilgan darajalar",
    minutes: "min",
    startLesson: "Darsni boshlash",
    backToLevels: "Darajalarga qaytish",
    aboutText: "Polatov Boboyor — bu ingliz tilini A1 dan C1 gacha bosqichma-bosqich o'rganish uchun mo'ljallangan zamonaviy ilova.",
    logout: "Chiqish",
    welcome: "Xush kelibsiz",
    selectToStart: "Boshlash uchun darajani tanlang",
    aiTutor: "AI O'qituvchi",
    askAi: "AI dan so'rang",
    aiPlaceholder: "Bu dars haqida nimani so'ramoqchisiz?",
    paymentMethod: "To'lov usuli",
    cardNumber: "Karta raqami",
    cardHolder: "Karta egasi",
    submitPayment: "To'lovni yuborish",
    paymentPending: "To'lov so'rovi yuborildi! Admin tasdiqlagandan keyin Premium ochiladi.",
    paymentNote: "Pul yechilmaydi — bu test rejimi.",
  },
  en: {
    appName: "Polatov Boboyor",
    tagline: "Learn English from A1 to C1",
    getStarted: "Get Started",
    login: "Sign in",
    signup: "Sign up",
    email: "Email",
    password: "Password",
    continue: "Continue",
    chooseLevel: "Choose your level",
    levelHint: "Pick a level that fits you",
    lessons: "Lessons",
    grammar: "Grammar",
    vocabulary: "Vocabulary",
    settings: "Settings",
    appearance: "Appearance",
    light: "Light",
    dark: "Dark",
    language: "Language",
    about: "About",
    version: "Version",
    unlock: "Premium",
    premiumTitle: "Go Premium",
    premiumDesc: "Full access to all lessons, grammar, and the AI tutor.",
    monthly: "Monthly",
    yearly: "Yearly",
    payNow: "Pay now",
    locked: "Locked",
    home: "Home",
    progress: "Progress",
    streak: "Levels passed",
    minutes: "min",
    startLesson: "Start lesson",
    backToLevels: "Back to levels",
    aboutText: "Polatov Boboyor is a modern app to learn English step-by-step, from A1 to C1.",
    logout: "Log out",
    welcome: "Welcome",
    selectToStart: "Pick a level to get started",
    aiTutor: "AI Tutor",
    askAi: "Ask AI",
    aiPlaceholder: "What would you like to ask about this lesson?",
    paymentMethod: "Payment method",
    cardNumber: "Card number",
    cardHolder: "Card holder",
    submitPayment: "Submit payment",
    paymentPending: "Payment request submitted! Premium will unlock after admin approval.",
    paymentNote: "No money is charged — this is test mode.",
  },
  ru: {
    appName: "Polatov Boboyor",
    tagline: "Учите английский от A1 до C1",
    getStarted: "Начать",
    login: "Войти",
    signup: "Регистрация",
    email: "Эл. почта",
    password: "Пароль",
    continue: "Продолжить",
    chooseLevel: "Выберите уровень",
    levelHint: "Выберите подходящий уровень",
    lessons: "Уроки",
    grammar: "Грамматика",
    vocabulary: "Словарь",
    settings: "Настройки",
    appearance: "Тема",
    light: "Светлая",
    dark: "Тёмная",
    language: "Язык",
    about: "О приложении",
    version: "Версия",
    unlock: "Premium",
    premiumTitle: "Перейти на Premium",
    premiumDesc: "Полный доступ ко всем урокам, грамматике и AI-учителю.",
    monthly: "Ежемесячно",
    yearly: "Ежегодно",
    payNow: "Оплатить",
    locked: "Закрыто",
    home: "Главная",
    progress: "Прогресс",
    streak: "Уровней пройдено",
    minutes: "мин",
    startLesson: "Начать урок",
    backToLevels: "К уровням",
    aboutText: "Polatov Boboyor — современное приложение для изучения английского от A1 до C1.",
    logout: "Выйти",
    welcome: "Добро пожаловать",
    selectToStart: "Выберите уровень, чтобы начать",
    aiTutor: "AI Учитель",
    askAi: "Спросить AI",
    aiPlaceholder: "Что хотите спросить об этом уроке?",
    paymentMethod: "Способ оплаты",
    cardNumber: "Номер карты",
    cardHolder: "Владелец карты",
    submitPayment: "Отправить оплату",
    paymentPending: "Заявка отправлена! Premium откроется после одобрения админом.",
    paymentNote: "Деньги не списываются — это тестовый режим.",
  },
};

interface I18nValue {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  t: (key: keyof typeof dictionaries.uz) => string;
}

const I18nContext = createContext<I18nValue | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<LangCode>(() => {
    if (typeof window === "undefined") return "uz";
    return (localStorage.getItem("linguo-lang") as LangCode) || "uz";
  });
  const setLang = (l: LangCode) => {
    setLangState(l);
    localStorage.setItem("linguo-lang", l);
  };
  const t = (key: keyof typeof dictionaries.uz) => dictionaries[lang][key] ?? String(key);
  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be inside I18nProvider");
  return ctx;
};
