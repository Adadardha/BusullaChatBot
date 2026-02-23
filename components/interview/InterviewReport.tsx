import React from 'react';
import { motion } from 'framer-motion';
import { InterviewReport as InterviewReportType } from '../../types';
import { TRANSLATIONS, INTERVIEW_MODE_INFO } from '../../i18n';

interface InterviewReportProps {
  report: InterviewReportType;
  onNewInterview: () => void;
  onBackToResults: () => void;
}

const InterviewReport: React.FC<InterviewReportProps> = ({
  report,
  onNewInterview,
  onBackToResults,
}) => {
  const verdictColors = {
    hired: 'bg-green-500/20 text-green-400 border-green-400',
    consider: 'bg-yellow-500/20 text-yellow-400 border-yellow-400',
    rejected: 'bg-red-500/20 text-red-400 border-red-400',
  };

  const verdictLabels = {
    hired: TRANSLATIONS.interviewReport.verdicts.hired,
    consider: TRANSLATIONS.interviewReport.verdicts.consider,
    rejected: TRANSLATIONS.interviewReport.verdicts.rejected,
  };

  const formatDuration = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins} ${TRANSLATIONS.interviewReport.minutes} ${secs}s`;
  };

  const categoryLabels = {
    technical: TRANSLATIONS.interviewReport.categories.technical,
    communication: TRANSLATIONS.interviewReport.categories.communication,
    problemSolving: TRANSLATIONS.interviewReport.categories.problemSolving,
    cultureFit: TRANSLATIONS.interviewReport.categories.cultureFit,
  };

  const getCategoryColor = (score: number) => {
    if (score >= 70) return 'bg-green-400';
    if (score >= 50) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  const exportReport = () => {
    const reportText = `
BUSULLA DIGJITALE - RAPORT I INTERVISTËS
========================================

Pozicioni: ${report.career}
Mënyra: ${INTERVIEW_MODE_INFO[report.mode]?.name || report.mode}
Kohëzgjatja: ${formatDuration(report.duration)}

REZULTATI I PËRGJITHSHËM: ${report.overallScore}/100
VENDIMI: ${verdictLabels[report.verdict]}

PËRMBLEDHJE:
${report.summary}

REZULTATET SIPAS KATEGORIVE:
- Aftësi Teknike: ${report.categoryScores.technical}%
- Komunikim: ${report.categoryScores.communication}%
- Zgjidhje Problemesh: ${report.categoryScores.problemSolving}%
- Përshtatje Kulturore: ${report.categoryScores.cultureFit}%

${report.answersReview.length > 0 ? `
RISHIKIMI I PËRGJIGJEEVE:
${report.answersReview.map((a, i) => `
${i + 1}. ${a.question}
   Përgjigjja: ${a.answer.substring(0, 200)}...
   Rezultati: ${a.score}/100
   Feedback: ${a.feedback}
`).join('\n')}
` : ''}

REKOMANDIME:
${report.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

TEMA PËR PËRMIRËSIM:
${report.weakTopics.map((t, i) => `${i + 1}. ${t}`).join('\n')}

SUGJERIME PËR PRAKTIKË:
${report.practiceSuggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}

---
Gjeneruar nga Busulla Digjitale
Data: ${new Date().toLocaleDateString('sq-AL')}
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-report-${report.sessionId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      key="interview-report"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-4xl"
    >
      <div className="brutalist-border bg-black p-6 md:p-8 lg:p-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-4xl font-heading font-bold">
              {TRANSLATIONS.interviewReport.title}
            </h2>
            <p className="text-sm text-gray-400 mt-1">{report.career}</p>
          </div>
          <div
            className={`px-4 py-2 border-2 ${verdictColors[report.verdict]} font-bold text-lg uppercase`}
          >
            {verdictLabels[report.verdict]}
          </div>
        </div>

        {/* Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Overall Score */}
          <div className="brutalist-border bg-white/5 p-6 text-center">
            <p className="text-xs uppercase tracking-wider opacity-50 mb-2">
              {TRANSLATIONS.interviewReport.overallScore}
            </p>
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                  fill="none"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke={report.overallScore >= 70 ? '#4ade80' : report.overallScore >= 50 ? '#facc15' : '#f87171'}
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: '0 352' }}
                  animate={{ strokeDasharray: `${(report.overallScore / 100) * 352} 352` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold">{report.overallScore}</span>
              </div>
            </div>
          </div>

          {/* Duration & Mode */}
          <div className="brutalist-border bg-white/5 p-6">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wider opacity-50 mb-2">
                {TRANSLATIONS.interviewReport.duration}
              </p>
              <p className="text-xl font-mono">
                {formatDuration(report.duration)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider opacity-50 mb-2">
                Mënyra
              </p>
              <p className="text-xl">
                {INTERVIEW_MODE_INFO[report.mode]?.icon}{' '}
                {INTERVIEW_MODE_INFO[report.mode]?.name || report.mode}
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-8 p-6 brutalist-border bg-white/5">
          <h3 className="text-lg font-bold mb-3 uppercase tracking-wider">
            {TRANSLATIONS.interviewReport.summary}
          </h3>
          <p className="text-gray-300 leading-relaxed">{report.summary}</p>
        </div>

        {/* Category Scores */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 uppercase tracking-wider">
            {TRANSLATIONS.interviewReport.categoryScores}
          </h3>
          <div className="space-y-4">
            {Object.entries(report.categoryScores).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">
                    {categoryLabels[key as keyof typeof categoryLabels]}
                  </span>
                  <span className="text-sm font-mono">{value}%</span>
                </div>
                <div className="h-3 bg-white/10 overflow-hidden brutalist-border">
                  <motion.div
                    className={`h-full ${getCategoryColor(value)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Answers Review */}
        {report.answersReview.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4 uppercase tracking-wider">
              {TRANSLATIONS.interviewReport.answersReview}
            </h3>
            <div className="space-y-4">
              {report.answersReview.map((answer, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 brutalist-border bg-white/5"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs uppercase tracking-wider opacity-50">
                      Pyetja {i + 1}
                    </p>
                    <span
                      className={`text-sm font-bold ${
                        answer.score >= 70
                          ? 'text-green-400'
                          : answer.score >= 50
                            ? 'text-yellow-400'
                            : 'text-red-400'
                      }`}
                    >
                      {answer.score}/100
                    </span>
                  </div>
                  <p className="font-medium mb-2">{answer.question}</p>
                  <p className="text-sm text-gray-400 mb-3">
                    <span className="opacity-50">Përgjigjja: </span>
                    {answer.answer.substring(0, 150)}
                    {answer.answer.length > 150 ? '...' : ''}
                  </p>
                  <p className="text-xs text-gray-500">{answer.feedback}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations & Weak Topics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Recommendations */}
          <div className="p-6 brutalist-border bg-white/5">
            <h3 className="text-lg font-bold mb-4 uppercase tracking-wider">
              {TRANSLATIONS.interviewReport.recommendations}
            </h3>
            <ul className="space-y-2">
              {report.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weak Topics */}
          <div className="p-6 brutalist-border bg-white/5">
            <h3 className="text-lg font-bold mb-4 uppercase tracking-wider">
              {TRANSLATIONS.interviewReport.weakTopics}
            </h3>
            {report.weakTopics.length > 0 ? (
              <ul className="space-y-2">
                {report.weakTopics.map((topic, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-yellow-400">↑</span>
                    <span className="text-sm">{topic}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">
                Asnjë temë specifike për përmirësim.
              </p>
            )}
          </div>
        </div>

        {/* Practice Suggestions */}
        {report.practiceSuggestions.length > 0 && (
          <div className="mb-8 p-6 brutalist-border bg-white/5">
            <h3 className="text-lg font-bold mb-4 uppercase tracking-wider">
              {TRANSLATIONS.interviewReport.practiceSuggestions}
            </h3>
            <div className="flex flex-wrap gap-2">
              {report.practiceSuggestions.map((suggestion, i) => (
                <span
                  key={i}
                  className="px-3 py-1 border border-white/20 text-sm"
                >
                  {suggestion}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-3">
          <button
            onClick={onNewInterview}
            className="flex-1 p-4 md:p-6 bg-white text-black font-heading font-bold text-lg uppercase brutalist-button hover:scale-[1.02] transition-all"
          >
            {TRANSLATIONS.interviewReport.newInterview} →
          </button>
          <button
            onClick={exportReport}
            className="brutalist-border p-4 md:p-6 hover:bg-white/10 transition-all font-bold uppercase"
          >
            {TRANSLATIONS.interviewReport.exportReport}
          </button>
          <button
            onClick={onBackToResults}
            className="brutalist-border p-4 md:p-6 hover:bg-white/10 transition-all"
          >
            {TRANSLATIONS.interviewReport.backToResults}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default InterviewReport;
