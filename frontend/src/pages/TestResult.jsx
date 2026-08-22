import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  LayoutDashboard,
  HelpCircle,
  Check,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';

const TestResult = () => {
  const { attemptId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, incorrect, correct, unattempted

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await api.get(`/attempts/${attemptId}`);
        if (res.data.success) {
          setData(res.data.data);
          // If score is good, trigger confetti!
          if (res.data.data.percentage >= 60) {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            });
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load test results');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 font-semibold">Calculating your rank and solutions...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Result Not Found</h2>
        <p className="text-slate-500 text-sm">{error || 'Could not load your attempt.'}</p>
        <Link to="/dashboard" className="inline-block px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const {
    testSeriesTitle,
    testSeriesSlug,
    testPaperTitle,
    paperId,
    score,
    totalMarks,
    correctCount,
    incorrectCount,
    unattemptedCount,
    percentage,
    timeSpentSeconds,
    questions,
  } = data;

  const filteredQuestions = questions.filter(q => {
    if (filter === 'correct') return q.isCorrect;
    if (filter === 'incorrect') return !q.isCorrect && q.selectedOption !== -1;
    if (filter === 'unattempted') return q.selectedOption === -1;
    return true;
  });

  const minutes = Math.floor(timeSpentSeconds / 60);
  const seconds = timeSpentSeconds % 60;
  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="min-h-screen py-8 max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
      {/* 1. TOP RESULT SUMMARY CARD */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-2xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <span className="bg-blue-500/20 text-blue-300 font-bold text-xs px-3 py-1 rounded-full border border-blue-400/30">
              Exam Performance Report
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {testPaperTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">{testSeriesTitle}</p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to={`/attempt/${paperId}`}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reattempt Test</span>
            </Link>
            <Link
              to="/dashboard"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl transition flex items-center space-x-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Big Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-5 rounded-2xl">
            <div className="text-xs text-slate-300 font-semibold">Net Marks Scored</div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
              {score} <span className="text-sm font-normal text-slate-300">/ {totalMarks}</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-5 rounded-2xl">
            <div className="text-xs text-slate-300 font-semibold">Percentage Score</div>
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 mt-1">
              {percentage}%
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-5 rounded-2xl">
            <div className="text-xs text-slate-300 font-semibold">Accuracy</div>
            <div className="text-3xl sm:text-4xl font-extrabold text-blue-400 mt-1">
              {correctCount + incorrectCount > 0
                ? Math.round((correctCount / (correctCount + incorrectCount)) * 100)
                : 0}
              %
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-5 rounded-2xl">
            <div className="text-xs text-slate-300 font-semibold">Total Time Taken</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-200 mt-1 font-mono">
              {minutes}m {seconds}s
            </div>
          </div>
        </div>

        {/* Small Breakdown Badges */}
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <div className="bg-emerald-950/60 border border-emerald-700/50 p-3 rounded-xl">
            <div className="text-xl font-bold text-emerald-400">{correctCount}</div>
            <div className="text-slate-300">Correct Answers</div>
          </div>
          <div className="bg-rose-950/60 border border-rose-700/50 p-3 rounded-xl">
            <div className="text-xl font-bold text-rose-400">{incorrectCount}</div>
            <div className="text-slate-300">Incorrect (-0.25 ea)</div>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl">
            <div className="text-xl font-bold text-slate-300">{unattemptedCount}</div>
            <div className="text-slate-400">Unattempted</div>
          </div>
        </div>
      </div>

      {/* 2. QUESTION-WISE DETAILED ANALYSIS */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Detailed Question-by-Question Solution
          </h2>

          {/* Filter tabs */}
          <div className="flex items-center space-x-1.5 bg-slate-200/80 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === 'all' ? 'bg-white text-slate-900 shadow' : 'text-slate-600'
              }`}
            >
              All ({questions.length})
            </button>
            <button
              onClick={() => setFilter('incorrect')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === 'incorrect' ? 'bg-rose-600 text-white shadow' : 'text-slate-600'
              }`}
            >
              Incorrect ({incorrectCount})
            </button>
            <button
              onClick={() => setFilter('correct')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === 'correct' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600'
              }`}
            >
              Correct ({correctCount})
            </button>
            <button
              onClick={() => setFilter('unattempted')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === 'unattempted' ? 'bg-slate-700 text-white shadow' : 'text-slate-600'
              }`}
            >
              Skipped ({unattemptedCount})
            </button>
          </div>
        </div>

        {/* Questions list */}
        <div className="space-y-4">
          {filteredQuestions.map(q => {
            const isUserCorrect = q.isCorrect;
            const isUnattempted = q.selectedOption === -1;

            return (
              <div
                key={q.questionNumber}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
                      Q.{q.questionNumber}
                    </span>
                    {q.subject && (
                      <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {q.subject}
                      </span>
                    )}
                  </div>

                  <div>
                    {isUnattempted ? (
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                        Not Attempted
                      </span>
                    ) : isUserCorrect ? (
                      <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                        <Check className="w-3.5 h-3.5" />
                        <span>Correct (+1.0)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                        <X className="w-3.5 h-3.5" />
                        <span>Incorrect (-0.25)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Question text */}
                <p className="text-base font-medium text-slate-900 leading-relaxed">
                  {q.questionText}
                </p>

                {/* 4 Options breakdown */}
                <div className="space-y-2 text-sm">
                  {q.options.map((opt, optIdx) => {
                    const isCorrectOpt = optIdx === q.correctOptionIndex;
                    const isSelectedByUser = optIdx === q.selectedOption;

                    let optClass = 'border-slate-200 bg-white text-slate-700';

                    if (isCorrectOpt) {
                      optClass = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                    } else if (isSelectedByUser && !isUserCorrect) {
                      optClass = 'border-rose-400 bg-rose-50 text-rose-950 line-through';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-xl border flex items-center justify-between ${optClass}`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {optionLabels[optIdx]}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isCorrectOpt && (
                          <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wide">
                            ✓ Correct Answer
                          </span>
                        )}
                        {isSelectedByUser && !isCorrectOpt && (
                          <span className="text-xs font-bold text-rose-600 uppercase tracking-wide">
                            ✗ Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Box */}
                {q.explanation && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5 text-xs sm:text-sm text-slate-700">
                    <div className="font-bold text-blue-700 flex items-center space-x-1.5">
                      <HelpCircle className="w-4 h-4" />
                      <span>Detailed Solution & Clinical Explanation:</span>
                    </div>
                    <p className="leading-relaxed pl-5">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TestResult;
