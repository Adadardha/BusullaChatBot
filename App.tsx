 import React, { useState, useEffect, useRef } from 'react';
 import { AppState, QuizAnswer, PredictionResult } from './types';
 import { TRANSLATIONS, QUIZ_QUESTIONS } from './i18n';
 import Scene from './components/3D/Scene';
 import Compass from './components/3D/Compass';
 import { predictCareer, getAssistantResponse, evaluateFinalInterview } from './services/gemini';
 import { motion, AnimatePresence } from 'framer-motion';
 import { ASCOIIHeader, ASCIIGrid, ASCIILoader } from './components/ASCII/Decorations';
 
 const App: React.FC = () => {
   const [currentStep, setCurrentStep] = useState<AppState>(AppState.LANDING);
   const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
   const [customValue, setCustomValue] = useState("");
   const [prediction, setPrediction] = useState<PredictionResult | null>(null);
   const [isLoading, setIsLoading] = useState(false);
 
   const startQuiz = () => setCurrentStep(AppState.QUIZ);
 
+  const resetApp = () => {
+    setCurrentStep(AppState.LANDING);
+    setQuizAnswers([]);
+    setCurrentQuestionIndex(0);
+    setCustomValue("");
+    setPrediction(null);
+    setIsLoading(false);
+  };
+
   const handleAnswer = (answer: string, isCustom = false) => {
     const newAnswers = [...quizAnswers];
     newAnswers[currentQuestionIndex] = {
       questionId: QUIZ_QUESTIONS[currentQuestionIndex].id,
       answer,
       isCustom
     };
     setQuizAnswers(newAnswers);
     setCustomValue("");
 
     if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
       setCurrentQuestionIndex(prev => prev + 1);
     } else {
       processResults(newAnswers);
     }
   };
 
   const processResults = async (finalAnswers: QuizAnswer[]) => {
     setCurrentStep(AppState.ANALYZING);
     setIsLoading(true);
     try {
       const result = await predictCareer(finalAnswers);
       setPrediction(result);
       setCurrentStep(AppState.RESULTS);
     } catch (error: any) {
       console.error(error);
       const isQuota = error.message?.includes('429') || error.message?.includes('QUOTA');
       alert(isQuota ? "Kufiri i kërkesave është arritur. Ju lutem prisni një minutë para se të provoni përsëri." : "Ndodhi një gabim. Ju lutem provoni përsëri.");
       setCurrentStep(AppState.QUIZ);
     } finally {
       setIsLoading(false);
     }
   };
 
   return (
     <div className="min-h-screen selection:bg-white selection:text-black overflow-x-hidden bg-[#050505]">
       <ASCIIGrid />
       
       <nav className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-50 backdrop-blur-sm bg-black/50 border-b border-white/5">
         <div className="flex items-center gap-4">
           <div className="w-8 h-8 border-2 border-white rotate-45 flex items-center justify-center bg-white text-black font-bold">
             <span className="text-[12px] -rotate-45">B</span>
           </div>
           <div className="flex flex-col">
             <span className="font-heading font-bold text-lg tracking-tighter uppercase leading-none">Busulla</span>
-            <span className="text-[10px] font-mono opacity-50 uppercase tracking-[0.3em]">AI_CORE_V4</span>
+            <span className="text-[10px] font-mono opacity-50 uppercase tracking-[0.3em]">BËRTHAMA_AI_V4</span>
           </div>
         </div>
-        <button onClick={() => window.location.reload()} className="text-xs font-bold uppercase tracking-widest border border-white/20 px-4 py-2 hover:bg-white hover:text-black transition-all">
-          {currentStep !== AppState.LANDING ? "Restart" : "sq-AL"}
+        <button onClick={resetApp} className="text-xs font-bold uppercase tracking-widest border border-white/20 px-3 py-2 md:px-4 hover:bg-white hover:text-black transition-all">
+          {currentStep !== AppState.LANDING ? "Rifillo" : "sq-AL"}
         </button>
       </nav>
 
       <main className="relative flex flex-col items-center justify-center min-h-screen px-4">
         {currentStep !== AppState.INTERVIEW && (
           <Scene>
             <Compass isSpinning={currentStep === AppState.LANDING || currentStep === AppState.ANALYZING} />
           </Scene>
         )}
 
         <AnimatePresence mode="wait">
           {currentStep === AppState.LANDING && (
-            <motion.div key="landing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="max-w-4xl text-center space-y-12">
+            <motion.div key="landing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="max-w-4xl text-center space-y-8 md:space-y-12 px-2">
               <ASCOIIHeader />
               <div className="space-y-6">
-                <h1 className="text-7xl md:text-9xl font-heading font-black uppercase leading-[0.85] tracking-tighter">
+                <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-heading font-black uppercase leading-[0.9] tracking-tighter">
                   {TRANSLATIONS.landing.title.split(' ').map((word, j) => <span key={j} className="block hover:italic transition-all cursor-default">{word}</span>)}
                 </h1>
-                <p className="text-xl md:text-2xl text-gray-400 max-w-xl mx-auto italic border-l-2 border-white/20 pl-6">
+                <p className="text-lg md:text-2xl text-gray-400 max-w-xl mx-auto italic border-l-2 border-white/20 pl-4 md:pl-6">
                   {TRANSLATIONS.landing.subtitle}
                 </p>
               </div>
-              <button onClick={startQuiz} className="px-16 py-8 bg-white text-black font-heading font-black text-3xl uppercase brutalist-button transition-all">
+              <button onClick={startQuiz} className="px-8 md:px-16 py-5 md:py-8 bg-white text-black font-heading font-black text-xl md:text-3xl uppercase brutalist-button transition-all">
                 {TRANSLATIONS.common.start} →
               </button>
             </motion.div>
           )}
 
           {currentStep === AppState.QUIZ && (
             <motion.div key="quiz" initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -100, opacity: 0 }} className="w-full max-w-4xl">
-              <div className="brutalist-border bg-black p-8 md:p-12 relative overflow-hidden">
-                <div className="absolute top-0 right-0 p-2 font-mono text-[8px] opacity-10">SYS_AUTH_0x{Math.random().toString(16).slice(2,6).toUpperCase()}</div>
-                <div className="flex justify-between items-end mb-16 border-b border-white/10 pb-6">
-                  <h2 className="text-4xl font-heading font-bold">{currentQuestionIndex + 1} / {QUIZ_QUESTIONS.length}</h2>
-                  <div className="w-64 h-1 bg-white/10"><div className="h-full bg-white shadow-[0_0_10px_white] transition-all duration-500" style={{ width: `${((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }} /></div>
+              <div className="brutalist-border bg-black p-5 sm:p-8 md:p-12 relative overflow-hidden">
+                <div className="absolute top-0 right-0 p-2 font-mono text-[8px] opacity-10">AUT_SISTEM_0x{Math.random().toString(16).slice(2,6).toUpperCase()}</div>
+                <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between sm:items-end mb-10 md:mb-16 border-b border-white/10 pb-6">
+                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold">{currentQuestionIndex + 1} / {QUIZ_QUESTIONS.length}</h2>
+                  <div className="w-full sm:w-64 h-1 bg-white/10"><div className="h-full bg-white shadow-[0_0_10px_white] transition-all duration-500" style={{ width: `${((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }} /></div>
                 </div>
-                <div className="space-y-12">
-                  <h3 className="text-4xl md:text-5xl font-heading font-bold tracking-tighter leading-tight">{QUIZ_QUESTIONS[currentQuestionIndex].text}</h3>
+                <div className="space-y-8 md:space-y-12">
+                  <h3 className="text-2xl sm:text-3xl md:text-5xl font-heading font-bold tracking-tighter leading-tight">{QUIZ_QUESTIONS[currentQuestionIndex].text}</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {QUIZ_QUESTIONS[currentQuestionIndex].options.map((opt, i) => (
-                      <button key={i} onClick={() => handleAnswer(opt)} className="group p-8 text-left border-2 border-white/10 hover:border-white hover:bg-white hover:text-black transition-all relative">
+                      <button key={i} onClick={() => handleAnswer(opt)} className="group p-5 md:p-8 text-left border-2 border-white/10 hover:border-white hover:bg-white hover:text-black transition-all relative">
                         <span className="text-[10px] font-mono absolute top-2 right-4 opacity-20 group-hover:opacity-100 transition-opacity">[{i + 1}]</span>
-                        <span className="text-xl font-bold uppercase">{opt}</span>
+                        <span className="text-base md:text-xl font-bold uppercase">{opt}</span>
                       </button>
                     ))}
                     <div className="col-span-1 md:col-span-2 mt-8">
                       <div className="relative">
-                        <input type="text" value={customValue} onChange={(e) => setCustomValue(e.target.value)} placeholder={TRANSLATIONS.common.customPlaceholder} className="w-full bg-white/5 border-b-4 border-white/20 py-8 px-6 outline-none focus:border-white text-2xl font-heading transition-all" />
-                        <button disabled={!customValue.trim()} onClick={() => handleAnswer(customValue, true)} className="absolute right-6 bottom-8 px-8 py-3 bg-white text-black font-black uppercase text-sm brutalist-button transition-all disabled:opacity-0 disabled:translate-y-4">Vazhdo</button>
+                        <input type="text" value={customValue} onChange={(e) => setCustomValue(e.target.value)} placeholder={TRANSLATIONS.common.customPlaceholder} className="w-full bg-white/5 border-b-4 border-white/20 py-5 md:py-8 px-4 md:px-6 outline-none focus:border-white text-lg md:text-2xl font-heading transition-all" />
+                        <button disabled={!customValue.trim()} onClick={() => handleAnswer(customValue, true)} className="absolute right-3 md:right-6 bottom-5 md:bottom-8 px-4 md:px-8 py-2 md:py-3 bg-white text-black font-black uppercase text-xs md:text-sm brutalist-button transition-all disabled:opacity-0 disabled:translate-y-4">Vazhdo</button>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             </motion.div>
           )}
 
           {currentStep === AppState.ANALYZING && (
             <motion.div key="analyzing" className="text-center space-y-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
               <ASCIILoader />
               <div className="space-y-4">
                 <h2 className="text-5xl font-heading font-black uppercase tracking-tighter animate-pulse">{TRANSLATIONS.analyzing.title}</h2>
                 <div className="flex flex-col gap-2 font-mono text-[10px] opacity-40 uppercase tracking-widest">
                   {TRANSLATIONS.analyzing.steps.map((s, i) => (
-                    <motion.div key={i} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.4 }}>[SUCCESS] {s}</motion.div>
+                    <motion.div key={i} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.4 }}>[SUKSES] {s}</motion.div>
                   ))}
                 </div>
               </div>
             </motion.div>
           )}
 
           {currentStep === AppState.RESULTS && prediction && (
-            <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-7xl pb-24">
+            <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-7xl pb-12 md:pb-24">
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
-                <div className="lg:col-span-8 brutalist-border bg-white text-black p-12 md:p-20 relative overflow-hidden">
+                <div className="lg:col-span-8 brutalist-border bg-white text-black p-6 md:p-12 lg:p-20 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                   <span className="px-6 py-2 bg-black text-white text-[10px] font-black uppercase tracking-[0.4em]">{TRANSLATIONS.results.match}</span>
-                  <h1 className="text-6xl md:text-9xl font-heading font-black uppercase leading-[0.8] tracking-tighter italic mt-6">{prediction.primary.title}</h1>
-                  <p className="text-2xl mt-8 border-l-8 border-black pl-8 font-medium leading-snug">{prediction.primary.description}</p>
+                  <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-heading font-black uppercase leading-[0.85] tracking-tighter italic mt-6">{prediction.primary.title}</h1>
+                  <p className="text-lg md:text-2xl mt-6 md:mt-8 border-l-8 border-black pl-4 md:pl-8 font-medium leading-snug">{prediction.primary.description}</p>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16 border-t border-black/10 pt-12">
                     <div className="space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">{TRANSLATIONS.results.whyFit}</h4>
                       <p className="text-lg">{prediction.primary.whyFit}</p>
                     </div>
                     <div className="space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">{TRANSLATIONS.results.salary}</h4>
-                      <p className="text-5xl font-heading font-black tracking-tighter">{prediction.primary.salaryRange}</p>
-                      <p className="text-[10px] font-mono uppercase opacity-40">Estimate Albanian Market / Annual</p>
+                      <p className="text-3xl md:text-5xl font-heading font-black tracking-tighter">{prediction.primary.salaryRange}</p>
+                      <p className="text-[10px] font-mono uppercase opacity-40">Vlerësim për tregun shqiptar / në vit</p>
                     </div>
                   </div>
 
-                  <button onClick={() => setCurrentStep(AppState.INTERVIEW)} className="w-full mt-12 py-8 bg-black text-white font-heading font-black text-3xl uppercase brutalist-button flex items-center justify-center gap-6 group">
+                  <button onClick={() => setCurrentStep(AppState.INTERVIEW)} className="w-full mt-8 md:mt-12 py-5 md:py-8 bg-black text-white font-heading font-black text-xl md:text-3xl uppercase brutalist-button flex items-center justify-center gap-4 md:gap-6 group">
                     Praktiko Intervistën <span className="group-hover:translate-x-4 transition-transform duration-300">→</span>
                   </button>
                 </div>
                 
                 <div className="lg:col-span-4 space-y-8">
                   <div className="brutalist-border bg-black p-8 space-y-6">
                     <h3 className="text-xl font-heading font-bold uppercase italic border-b border-white/20 pb-2">Rruga e mësimit</h3>
                     <div className="space-y-6">
                       {prediction.primary.learningPath.courses.map((c, i) => (
                         <div key={i} className="flex gap-4 group">
                           <span className="text-[10px] bg-white text-black px-2 py-1 h-fit font-bold group-hover:bg-gray-200 transition-colors">0{i+1}</span>
                           <p className="text-sm font-bold group-hover:translate-x-1 transition-transform">{c}</p>
                         </div>
                       ))}
                     </div>
                     <div className="pt-6 border-t border-white/10 flex justify-between items-center text-[10px] font-mono opacity-40 uppercase tracking-widest">
                       <span>Kohëzgjatja</span>
                       <span>{prediction.primary.learningPath.timeline}</span>
                     </div>
                   </div>
 
                   <div className="space-y-4">
                     <h3 className="text-[10px] font-mono opacity-30 uppercase tracking-[0.3em] px-2">{TRANSLATIONS.results.alternatives}</h3>
                     {prediction.alternatives.map((alt, i) => (
                       <div key={i} className="brutalist-border bg-white/5 p-6 hover:bg-white hover:text-black transition-all flex justify-between items-center group cursor-default">
                         <div>
-                          <p className="text-[8px] font-mono opacity-40 mb-1 italic uppercase">ALT_PATH_0{i+1}</p>
+                          <p className="text-[8px] font-mono opacity-40 mb-1 italic uppercase">RRUGË_ALT_0{i+1}</p>
                           <h4 className="font-heading font-black text-xl uppercase italic leading-none">{alt.title}</h4>
                         </div>
                         <span className="text-2xl font-heading font-bold">{alt.percentage}%</span>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
             </motion.div>
           )}
 
           {currentStep === AppState.INTERVIEW && prediction && (
-            <motion.div key="interview" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-6xl h-[85vh] flex flex-col pt-8">
-              <LeetCodeInterview career={prediction.primary.title} />
+            <motion.div key="interview" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-6xl h-[88vh] md:h-[85vh] flex flex-col pt-4 md:pt-8">
+              <LeetCodeInterview career={prediction.primary.title} onBackToStart={resetApp} />
             </motion.div>
           )}
         </AnimatePresence>
 
         <Chatbot career={prediction?.primary.title} />
       </main>
     </div>
   );
 };
 
-const LeetCodeInterview: React.FC<{ career: string }> = ({ career }) => {
+const LeetCodeInterview: React.FC<{ career: string; onBackToStart: () => void }> = ({ career, onBackToStart }) => {
   const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([]);
   const [input, setInput] = useState("");
   const [isTyping, setIsTyping] = useState(false);
-  const [timeLeft, setTimeLeft] = useState(480); // 8 intense minutes
+  const [timeLeft, setTimeLeft] = useState(600); // 10 minuta
+  const [timerStarted, setTimerStarted] = useState(false);
   const [isFinished, setIsFinished] = useState(false);
   const [finalVerdict, setFinalVerdict] = useState<{ hired: boolean, feedback: string } | null>(null);
   const [level, setLevel] = useState<'EASY' | 'MEDIUM' | 'HARD'>('EASY');
   const [questionCount, setQuestionCount] = useState(0);
   const scrollRef = useRef<HTMLDivElement>(null);
 
   useEffect(() => {
     if (messages.length === 0) startInterview();
   }, []);
 
   useEffect(() => {
+    if (!timerStarted || isFinished) return;
+
     const timer = setInterval(() => {
-      if (!isFinished) {
-        setTimeLeft(prev => {
-          if (prev <= 1) {
-            clearInterval(timer);
-            finishInterview();
-            return 0;
-          }
-          return prev - 1;
-        });
-      }
+      setTimeLeft(prev => {
+        if (prev <= 1) {
+          clearInterval(timer);
+          finishInterview();
+          return 0;
+        }
+        return prev - 1;
+      });
     }, 1000);
+
     return () => clearInterval(timer);
-  }, [isFinished]);
+  }, [timerStarted, isFinished]);
 
   useEffect(() => {
     scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
   }, [messages, isTyping]);
 
   const startInterview = async () => {
     setIsTyping(true);
     const { generateInterviewQuestion } = await import('./services/gemini');
     try {
       const q = await generateInterviewQuestion(career, [], 'EASY');
-      setMessages([{ role: 'ai', text: `[SYSTEM] TERMINAL READY.\n[USER_ROLE] Candidate for ${career.toUpperCase()}\n[SESSION] Started.\n\n${q}` }]);
+      setMessages([{ role: 'ai', text: `[SISTEMI] TERMINALI GATI.\n[ROLI_I_PËRDORUESIT] Kandidat për ${career.toUpperCase()}\n[SESIONI] Filloi.\n\n${q}` }]);
     } catch (e: any) {
       setMessages([{ role: 'ai', text: "Lidhja me serverin e vlerësimit dështoi. Kontrolloni limitet e AI dhe provoni përsëri." }]);
     } finally {
       setIsTyping(false);
     }
   };
 
   const finishInterview = async () => {
     setIsFinished(true);
     setIsTyping(true);
     try {
       const verdict = await evaluateFinalInterview(career, messages);
       setFinalVerdict(verdict);
     } catch (e: any) {
       setFinalVerdict({ hired: false, feedback: "Më vjen keq, pati një problem gjatë analizimit të performancës tuaj të fundit." });
     } finally {
       setIsTyping(false);
     }
   };
 
   const handleRun = async () => {
     if (!input.trim() || isTyping || isFinished) return;
     const userMsg = input;
     setInput("");
     setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
     setIsTyping(true);
 
     const { evaluateAnswer, generateInterviewQuestion } = await import('./services/gemini');
     
     try {
       const lastQ = messages.filter(m => m.role === 'ai').slice(-1)[0]?.text || "";
       const evaluation = await evaluateAnswer(career, lastQ, userMsg);
       
       const newCount = questionCount + 1;
       setQuestionCount(newCount);
       
       let nextLevel: 'EASY' | 'MEDIUM' | 'HARD' = 'EASY';
-      if (newCount >= 2) nextLevel = 'MEDIUM';
-      if (newCount >= 4) nextLevel = 'HARD';
+      if (newCount >= 3) nextLevel = 'MEDIUM';
+      if (newCount >= 5) nextLevel = 'HARD';
       setLevel(nextLevel);
 
       if (newCount >= 6) {
-        setMessages(prev => [...prev, { role: 'ai', text: `[EVAL] ${evaluation}\n\n[SYSTEM] Sasia maksimale e pyetjeve u arrit. Duke gjeneruar vendimin përfundimtar...` }]);
+        setMessages(prev => [...prev, { role: 'ai', text: `[VLERËSIMI] ${evaluation}\n\n[SISTEMI] Numri maksimal i pyetjeve u arrit. Po gjeneroj vendimin përfundimtar...` }]);
         finishInterview();
       } else {
         const nextQ = await generateInterviewQuestion(career, [...messages, { role: 'user', text: userMsg }], nextLevel);
         setMessages(prev => [...prev, 
           { role: 'ai', text: `[VLERËSIM] ${evaluation}` },
           { role: 'ai', text: `[NIVELI: ${nextLevel}] ${nextQ}` }
         ]);
       }
     } catch (e: any) {
       const isQuota = e.message?.includes('429') || e.message?.includes('QUOTA');
       const errTxt = isQuota ? "GABIM: Kuota e AI u tejkalua. Ju lutem prisni pak." : "GABIM: Problemi me sinkronizimin e të dhënave.";
       setMessages(prev => [...prev, { role: 'ai', text: errTxt }]);
     } finally {
       setIsTyping(false);
     }
   };
 
   return (
     <div className="flex-1 brutalist-border bg-[#0a0a0a] flex flex-col overflow-hidden shadow-[0_0_80px_rgba(255,255,255,0.08)]">
-      <div className="h-14 bg-white/5 border-b border-white/10 flex items-center justify-between px-6">
+      <div className="min-h-14 bg-white/5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 md:px-6 py-3 sm:py-0">
         <div className="flex items-center gap-4">
           <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-[#ff5f56]" /><div className="w-3 h-3 rounded-full bg-[#ffbd2e]" /><div className="w-3 h-3 rounded-full bg-[#27c93f]" /></div>
-          <span className="text-[10px] font-mono opacity-40 uppercase tracking-[0.2em]">IDE_SIMULATOR_V4.0</span>
+          <span className="text-[10px] font-mono opacity-40 uppercase tracking-[0.2em]">SIMULUESI_I_INTERVISTËS_V4.0</span>
           <div className={`text-[9px] font-mono px-2 py-0.5 border ${level === 'EASY' ? 'border-green-500 text-green-500' : level === 'MEDIUM' ? 'border-yellow-500 text-yellow-500' : 'border-red-500 text-red-500'} bg-black/50`}>
-            DIFFICULTY: {level}
+            VËSHTIRËSIA: {level === 'EASY' ? 'LEHTË' : level === 'MEDIUM' ? 'MESATARE' : 'VËSHTIRË'}
           </div>
         </div>
         <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 font-mono text-xs">
-            <span className="opacity-40 uppercase tracking-tighter">TIME_REMAINING:</span>
+            <span className="opacity-40 uppercase tracking-tighter">KOHA_E_MBETUR:</span>
             <span className={`font-bold tabular-nums ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-white/80'}`}>
               {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}
             </span>
           </div>
           <button disabled={isFinished || !input.trim() || isTyping} onClick={handleRun} className="bg-white text-black px-6 py-2 text-[10px] font-black uppercase brutalist-button disabled:opacity-30 disabled:pointer-events-none">Dërgo Përgjigjen</button>
         </div>
       </div>
 
-      <div className="flex-1 flex overflow-hidden">
-        <div className="w-1/4 border-r border-white/10 p-6 space-y-6 overflow-y-auto bg-black/50 custom-scrollbar text-xs font-mono">
-          <h2 className="text-xl font-heading font-black uppercase italic tracking-tighter border-b border-white/10 pb-2">SFIDA: {career}</h2>
+      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
+        <div className="w-full lg:w-1/4 border-b lg:border-b-0 lg:border-r border-white/10 p-4 md:p-6 space-y-6 overflow-y-auto bg-black/50 custom-scrollbar text-xs font-mono">
+          <h2 className="text-xl font-heading font-black uppercase italic tracking-tighter border-b border-white/10 pb-2">SIMULIMI: {career}</h2>
           <div className="space-y-4 opacity-50">
             <p>Sistemi po monitoron përgjigjet tuaja në kohë reale. Çdo pyetje rrit vështirësinë bazuar në performancën tuaj.</p>
             <div className="p-4 bg-white/5 border border-white/10 rounded">
               <p className="font-bold mb-2">METRIKAT E MATJES:</p>
               <ul className="list-disc pl-4 space-y-1">
                 <li>Saktësia Teknike</li>
                 <li>Mendimi Kritik</li>
-                <li>Situational Judgment</li>
+                <li>Gjykim situacional</li>
               </ul>
             </div>
             {isFinished && <div className="text-white opacity-100 font-bold border-t border-white/20 pt-4 animate-pulse">SESIONI PËRFUNDOI.</div>}
           </div>
         </div>
 
         <div className="flex-1 flex flex-col bg-black relative">
-          <div ref={scrollRef} className="flex-1 p-8 overflow-y-auto font-mono text-[13px] leading-relaxed space-y-8 custom-scrollbar">
+          <div ref={scrollRef} className="flex-1 p-4 md:p-8 overflow-y-auto font-mono text-xs md:text-[13px] leading-relaxed space-y-6 md:space-y-8 custom-scrollbar">
             {messages.map((m, i) => (
               <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`p-5 border-l-4 max-w-[85%] ${m.role === 'user' ? 'border-white bg-white/5 shadow-[0_0_20px_rgba(255,255,255,0.05)]' : 'border-white/20 bg-black'}`}>
-                  <span className="text-[9px] opacity-30 block mb-2 uppercase tracking-widest">{m.role === 'ai' ? 'CORE_SERVER' : 'CANDIDATE_INPUT'}</span>
+                  <span className="text-[9px] opacity-30 block mb-2 uppercase tracking-widest">{m.role === 'ai' ? 'SERVERI_QENDROR' : 'HYRJE_KANDIDATI'}</span>
                   <div className="whitespace-pre-wrap">{m.text}</div>
                 </div>
               </div>
             ))}
-            {isTyping && !isFinished && <div className="text-[10px] opacity-30 animate-pulse font-mono tracking-widest">DIGESTING_INPUT...</div>}
+            {isTyping && !isFinished && <div className="text-[10px] opacity-30 animate-pulse font-mono tracking-widest">DUKE_PËRPUNUAR_HYRJEN...</div>}
             
             <AnimatePresence>
               {isFinished && finalVerdict && (
                 <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="p-10 brutalist-border bg-white text-black space-y-8 mt-16 mb-32 relative">
-                  <div className="absolute top-0 right-0 p-4 text-[10px] font-mono opacity-20 uppercase">Final_Verdict_Report</div>
+                  <div className="absolute top-0 right-0 p-4 text-[10px] font-mono opacity-20 uppercase">Raporti_Përfundimtar</div>
                   <h3 className="text-6xl md:text-8xl font-heading font-black uppercase italic tracking-tighter leading-none">
                     {finalVerdict.hired ? "TË PUNËSUAR ✓" : "TË REFUZUAR ✗"}
                   </h3>
                   <div className="h-2 bg-black/10 w-full" />
                   <p className="text-xl leading-relaxed font-medium italic">"{finalVerdict.feedback}"</p>
-                  <button onClick={() => window.location.reload()} className="w-full py-4 bg-black text-white text-sm font-bold uppercase tracking-widest brutalist-button">Kthehu te Fillimi</button>
+                  <button onClick={onBackToStart} className="w-full py-4 bg-black text-white text-sm font-bold uppercase tracking-widest brutalist-button">Kthehu te Fillimi</button>
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
 
           <div className="p-6 bg-white/5 border-t border-white/10 relative">
              <div className="absolute left-6 top-8 text-white/20 font-mono select-none">&gt;</div>
             <textarea 
               disabled={isFinished || isTyping}
               value={input}
-              onChange={(e) => setInput(e.target.value)}
+              onChange={(e) => {
+                if (!timerStarted && e.target.value.trim().length > 0) setTimerStarted(true);
+                setInput(e.target.value);
+              }}
               onKeyDown={(e) => {
                 if (e.key === 'Enter' && !e.shiftKey) {
                   e.preventDefault();
                   handleRun();
                 }
               }}
               placeholder={isFinished ? "SESIONI U MBYLL." : "Shkruani përgjigjen tuaj... (Enter për të dërguar)"}
               className="w-full bg-transparent border-none outline-none resize-none text-white font-mono text-sm h-32 pl-8 py-2 placeholder:opacity-10 disabled:opacity-20 transition-all"
             />
           </div>
         </div>
       </div>
     </div>
   );
 };
 
 const Chatbot: React.FC<{ career?: string }> = ({ career }) => {
   const [isOpen, setIsOpen] = useState(false);
   const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([
     { role: 'ai', text: "Mirë se vini në Busulla AI. Jam këtu për t'ju udhëhequr drejt suksesit në karrierë. Çfarë dëshironi të dini?" }
   ]);
   const [input, setInput] = useState("");
   const [isTyping, setIsTyping] = useState(false);
   const scrollRef = useRef<HTMLDivElement>(null);
 
   useEffect(() => {
     if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
   }, [messages, isTyping]);
 
   const handleSend = async () => {
     if (!input.trim() || isTyping) return;
     const userMsg = input;
     setInput("");
     setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
     setIsTyping(true);
     try {
       const resp = await getAssistantResponse(userMsg, career ? `Përdoruesi u përputh me karrierën: ${career}` : undefined);
       setMessages(prev => [...prev, { role: 'ai', text: resp }]);
     } catch (e: any) {
       const isQuota = e.message?.includes('429') || e.message?.includes('QUOTA');
       setMessages(prev => [...prev, { role: 'ai', text: isQuota ? "Kufiri i AI është arritur. Ju lutem prisni pak." : "Ndodhi një gabim në komunikim." }]);
     } finally { setIsTyping(false); }
   };
 
   return (
-    <div className="fixed bottom-8 right-8 z-[2000]">
+    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[2000]">
       <AnimatePresence>
         {isOpen && (
           <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.9 }}
-            className="absolute bottom-24 right-0 w-96 h-[550px] brutalist-border bg-black border-2 border-white flex flex-col shadow-2xl overflow-hidden">
+            className="absolute bottom-20 md:bottom-24 right-0 w-[calc(100vw-2rem)] max-w-96 h-[70vh] md:h-[550px] brutalist-border bg-black border-2 border-white flex flex-col shadow-2xl overflow-hidden">
             <div className="p-4 border-b-2 border-white/20 bg-white text-black flex justify-between items-center">
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-black rounded-full animate-ping" />
-                <span className="text-[10px] font-black uppercase tracking-widest">Busulla AI / Live</span>
+                <span className="text-[10px] font-black uppercase tracking-widest">Busulla AI / Drejtpërdrejt</span>
               </div>
               <button onClick={() => setIsOpen(false)} className="font-black text-2xl hover:scale-125 transition-transform">×</button>
             </div>
             <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 font-mono text-[11px] bg-[#050505] custom-scrollbar leading-relaxed">
               {messages.map((m, i) => (
                 <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`p-4 ${m.role === 'user' ? 'bg-white/10 text-white border-l-2 border-white' : 'bg-white text-black'} max-w-[85%] brutalist-border shadow-lg`}>
                     <p className="whitespace-pre-wrap">{m.text}</p>
                   </div>
                 </div>
               ))}
               {isTyping && <div className="text-[10px] opacity-30 animate-pulse font-mono">[AI PO SHKRUAN...]</div>}
             </div>
             <div className="p-4 border-t-2 border-white/20 bg-black flex gap-2">
               <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                 placeholder="Pyesni diçka..." className="flex-1 bg-transparent border-b border-white/50 py-3 text-xs outline-none focus:border-white font-mono placeholder:opacity-20" />
               <button onClick={handleSend} className="text-[10px] font-black uppercase bg-white text-black px-6 py-2 brutalist-button transition-all">Dërgo</button>
             </div>
           </motion.div>
         )}
       </AnimatePresence>
-      <button onClick={() => setIsOpen(!isOpen)} className="w-20 h-20 bg-white border-4 border-white flex items-center justify-center brutalist-button hover:scale-110 transition-transform shadow-2xl overflow-hidden relative group">
+      <button onClick={() => setIsOpen(!isOpen)} className="w-16 h-16 md:w-20 md:h-20 bg-white border-4 border-white flex items-center justify-center brutalist-button hover:scale-110 transition-transform shadow-2xl overflow-hidden relative group">
         <div className="w-full h-full pointer-events-none transform scale-150">
           <Scene>
             <Compass isSpinning={!isOpen} />
           </Scene>
         </div>
         <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
         {career && !isOpen && <div className="absolute -top-1 -right-1 w-4 h-4 bg-black border-2 border-white rounded-full animate-bounce z-10" />}
       </button>
     </div>
   );
 };
 
 export default App;
 
EOF
)
