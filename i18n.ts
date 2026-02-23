@@ -34,127 +34,127 @@ export const TRANSLATIONS = {
     title: "Rezultatet e Karrierës",
     match: "Përputhja Kryesore",
     alternatives: "Alternativa të Tjera",
     whyFit: "Pse kjo karrierë ju përshtatet?",
     salary: "Diapazoni i Pagës",
     learning: "Rrugëtimi i Mësimit",
     practice: "Fillo Praktikën e Intervistës"
   },
   interview: {
     title: "Simulim Interviste",
     subtitle: "Përgatituni për rolin tuaj të ri me pyetje reale dhe feedback të menjëhershëm.",
     chatPlaceholder: "Shkruani përgjigjen tuaj..."
   }
 };
 
 export const QUIZ_QUESTIONS: QuizQuestion[] = [
   {
     id: 1,
     text: "Si preferoni të punoni gjatë ditës?",
     options: [
       "Vetëm, në një mjedis të qetë dhe të fokusuar",
       "Në ekip, me bashkëpunim të vazhdueshëm",
       "Hibrid - kohë të balancuar vetëm dhe në grup",
       "Në lëvizje të vazhdueshme dhe me njerëz të rinj"
     ],
-    category: "Environment"
+    category: "Mjedisi"
   },
   {
     id: 2,
     text: "Çfarë ju motivon më shumë në një projekt?",
     options: [
       "Zgjidhja e problemeve komplekse teknike",
       "Krijimi i diçkaje vizuale dhe artistike",
       "Ndihma direkte për njerëzit e tjerë",
       "Arritja e objektivave financiare dhe rritja e biznesit"
     ],
-    category: "Motivation"
+    category: "Motivimi"
   },
   {
     id: 3,
     text: "Si reagoni ndaj situatave të paparashikuara?",
     options: [
       "Analizoj të dhënat dhe gjej një zgjidhje logjike",
       "Përdor intuitën dhe kreativitetin për të improvizuar",
       "Kërkoj ndihmë nga ekipi dhe delegoj detyrat",
       "Qëndroj i qetë dhe ndjek procedurat e paracaktuara"
     ],
-    category: "Crisis Management"
+    category: "Menaxhimi i krizës"
   },
   {
     id: 4,
     text: "Cila nga këto aftësi mendoni se është pika juaj më e fortë?",
     options: [
       "Mendimi analitik dhe matematika",
       "Komunikimi dhe bindja e të tjerëve",
       "Dizajni dhe estetika",
       "Organizimi dhe menaxhimi i kohës"
     ],
-    category: "Skills"
+    category: "Aftësitë"
   },
   {
     id: 5,
     text: "Në çfarë lloj mjedisi ndiheni më produktiv?",
     options: [
       "Një zyrë moderne korporative",
       "Një studio krijuese ose punishte",
       "Në terren (jashtë zyrës)",
-      "Nga shtëpia ose hapësira coworking"
+      "Nga shtëpia ose hapësira bashkëpunuese"
     ],
-    category: "Environment"
+    category: "Mjedisi"
   },
   {
     id: 6,
     text: "Sa rëndësi ka inovacioni për ju në punë?",
     options: [
       "Thelbësore, dua të punoj me teknologjinë e fundit",
       "E rëndësishme, por stabiliteti vjen i pari",
       "Mesatare, preferoj metodat e provuara",
       "Nuk ka rëndësi, për sa kohë puna ka impakt"
     ],
-    category: "Innovation"
+    category: "Inovacioni"
   },
   {
     id: 7,
     text: "Si do ta përshkruanit stilin tuaj të mësimit?",
     options: [
       "Mësoj duke lexuar dhe studiuar teori",
-      "Mësoj duke vepruar (hands-on)",
+      "Mësoj duke vepruar (praktikisht)",
       "Mësoj përmes diskutimeve me të tjerët",
       "Mësoj përmes videove dhe ilustrimeve"
     ],
-    category: "Learning"
+    category: "Të mësuarit"
   },
   {
     id: 8,
     text: "Cili është qëllimi juaj kryesor në 5 vitet e ardhshme?",
     options: [
       "Të bëhem ekspert në një fushë të ngushtë",
       "Të menaxhoj një ekip të madh njerëzish",
       "Të hap biznesin tim personal",
       "Të kontribuoj në një kauzë sociale"
     ],
-    category: "Goals"
+    category: "Qëllimet"
   },
   {
     id: 9,
     text: "Si e menaxhoni stresin në punë?",
     options: [
       "Duke u fokusuar plotësisht te puna deri në fund",
       "Duke bërë pushime të shkurtra dhe biseduar me koleget",
       "Duke medituar ose bërë aktivitet fizik",
       "Duke kërkuar feedback dhe mbështetje"
     ],
-    category: "Stress"
+    category: "Stresi"
   },
   {
     id: 10,
     text: "Cila fushë ju duket më interesante për të studiuar?",
     options: [
       "Shkencat kompjuterike dhe AI",
       "Psikologjia dhe shkencat sociale",
       "Menaxhimi dhe ekonomia",
       "Mjekësia dhe shkencat e jetës"
     ],
-    category: "Interests"
+    category: "Interesat"
   }
 ];

import { QuizQuestion } from './types';

export const TRANSLATIONS = {
  common: {
    next: "Vazhdo",
    back: "Kthehu",
    start: "Fillo Tani",
    finish: "Përfundo",
    loading: "Duke u ngarkuar...",
    customPlaceholder: "Shkruani përgjigjen tuaj këtu...",
    other: "Tjetër (shkruaj vetë)"
  },
  landing: {
    title: "Gjej Karrierën Tënde Ideale",
    subtitle: "Zbuloni rrugëtimin tuaj profesional përmes inteligjencës artificiale dhe orientimit të specializuar në gjuhën shqipe.",
    features: "Vlerësim i saktë 90% • Analizë e thellë • Praktikë për intervista"
  },
  quiz: {
    progress: "Progresi i Vlerësimit",
    confirmSubmit: "A jeni gati të shihni rezultatet tuaja?"
  },
  analyzing: {
    title: "Duke Analizuar Profilin Tuaj",
    subtitle: "Busulla jonë digjitale po përpunon të dhënat tuaja për të gjetur përputhjen perfekte...",
    steps: [
      "Po analizojmë tiparet e personalitetit...",
      "Po vlerësojmë aftësitë tuaja logjike...",
      "Po krahasojmë me 100+ karriera profesionale...",
      "Po gjenerojmë rrugëtimin e mësimit..."
    ]
  },
  results: {
    title: "Rezultatet e Karrierës",
    match: "Përputhja Kryesore",
    alternatives: "Alternativa të Tjera",
    whyFit: "Pse kjo karrierë ju përshtatet?",
    salary: "Diapazoni i Pagës",
    learning: "Rrugëtimi i Mësimit",
    practice: "Fillo Praktikën e Intervistës"
  },
  interview: {
    title: "Simulim Interviste",
    subtitle: "Përgatituni për rolin tuaj të ri me pyetje reale dhe feedback të menjëhershëm.",
    chatPlaceholder: "Shkruani përgjigjen tuaj..."
  }
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    text: "Si preferoni të punoni gjatë ditës?",
    options: [
      "Vetëm, në një mjedis të qetë dhe të fokusuar",
      "Në ekip, me bashkëpunim të vazhdueshëm",
      "Hibrid - kohë të balancuar vetëm dhe në grup",
      "Në lëvizje të vazhdueshme dhe me njerëz të rinj"
    ],
    category: "Mjedisi"
  },
  {
    id: 2,
    text: "Çfarë ju motivon më shumë në një projekt?",
    options: [
      "Zgjidhja e problemeve komplekse teknike",
      "Krijimi i diçkaje vizuale dhe artistike",
      "Ndihma direkte për njerëzit e tjerë",
      "Arritja e objektivave financiare dhe rritja e biznesit"
    ],
    category: "Motivimi"
  },
  {
    id: 3,
    text: "Si reagoni ndaj situatave të paparashikuara?",
    options: [
      "Analizoj të dhënat dhe gjej një zgjidhje logjike",
      "Përdor intuitën dhe kreativitetin për të improvizuar",
      "Kërkoj ndihmë nga ekipi dhe delegoj detyrat",
      "Qëndroj i qetë dhe ndjek procedurat e paracaktuara"
    ],
    category: "Menaxhimi i krizës"
  },
  {
    id: 4,
    text: "Cila nga këto aftësi mendoni se është pika juaj më e fortë?",
    options: [
      "Mendimi analitik dhe matematika",
      "Komunikimi dhe bindja e të tjerëve",
      "Dizajni dhe estetika",
      "Organizimi dhe menaxhimi i kohës"
    ],
    category: "Aftësitë"
  },
  {
    id: 5,
    text: "Në çfarë lloj mjedisi ndiheni më produktiv?",
    options: [
      "Një zyrë moderne korporative",
      "Një studio krijuese ose punishte",
      "Në terren (jashtë zyrës)",
      "Nga shtëpia ose hapësira bashkëpunuese"
    ],
    category: "Mjedisi"
  },
  {
    id: 6,
    text: "Sa rëndësi ka inovacioni për ju në punë?",
    options: [
      "Thelbësore, dua të punoj me teknologjinë e fundit",
      "E rëndësishme, por stabiliteti vjen i pari",
      "Mesatare, preferoj metodat e provuara",
      "Nuk ka rëndësi, për sa kohë puna ka impakt"
    ],
    category: "Inovacioni"
  },
  {
    id: 7,
    text: "Si do ta përshkruanit stilin tuaj të mësimit?",
    options: [
      "Mësoj duke lexuar dhe studiuar teori",
      "Mësoj duke vepruar (praktikisht)",
      "Mësoj përmes diskutimeve me të tjerët",
      "Mësoj përmes videove dhe ilustrimeve"
    ],
    category: "Të mësuarit"
  },
  {
    id: 8,
    text: "Cili është qëllimi juaj kryesor në 5 vitet e ardhshme?",
    options: [
      "Të bëhem ekspert në një fushë të ngushtë",
      "Të menaxhoj një ekip të madh njerëzish",
      "Të hap biznesin tim personal",
      "Të kontribuoj në një kauzë sociale"
    ],
    category: "Qëllimet"
  },
  {
    id: 9,
    text: "Si e menaxhoni stresin në punë?",
    options: [
      "Duke u fokusuar plotësisht te puna deri në fund",
      "Duke bërë pushime të shkurtra dhe biseduar me koleget",
      "Duke medituar ose bërë aktivitet fizik",
      "Duke kërkuar feedback dhe mbështetje"
    ],
    category: "Stresi"
  },
  {
    id: 10,
    text: "Cila fushë ju duket më interesante për të studiuar?",
    options: [
      "Shkencat kompjuterike dhe AI",
      "Psikologjia dhe shkencat sociale",
      "Menaxhimi dhe ekonomia",
      "Mjekësia dhe shkencat e jetës"
    ],
    category: "Interesat"
  }
];
