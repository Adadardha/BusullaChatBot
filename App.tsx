import React, { useState, useEffect, useRef } from 'react';
import { AppState, QuizAnswer, PredictionResult } from './types';
import { TRANSLATIONS, QUIZ_QUESTIONS, INTERVIEW_QUESTIONS } from './i18n';
import { predictCareer, getAssistantResponse, evaluateFinalInterview } from './services/gemini';
import { motion, AnimatePresence } from 'framer-motion';
import { ASCIIHeader, ASCIIGrid, ASCIILoader } from './Decorations';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppState>(AppState.LANDING);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [customValue, setCustomValue] = useState("");
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Interview state
  const [interviewMessages, setInterviewMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [userInput, setUserInput] = useState("");
  const [currentInterviewQuestion, setCurrentInterviewQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes = 600 seconds
  const [timerStarted, setTimerStarted] = useState(false);
  const [interviewScore, setInterviewScore] = useState(0);

  const startQuiz = () => setCurrentStep(AppState.QUIZ);

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
    } catch (error) {
      console.error(error);
      alert("Ndodhi një gabim. Ju lutem provoni përsëri.");
      resetToStart();
    } finally {
      setIsLoading(false);
    }
  };

  const startInterview = () => {
    if (!prediction) return;
    
    setCurrentStep(AppState.INTERVIEW);
    setInterviewMessages([]);
    setCurrentInterviewQuestion(0);
    setTimeRemaining(600); // Reset to 10 minutes
    setTimerStarted(false);
    setInterviewScore(0);
    setUserInput("");

    // Load first question based on career
    const careerQuestions = INTERVIEW_QUESTIONS[prediction.primaryCareer] || INTERVIEW_QUESTIONS["Zhvillues Software"];
    const firstQuestion = careerQuestions[0];
    
    setInterviewMessages([
      { role: "assistant", content: firstQuestion }
    ]);
  };

  // Timer effect for interview
  useEffect(() => {
    if (currentStep === AppState.INTERVIEW && timerStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            finishInterview();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [currentStep, timerStarted, timeRemaining]);

  const handleInterviewInput = async () => {
    if (!userInput.trim() || !prediction) return;

    // Start timer on first input
    if (!timerStarted) {
      setTimerStarted(true);
    }

    const newMessages = [
      ...interviewMessages,
      { role: "user", content: userInput }
    ];
    setInterviewMessages(newMessages);
    setUserInput("");

    // Get AI response for current question
    const careerQuestions = INTERVIEW_QUESTIONS[prediction.primaryCareer] || INTERVIEW_QUESTIONS["Zhvillues Software"];
    
    // Check if there are more questions
    if (currentInterviewQuestion < careerQuestions.length - 1) {
      const nextQuestion = careerQuestions[currentInterviewQuestion + 1];
      setInterviewMessages([...newMessages, { role: "assistant", content: nextQuestion }]);
      setCurrentInterviewQuestion(prev => prev + 1);
      
      // Calculate score (simple: 10 points per answer)
      setInterviewScore(prev => prev + 10);
    } else {
      // Last question - finish interview
      finishInterview();
    }
  };

  const finishInterview = () => {
    setTimerStarted(false);
    const finalScore = Math.min(100, interviewScore + 10);
    setInterviewScore(finalScore);
    
    setInterviewMessages(prev => [
      ...prev,
      { 
        role: "assistant", 
        content: `Intervista përfundoi! Rezultati juaj: ${finalScore}/100. ${
          finalScore >= 70 ? "Shumë mirë!" : finalScore >= 50 ? "Performancë e mirë!" : "Vazhdoni të praktikoni!"
        }`
      }
    ]);
  };

  const resetToStart = () => {
    setCurrentStep(AppState.LANDING);
    setQuizAnswers([]);
    setCurrentQuestionIndex(0);
    setCustomValue("");
    setPrediction(null);
    setIsLoading(false);
    setInterviewMessages([]);
    setUserInput("");
    setCurrentInterviewQuestion(0);
    setTimeRemaining(600);
    setTimerStarted(false);
    setInterviewScore(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen selection:bg-white selection:text-black overflow-x-hidden bg-[#050505]">
      <ASCIIGrid />
      
      <nav className="fixed top-0 left-0 w-full p-4 md:p-6 flex justify-between items-center z-50 backdrop-blur-sm bg-black/50 border-b border-white/5">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-6 h-6 md:w-8 md:h-8 border-2 border-white rotate-45 flex items-center justify-center bg-white text-black font-bold">
            <span className="text-[10px] md:text-[12px] -rotate-45">B</span>
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-bold text-base md:text-lg tracking-tighter uppercase leading-none">Busulla</span>
            <span className="text-[8px] md:text-[10px] font-mono opacity-50 uppercase tracking-[0.3em]">EDICION_PRO</span>
          </div>
        </div>
        <button 
          onClick={resetToStart} 
          className="text-[10px] md:text-xs font-bold uppercase tracking-widest border border-white/20 px-3 py-2 md:px-4 hover:bg-white hover:text-black transition-all"
        >
          {currentStep !== AppState.LANDING ? TRANSLATIONS.common.restart : "SQ-AL"}
        </button>
      </nav>

      <main className="relative flex flex-col items-center justify-center min-h-screen px-4 md:px-6 lg:px-8 pt-20 md:pt-24">
        <AnimatePresence mode="wait">
          {currentStep === AppState.LANDING && (
            <motion.div 
              key="landing" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="max-w-4xl w-full text-center space-y-8 md:space-y-12"
            >
              <ASCIIHeader />
              <div className="space-y-4 md:space-y-6">
                <h1 className="text-4xl md:text-7xl lg:text-9xl font-heading font-black uppercase leading-[0.85] tracking-tighter">
                  {TRANSLATIONS.landing.title.split(' ').map((word, j) => (
                    <span key={j} className="block hover:italic">{word}</span>
                  ))}
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl text-gray-400 max-w-xl mx-auto italic border-l-2 border-white/20 pl-4 md:pl-6">
                  {TRANSLATIONS.landing.subtitle}
                </p>
              </div>
              <button 
                onClick={startQuiz} 
                className="px-8 py-4 md:px-16 md:py-8 bg-white text-black font-heading font-black text-xl md:text-3xl uppercase brutalist-button transition-all hover:scale-105"
              >
                {TRANSLATIONS.common.start} →
              </button>
            </motion.div>
          )}

          {currentStep === AppState.QUIZ && (
            <motion.div 
              key="quiz" 
              initial={{ x: 100, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              className="w-full max-w-2xl md:max-w-4xl"
            >
              <div className="brutalist-border bg-black p-6 md:p-8 lg:p-12">
                <div className="mb-6 md:mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs md:text-sm uppercase font-mono">{TRANSLATIONS.quiz.progress}</span>
                    <span className="text-xs md:text-sm font-bold">{currentQuestionIndex + 1}/{QUIZ_QUESTIONS.length}</span>
                  </div>
                  <div className="h-1 md:h-2 bg-white/10 brutalist-border overflow-hidden">
                    <motion.div 
                      className="h-full bg-white" 
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                <h2 className="text-2xl md:text-4xl font-heading font-bold mb-6 md:mb-8 leading-tight">
                  {QUIZ_QUESTIONS[currentQuestionIndex].text}
                </h2>

                <div className="space-y-3 md:space-y-4">
                  {QUIZ_QUESTIONS[currentQuestionIndex].options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(option)}
                      className="w-full text-left p-4 md:p-6 brutalist-border hover:bg-white hover:text-black transition-all text-sm md:text-base"
                    >
                      <span className="font-mono text-xs mr-3 md:mr-4 opacity-50">[{String.fromCharCode(65 + i)}]</span>
                      {option}
                    </button>
                  ))}
                  
                  <div className="pt-4 md:pt-6 border-t border-white/10">
                    <input
                      type="text"
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                      placeholder={TRANSLATIONS.common.customPlaceholder}
                      className="w-full bg-transparent border-2 border-white/20 p-4 md:p-6 mb-3 md:mb-4 focus:border-white outline-none text-sm md:text-base"
                    />
                    <button
                      onClick={() => customValue.trim() && handleAnswer(customValue, true)}
                      disabled={!customValue.trim()}
                      className="w-full brutalist-border p-4 md:p-6 hover:bg-white hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm md:text-base"
                    >
                      {TRANSLATIONS.common.other}
                    </button>
                  </div>
                </div>

                {currentQuestionIndex > 0 && (
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    className="mt-6 md:mt-8 text-xs md:text-sm uppercase tracking-wider opacity-50 hover:opacity-100"
                  >
                    ← {TRANSLATIONS.common.back}
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {currentStep === AppState.ANALYZING && (
            <motion.div 
              key="analyzing" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-center space-y-6 md:space-y-8 max-w-2xl w-full"
            >
              <ASCIILoader />
              <h2 className="text-3xl md:text-5xl font-heading font-bold">{TRANSLATIONS.analyzing.title}</h2>
              <p className="text-lg md:text-xl text-gray-400 italic">{TRANSLATIONS.analyzing.subtitle}</p>
            </motion.div>
          )}

          {currentStep === AppState.RESULTS && prediction && (
            <motion.div 
              key="results" 
              initial={{ opacity: 0, y: 50 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="w-full max-w-2xl md:max-w-4xl space-y-6 md:space-y-8"
            >
              <div className="brutalist-border bg-black p-6 md:p-8 lg:p-12">
                <h2 className="text-2xl md:text-4xl font-heading font-bold mb-6 md:mb-8">{TRANSLATIONS.results.title}</h2>
                
                <div className="mb-8 md:mb-12 p-6 md:p-8 brutalist-border bg-white/5">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 md:mb-6 gap-4">
                    <div>
                      <p className="text-xs md:text-sm uppercase tracking-wider opacity-50 mb-2">{TRANSLATIONS.results.match}</p>
                      <h3 className="text-3xl md:text-5xl font-heading font-black">{prediction.primaryCareer}</h3>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-xs md:text-sm uppercase tracking-wider opacity-50 mb-2">{TRANSLATIONS.results.confidence}</p>
                      <p className="text-3xl md:text-5xl font-mono font-bold">{(prediction.confidence * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                  <p className="text-base md:text-lg text-gray-300 leading-relaxed">{prediction.description}</p>
                </div>

                {prediction.alternatives && prediction.alternatives.length > 0 && (
                  <div className="mb-8 md:mb-12">
                    <h4 className="text-lg md:text-xl font-bold mb-4 md:mb-6 uppercase tracking-wider">{TRANSLATIONS.results.alternatives}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      {prediction.alternatives.map((alt, i) => (
                        <div key={i} className="p-4 md:p-6 brutalist-border bg-white/5">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-bold text-base md:text-lg">{alt.career}</h5>
                            <span className="text-xs md:text-sm font-mono opacity-70">{(alt.confidence * 100).toFixed(0)}%</span>
                          </div>
                          <p className="text-xs md:text-sm text-gray-400">{alt.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {prediction.learningPath && (
                  <div className="mb-8 md:mb-12">
                    <h4 className="text-lg md:text-xl font-bold mb-4 md:mb-6 uppercase tracking-wider">{TRANSLATIONS.results.learning}</h4>
                    <ul className="space-y-3 md:space-y-4">
                      {prediction.learningPath.map((step, i) => (
                        <li key={i} className="flex items-start gap-3 md:gap-4">
                          <span className="font-mono text-xs md:text-sm mt-1 opacity-50">{i + 1}.</span>
                          <span className="text-sm md:text-base">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={startInterview}
                  className="w-full p-6 md:p-8 bg-white text-black font-heading font-bold text-lg md:text-2xl uppercase brutalist-button hover:scale-[1.02] transition-all"
                >
                  {TRANSLATIONS.results.practice} →
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === AppState.INTERVIEW && (
            <motion.div 
              key="interview" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="w-full max-w-2xl md:max-w-4xl"
            >
              <div className="brutalist-border bg-black p-6 md:p-8 lg:p-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
                  <div>
                    <h2 className="text-2xl md:text-4xl font-heading font-bold">{TRANSLATIONS.interview.title}</h2>
                    <p className="text-sm md:text-base text-gray-400 mt-2">{TRANSLATIONS.interview.subtitle}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-xs uppercase tracking-wider opacity-50 mb-1">{TRANSLATIONS.interview.timeRemaining}</p>
                    <p className={`text-2xl md:text-3xl font-mono font-bold ${timeRemaining < 60 ? 'text-red-500' : ''}`}>
                      {formatTime(timeRemaining)}
                    </p>
                    {interviewScore > 0 && (
                      <p className="text-xs md:text-sm mt-2">{TRANSLATIONS.interview.score}: {interviewScore}/100</p>
                    )}
                  </div>
                </div>

                <div className="mb-6 md:mb-8 max-h-[50vh] overflow-y-auto space-y-4 md:space-y-6 pr-2">
                  {interviewMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-4 md:p-6 brutalist-border ${
                        msg.role === 'user' ? 'bg-white/10 ml-0 md:ml-12' : 'bg-white/5 mr-0 md:mr-12'
                      }`}
                    >
                      <p className="text-xs uppercase tracking-wider opacity-50 mb-2">
                        {msg.role === 'user' ? 'Ju' : 'Intervistues'}
                      </p>
                      <p className="text-sm md:text-base leading-relaxed">{msg.content}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 md:space-y-6">
                  <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleInterviewInput();
                      }
                    }}
                    placeholder={TRANSLATIONS.interview.chatPlaceholder}
                    className="w-full bg-transparent border-2 border-white/20 p-4 md:p-6 min-h-[120px] md:min-h-[150px] focus:border-white outline-none resize-none text-sm md:text-base"
                    disabled={timeRemaining === 0}
                  />
                  <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                    <button
                      onClick={handleInterviewInput}
                      disabled={!userInput.trim() || timeRemaining === 0}
                      className="flex-1 brutalist-border p-4 md:p-6 hover:bg-white hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm md:text-base font-bold uppercase"
                    >
                      {TRANSLATIONS.common.send}
                    </button>
                    <button
                      onClick={resetToStart}
                      className="brutalist-border p-4 md:p-6 hover:bg-red-500 hover:text-white transition-all text-sm md:text-base font-bold uppercase"
                    >
                      {TRANSLATIONS.common.returnToStart}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style>{`
        .brutalist-border {
          border: 3px solid white;
          box-shadow: 6px 6px 0 rgba(255,255,255,0.1);
        }
        .brutalist-button:hover {
          box-shadow: 8px 8px 0 rgba(255,255,255,0.2);
        }
        .font-heading {
          font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        @media (max-width: 768px) {
          .brutalist-border {
            border: 2px solid white;
            box-shadow: 4px 4px 0 rgba(255,255,255,0.1);
          }
        }
      `}</style>
    </div>
  );
};

export default App;
