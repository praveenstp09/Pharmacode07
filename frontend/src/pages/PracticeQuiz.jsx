import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import api from '../services/api';

const PracticeQuiz = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userSelectedOpt, setUserSelectedOpt] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  const subjects = [
    'All',
    'Pharmacology',
    'Pharmaceutics',
    'Pharmaceutical Jurisprudence',
    'Pharmacognosy',
    'Human Anatomy & Physiology',
    'Hospital & Clinical Pharmacy',
  ];

  useEffect(() => {
    fetchPracticeQuestions();
  }, [selectedSubject]);

  const fetchPracticeQuestions = async () => {
    setLoading(true);
    setCurrentIndex(0);
    setUserSelectedOpt(null);
    setShowExplanation(false);
    setScore(0);
    setAnsweredCount(0);
    try {
      const res = await api.get(`/test-series/practice/mcqs?subject=${selectedSubject}&limit=25`);
      if (res.data.success) {
        setQuestions(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch practice MCQs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = optIdx => {
    if (userSelectedOpt !== null) return; // Prevent changing after answered

    setUserSelectedOpt(optIdx);
    setShowExplanation(true);
    setAnsweredCount(prev => prev + 1);

    const currentQ = questions[currentIndex];
    if (optIdx === currentQ.correctOptionIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserSelectedOpt(null);
      setShowExplanation(false);
    }
  };

  const currentQ = questions[currentIndex];
  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="min-h-screen py-8 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>100% Free Daily Practice</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">
          Subject-Wise Pharmacy MCQ Challenge
        </h1>
        <p className="text-blue-100 text-xs sm:text-sm">
          Get instant feedback with full rationales for every question. Test your knowledge without limits!
        </p>

        {/* Subject Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 scrollbar-none">
          {subjects.map(subj => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                selectedSubject === subj
                  ? 'bg-white text-blue-900 shadow'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-slate-500 font-semibold text-sm">Loading practice questions...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <p className="text-slate-600 font-medium">No questions found for this subject.</p>
          <button
            onClick={() => setSelectedSubject('All')}
            className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg"
          >
            Show All Subjects
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Progress & Live Score */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <span className="font-extrabold text-sm text-slate-800 bg-slate-100 px-3 py-1 rounded-full">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <div className="flex items-center space-x-3 text-xs font-bold">
              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Score: {score} / {answeredCount}
              </span>
              <button
                onClick={fetchPracticeQuestions}
                className="flex items-center space-x-1 text-slate-500 hover:text-blue-600 p-1"
                title="Reset Quiz"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart</span>
              </button>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
              {currentQ.subject}
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed pt-2">
              {currentQ.questionText}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = userSelectedOpt === idx;
              const isCorrect = idx === currentQ.correctOptionIndex;

              let optStyle = 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800';

              if (userSelectedOpt !== null) {
                if (isCorrect) {
                  optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                } else if (isSelected) {
                  optStyle = 'border-rose-500 bg-rose-50 text-rose-950 font-semibold';
                } else {
                  optStyle = 'border-slate-200 opacity-50';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleOptionClick(idx)}
                  disabled={userSelectedOpt !== null}
                  className={`w-full text-left p-4 rounded-xl border-2 transition flex items-center justify-between ${optStyle}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {optionLabels[idx]}
                    </span>
                    <span className="text-sm sm:text-base leading-relaxed">{opt}</span>
                  </div>
                  {userSelectedOpt !== null && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  )}
                  {userSelectedOpt !== null && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner */}
          {showExplanation && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2 animate-in fade-in duration-200">
              <div className="font-bold text-blue-800 text-sm flex items-center space-x-1.5">
                <HelpCircle className="w-4 h-4" />
                <span>Clinical & Pharmacological Explanation:</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-5">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Next Action / Completion */}
          {userSelectedOpt !== null && (
            <div className="pt-2 flex justify-end">
              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow transition flex items-center space-x-2 cursor-pointer"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="w-full bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-extrabold text-slate-900">Quiz Completed! 🎉</h4>
                    <p className="text-xs text-slate-600">
                      You scored <strong className="text-emerald-700">{score}</strong> out of{' '}
                      <strong>{questions.length}</strong> (
                      {Math.round((score / questions.length) * 100)}% accuracy)
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={fetchPracticeQuestions}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
                    >
                      Practice Again
                    </button>
                    <Link
                      to="/test-series"
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition inline-block"
                    >
                      Try Full Mock Papers →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PracticeQuiz;
