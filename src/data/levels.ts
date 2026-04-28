export type LevelCode = "A1" | "A2" | "B1" | "B2" | "C1";

export interface Level {
  code: LevelCode;
  name: string;
  description: string;
  free: boolean;
  gradient: string;
  emoji: string;
}

export const LEVELS: Level[] = [
  {
    code: "A1",
    name: "Beginner",
    description: "First words, greetings, and simple sentences.",
    free: true,
    gradient: "from-violet-500 to-fuchsia-500",
    emoji: "🌱",
  },
  {
    code: "A2",
    name: "Elementary",
    description: "Daily routines, hobbies, and short conversations.",
    free: false,
    gradient: "from-fuchsia-500 to-pink-500",
    emoji: "🌿",
  },
  {
    code: "B1",
    name: "Intermediate",
    description: "Express opinions, plans, and travel comfortably.",
    free: false,
    gradient: "from-pink-500 to-rose-500",
    emoji: "🌳",
  },
  {
    code: "B2",
    name: "Upper-Intermediate",
    description: "Discuss abstract topics with fluency and nuance.",
    free: false,
    gradient: "from-rose-500 to-orange-500",
    emoji: "🔥",
  },
  {
    code: "C1",
    name: "Advanced",
    description: "Master complex texts and sophisticated conversation.",
    free: false,
    gradient: "from-orange-500 to-amber-500",
    emoji: "👑",
  },
];

export const LESSONS_BY_LEVEL: Record<LevelCode, { id: string; title: string; minutes: number }[]> = {
  A1: [
    { id: "a1-1", title: "Greetings & Introductions", minutes: 8 },
    { id: "a1-2", title: "Numbers 1–20", minutes: 6 },
    { id: "a1-3", title: "Family members", minutes: 7 },
  ],
  A2: [
    { id: "a2-1", title: "Daily routine", minutes: 10 },
    { id: "a2-2", title: "Food & drinks", minutes: 9 },
  ],
  B1: [
    { id: "b1-1", title: "Travel & holidays", minutes: 12 },
    { id: "b1-2", title: "Giving opinions", minutes: 11 },
  ],
  B2: [
    { id: "b2-1", title: "Work & career", minutes: 14 },
    { id: "b2-2", title: "Environment debate", minutes: 13 },
  ],
  C1: [
    { id: "c1-1", title: "Idioms & nuance", minutes: 16 },
    { id: "c1-2", title: "Academic writing", minutes: 18 },
  ],
};

export const GRAMMAR_BY_LEVEL: Record<LevelCode, { id: string; title: string }[]> = {
  A1: [
    { id: "g-a1-1", title: "Verb 'to be'" },
    { id: "g-a1-2", title: "Articles a / an / the" },
  ],
  A2: [
    { id: "g-a2-1", title: "Present Simple vs Continuous" },
    { id: "g-a2-2", title: "Past Simple" },
  ],
  B1: [
    { id: "g-b1-1", title: "Present Perfect" },
    { id: "g-b1-2", title: "First Conditional" },
  ],
  B2: [
    { id: "g-b2-1", title: "Passive voice" },
    { id: "g-b2-2", title: "Reported speech" },
  ],
  C1: [
    { id: "g-c1-1", title: "Inversion" },
    { id: "g-c1-2", title: "Mixed conditionals" },
  ],
};
