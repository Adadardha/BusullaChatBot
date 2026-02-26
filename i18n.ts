import { QuizQuestion, InterviewMode, DifficultyLevel, QuickAction } from './types';

export const TRANSLATIONS = {
  landing: {
    title: "BUSULLA DIGJITALE",
    subtitle: "Zbulo rrugën tënde të karrierës me ndihmën e inteligjencës artificiale.",
  },
  common: {
    start: "FILLO",
    restart: "RIFILLO",
    back: "KTHEHU",
    other: "Tjetër",
    customPlaceholder: "Shkruani përgjigjen tuaj...",
    send: "DËRGONI",
    returnToStart: "KTHEHU NË FILLIM",
    loading: "Duke ngarkuar...",
    close: "Mbyll",
    next: "Vazhdo",
    skip: "Kapërce",
    retry: "Provo përsëri",
    export: "Eksporto",
  },
  quiz: {
    progress: "PYETJA",
  },
  analyzing: {
    title: "Duke Analizuar...",
    subtitle: "Inteligjenca artificiale po analizon profilin tuaj të karrierës.",
  },
  results: {
    title: "Rezultatet e Karrierës",
    match: "Përputhja Kryesore",
    confidence: "Besueshmëria",
    alternatives: "Alternativa të Tjera",
    whyFit: "Pse kjo karrierë ju përshtatet?",
    salary: "Diapazoni i Pagës",
    learning: "Rrugëtimi i Mësimit",
    practice: "Fillo Praktikën e Intervistës",
  },
  interviewSetup: {
    title: "Konfiguro Intervistën",
    subtitle: "Zgjidhni mënyrën dhe vështirësinë e intervistës suaj simulate",
    selectMode: "Zgjidhni Mënyrën",
    selectDifficulty: "Zgjidhni Vështirësinë",
    startButton: "FILLO INTERVISTËN",
    modes: {
      technical: {
        name: "Teknike",
        description: "Pyetje të fokusuara në aftësi teknike dhe njohuri të fushës",
      },
      behavioral: {
        name: "Sjelljeore",
        description: "Pyetje rreth përvojave, situatave dhe menaxhimit interpersonal",
      },
      mixed: {
        name: "Të Përzier",
        description: "Kombinim i pyetjeve teknike dhe sjelljeore",
      },
      stress: {
        name: "Stres Test",
        description: "Pyetje sfiduese që testojnë reagimin nën presion",
      },
    },
    difficulties: {
      easy: {
        name: "E Lehtë",
        description: "Pyetje bazike për ngrohje",
      },
      medium: {
        name: "Mesatare",
        description: "Pyetje me intensitet mesatar",
      },
      hard: {
        name: "E Vështirë",
        description: "Pyetje komplekse që kërkojnë thellësi",
      },
    },
    careerInfo: "Karriera juaj:",
    questionsCount: "5-10 pyetje",
    hints: "3 hints të disponueshme",
  },
  interviewSession: {
    title: "Intervistë Simuluar",
    subtitle: "Përgjigjuni pyetjeve dhe merrni feedback të menjëhershëm",
    timeRemaining: "Koha e mbetur",
    score: "Rezultati",
    currentDifficulty: "Vështirësia",
    questionsAnswered: "Pyetje të përgjigjura",
    hintsRemaining: "Hints të mbetura",
    chatPlaceholder: "Shkruani përgjigjen tuaj...",
    sendAnswer: "DËRGO PËRGJIGJEN",
    getHint: "KËRKO HINT",
    finishInterview: "PËRFUNDO INTERVISTËN",
    typing: "Po shkruan...",
    evaluating: "Duke vlerësuar...",
    feedback: "Feedback",
    strengths: "Pikat e forta",
    improvements: "Përmirësime",
  },
  interviewReport: {
    title: "Raporti i Intervistës",
    overallScore: "Rezultati i Përgjithshëm",
    verdict: "Vendimi",
    verdicts: {
      hired: "PRANUAR",
      consider: "NË KONSIDERATË",
      rejected: "I REFUZUAR",
    },
    summary: "Përmbledhje",
    categoryScores: "Rezultatet sipas Kategorive",
    categories: {
      technical: "Aftësi Teknike",
      communication: "Komunikim",
      problemSolving: "Zgjidhje Problemesh",
      cultureFit: "Përshtatje Kulturore",
    },
    answersReview: "Rishikimi i Përgjigjeve",
    recommendations: "Rekomandime",
    weakTopics: "Tema për Përmirësim",
    practiceSuggestions: "Sugjerime për Praktikë",
    duration: "Kohëzgjatja",
    minutes: "minuta",
    newInterview: "INTERVISTË E RE",
    backToResults: "KTHEHU TE REZULTATET",
    exportReport: "sHKARKO RAPORTIN",
  },
  chat: {
    title: "Asistenti i Karrierës",
    subtitle: "Këshilltari juaj 24/7",
    placeholder: "Shkruani pyetjen tuaj...",
    send: "Dërgo",
    minimized: "Asistenti",
    newChat: "Bisedë e re",
    quickActions: "Veprime të shpejta",
    welcome: "Përshëndetje! Unë jam asistenti juaj i karrierës 24/7. Si mund t'ju ndihmoj sot?",
    error: "Ndodhi një gabim në lidhjen me shërbimet AI. Siguroni që të keni cilësuar VITE_HF_API_KEY në .env.local ose provoni përsëri më vonë.",
    apiQuotaExceeded: "Quota e API-t është tejkaluar. Provo përsëri më vonë.",
  },
  quickActions: {
    cvHelp: "Si ta përmirësoj CV-në?",
    interviewTips: "Këshilla për intervistë",
    careerChange: "Ndryshim karriere",
    salary: "Si të negocioj pagën?",
    skills: "Aftësi të nevojshme",
    networking: "Networking tips",
  },
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    text: "Si preferoni të punoni gjatë ditës?",
    options: [
      "Vetëm, në një mjedis të qetë dhe të fokusuar",
      "Në ekip, me bashkëpunim të vazhdueshëm",
      "Hibrid - kohë të balancuar vetëm dhe në grup",
      "Në lëvizje të vazhdueshme dhe me njerëz të rinj",
    ],
    category: "Mjedisi",
  },
  {
    id: 2,
    text: "Çfarë ju motivon më shumë në një projekt?",
    options: [
      "Zgjidhja e problemeve komplekse teknike",
      "Krijimi i diçkaje vizuale dhe artistike",
      "Ndihma direkte për njerëzit e tjerë",
      "Arritja e objektivave financiare dhe rritja e biznesit",
    ],
    category: "Motivimi",
  },
  {
    id: 3,
    text: "Si reagoni ndaj situatave të paparashikuara?",
    options: [
      "Analizoj të dhënat dhe gjej një zgjidhje logjike",
      "Përdor intuitën dhe kreativitetin për të improvizuar",
      "Kërkoj ndihmë nga ekipi dhe delegoj detyrat",
      "Qëndroj i qetë dhe ndjek procedurat e paracaktuara",
    ],
    category: "Menaxhimi i krizës",
  },
  {
    id: 4,
    text: "Cila nga këto aftësi mendoni se është pika juaj më e fortë?",
    options: [
      "Mendimi analitik dhe matematika",
      "Komunikimi dhe bindja e të tjerëve",
      "Dizajni dhe estetika",
      "Organizimi dhe menaxhimi i kohës",
    ],
    category: "Aftësitë",
  },
  {
    id: 5,
    text: "Në çfarë lloj mjedisi ndiheni më produktiv?",
    options: [
      "Një zyrë moderne korporative",
      "Një studio krijuese ose punishte",
      "Në terren (jashtë zyrës)",
      "Nga shtëpia ose hapësira bashkëpunuese",
    ],
    category: "Mjedisi",
  },
  {
    id: 6,
    text: "Sa rëndësi ka inovacioni për ju në punë?",
    options: [
      "Thelbësore, dua të punoj me teknologjinë e fundit",
      "E rëndësishme, por stabiliteti vjen i pari",
      "Mesatare, preferoj metodat e provuara",
      "Nuk ka rëndësi, për sa kohë puna ka impakt",
    ],
    category: "Inovacioni",
  },
  {
    id: 7,
    text: "Si do ta përshkruanit stilin tuaj të mësimit?",
    options: [
      "Mësoj duke lexuar dhe studiuar teori",
      "Mësoj duke vepruar (praktikisht)",
      "Mësoj përmes diskutimeve me të tjerët",
      "Mësoj përmes videove dhe ilustrimeve",
    ],
    category: "Të mësuarit",
  },
  {
    id: 8,
    text: "Cili është qëllimi juaj kryesor në 5 vitet e ardhshme?",
    options: [
      "Të bëhem ekspert në një fushë të ngushtë",
      "Të menaxhoj një ekip të madh njerëzish",
      "Të hap biznesin tim personal",
      "Të kontribuoj në një kauzë sociale",
    ],
    category: "Qëllimet",
  },
  {
    id: 9,
    text: "Si e menaxhoni stresin në punë?",
    options: [
      "Duke u fokusuar plotësisht te puna deri në fund",
      "Duke bërë pushime të shkurtra dhe biseduar me koleget",
      "Duke medituar ose bërë aktivitet fizik",
      "Duke kërkuar mendime dhe mbështetje",
    ],
    category: "Stresi",
  },
  {
    id: 10,
    text: "Cila fushë ju duket më interesante për të studiuar?",
    options: [
      "Shkencat kompjuterike dhe AI",
      "Psikologjia dhe shkencat sociale",
      "Menaxhimi dhe ekonomia",
      "Mjekësia dhe shkencat e jetës",
    ],
    category: "Interesat",
  },
];

export const INTERVIEW_QUESTIONS: Record<string, string[]> = {
  "Zhvillues Software": [
    "Na tregoni për projektin tuaj teknik më sfidues dhe si e keni zgjidhur atë?",
    "Si i qaseni debug-imit të një bug-u kompleks në prodhim?",
    "Çfarë përvojë keni me metodologjitë agile dhe si punoni në ekip?",
    "Si qëndroni të përditësuar me teknologjitë e reja?",
    "Përshkruani arkitekturën e një sistemi që keni ndërtuar.",
  ],
  "Dizajner UX/UI": [
    "Si e qaseni procesin e dizajnit nga fillimi deri në fund?",
    "Na tregoni për një rast kur keni ndryshuar dizajnin bazuar në feedback të përdoruesit.",
    "Si balanconi estetikën me funksionalitetin?",
    "Cilat mjete dizajni preferoni dhe pse?",
    "Si prezantoni konceptet e dizajnit te palët e interesuara?",
  ],
  "Menaxher Projekti": [
    "Na tregoni për projektin tuaj më kompleks dhe si e keni menaxhuar?",
    "Si menaxhoni konfliktet brenda ekipit?",
    "Çfarë metodologjie preferoni: Agile, Waterfall, apo Hybrid?",
    "Si komunikoni me palët e interesuara të ndryshme?",
    "Çfarë bëni kur projekti mbetet prapa orarit?",
  ],
  "Analist të Dhënash": [
    "Na tregoni për analizën tuaj më komplekse të të dhënave.",
    "Cilat mjete dhe gjuhë programimi përdorni për analizë?",
    "Si i prezantoni gjetjet nga të dhënat te audiencat jo-teknike?",
    "Çfarë përvojë keni me machine learning?",
    "Si siguroheni për cilësinë e të dhënave?",
  ],
};

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'cv',
    label: 'CV Tips',
    icon: '📄',
    prompt: 'Si ta përmirësoj CV-në time për të marrë më shumë thirrje për intervistë?',
  },
  {
    id: 'interview',
    label: 'Intervistë',
    icon: '💼',
    prompt: 'Jepu disa këshilla për t\'u përgatitur për një intervistë pune.',
  },
  {
    id: 'salary',
    label: 'Paga',
    icon: '💰',
    prompt: 'Si të negocioj një pagë më të lartë gjatë intervistës?',
  },
  {
    id: 'skills',
    label: 'Aftësi',
    icon: '🎯',
    prompt: 'Çfarë aftësish janë më të kërkuara në tregun e punës sot?',
  },
];

export const INTERVIEW_MODE_INFO = {
  [InterviewMode.TECHNICAL]: {
    name: TRANSLATIONS.interviewSetup.modes.technical.name,
    description: TRANSLATIONS.interviewSetup.modes.technical.description,
    icon: '⚙️',
  },
  [InterviewMode.BEHAVIORAL]: {
    name: TRANSLATIONS.interviewSetup.modes.behavioral.name,
    description: TRANSLATIONS.interviewSetup.modes.behavioral.description,
    icon: '🤝',
  },
  [InterviewMode.MIXED]: {
    name: TRANSLATIONS.interviewSetup.modes.mixed.name,
    description: TRANSLATIONS.interviewSetup.modes.mixed.description,
    icon: '🔀',
  },
  [InterviewMode.STRESS]: {
    name: TRANSLATIONS.interviewSetup.modes.stress.name,
    description: TRANSLATIONS.interviewSetup.modes.stress.description,
    icon: '🔥',
  },
};

export const DIFFICULTY_INFO = {
  [DifficultyLevel.EASY]: {
    name: TRANSLATIONS.interviewSetup.difficulties.easy.name,
    description: TRANSLATIONS.interviewSetup.difficulties.easy.description,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    borderColor: 'border-green-400/30',
  },
  [DifficultyLevel.MEDIUM]: {
    name: TRANSLATIONS.interviewSetup.difficulties.medium.name,
    description: TRANSLATIONS.interviewSetup.difficulties.medium.description,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/30',
  },
  [DifficultyLevel.HARD]: {
    name: TRANSLATIONS.interviewSetup.difficulties.hard.name,
    description: TRANSLATIONS.interviewSetup.difficulties.hard.description,
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    borderColor: 'border-red-400/30',
  },
};
