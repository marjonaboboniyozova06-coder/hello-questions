import { createContext, useContext, useState, ReactNode } from "react";

export type LangCode = "uz" | "en" | "ru";

type Dict = Record<string, string>;

const dictionaries: Record<LangCode, Dict> = {
  uz: {
    appName: "Linguo",
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
    unlock: "Premium ochish",
    premiumTitle: "Premium ga o'ting",
    premiumDesc: "Barcha darslar, grammatika va mashqlarga to'liq kirish.",
    monthly: "Oylik",
    yearly: "Yillik",
    payNow: "Hoziroq to'lash",
    locked: "Qulflangan",
    home: "Bosh sahifa",
    progress: "Jarayon",
    streak: "Kunlik strik",
    minutes: "min",
    startLesson: "Darsni boshlash",
    backToLevels: "Darajalarga qaytish",
    aboutText: "Linguo — bu ingliz tilini A1 dan C1 gacha bosqichma-bosqich o'rganish uchun mo'ljallangan zamonaviy mobil ilova.",
    logout: "Chiqish",
    welcome: "Xush kelibsiz",
    selectToStart: "Boshlash uchun darajani tanlang",
  },
  en: {
    appName: "Linguo",
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
    unlock: "Unlock Premium",
    premiumTitle: "Go Premium",
    premiumDesc: "Full access to all lessons, grammar, and exercises.",
    monthly: "Monthly",
    yearly: "Yearly",
    payNow: "Pay now",
    locked: "Locked",
    home: "Home",
    progress: "Progress",
    streak: "Daily streak",
    minutes: "min",
    startLesson: "Start lesson",
    backToLevels: "Back to levels",
    aboutText: "Linguo is a modern mobile app to learn English step-by-step, from A1 to C1.",
    logout: "Log out",
    welcome: "Welcome",
    selectToStart: "Pick a level to get started",
  },
  ru: {
    appName: "Linguo",
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
    unlock: "Открыть Premium",
    premiumTitle: "Перейти на Premium",
    premiumDesc: "Полный доступ ко всем урокам и грамматике.",
    monthly: "Ежемесячно",
    yearly: "Ежегодно",
    payNow: "Оплатить",
    locked: "Закрыто",
    home: "Главная",
    progress: "Прогресс",
    streak: "Серия дней",
    minutes: "мин",
    startLesson: "Начать урок",
    backToLevels: "К уровням",
    aboutText: "Linguo — современное мобильное приложение для изучения английского с уровня A1 до C1.",
    logout: "Выйти",
    welcome: "Добро пожаловать",
    selectToStart: "Выберите уровень, чтобы начать",
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
