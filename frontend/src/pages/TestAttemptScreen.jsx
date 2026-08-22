import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import QuizTimer from '../components/test/QuizTimer';
import QuestionCard from '../components/test/QuestionCard';
import QuestionPalette from '../components/test/QuestionPalette';

const TestAttemptScreen = () => {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // State arrays for questions
  const [answers, setAnswers] = useState([]);
  const [reviewFlags, setReviewFlags] = useState([]);
  const [visitedFlags, setVisitedFlags] = useState([]);
  const [questionTimes, setQuestionTimes] = useState([]);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const questionStartTimeRef = React.useRef(Date.now());

  const recordTimeForCurrentQuestion = () => {
    const now = Date.now();
    const elapsed = Math.max(1, Math.round((now - questionStartTimeRef.current) / 1000));
    questionStartTimeRef.current = now;
    setQuestionTimes(prev => {
      const updated = [...prev];
      if (currentIndex < updated.length) {
        updated[currentIndex] = (updated[currentIndex] || 0) + elapsed;
      }
      return updated;
    });
    setTotalTimeSpent(prev => prev + elapsed);
    return elapsed;
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/attempt/${paperId}`);
      return;
    }

    const fetchPaper = async () => {
      try {
        const res = await api.get(`/test-series/paper/${paperId}`);
        if (res.data.success) {
          const paperData = res.data.data;
          setPaper(paperData);
          const qCount = paperData.questions.length;
          setAnswers(new Array(qCount).fill(-1));
          setReviewFlags(new Array(qCount).fill(false));
          const initialVisited = new Array(qCount).fill(false);
          initialVisited[0] = true;
          setVisitedFlags(initialVisited);
          setQuestionTimes(new Array(qCount).fill(0));
          questionStartTimeRef.current = Date.now();
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load test paper. Make sure you have unlocked it.');
      } finally {
        setLoading(false);
      }
    };

    fetchPaper();
  }, [paperId, isAuthenticated]);

  // Prevent accidental page leave
  useEffect(() => {
    const handleBeforeUnload = e => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleSelectOption = optionIndex => {
    setAnswers(prev => {
      const updated = [...prev];
      updated[currentIndex] = optionIndex;
      return updated;
    });
  };

  const handleClearResponse = () => {
    setAnswers(prev => {
      const updated = [...prev];
      updated[currentIndex] = -1;
      return updated;
    });
  };

  const handleToggleReview = () => {
    setReviewFlags(prev => {
      const updated = [...prev];
      updated[currentIndex] = !updated[currentIndex];
      return updated;
    });
  };

  const handleSelectQuestion = index => {
    recordTimeForCurrentQuestion();
    setCurrentIndex(index);
    setVisitedFlags(prev => {
      const updated = [...prev];
      updated[index] = true;
      return updated;
    });
  };

  const handleNext = () => {
    if (currentIndex < paper.questions.length - 1) {
      handleSelectQuestion(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      handleSelectQuestion(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    recordTimeForCurrentQuestion();
    setSubmitting(true);
    try {
      const submissionAnswers = answers.map((opt, idx) => ({
        selectedOption: opt,
        timeSpentSeconds: questionTimes[idx] || 0,
      }));

      const res = await api.post('/attempts/submit', {
        paperId: paper._id,
        answers: submissionAnswers,
        timeSpentSeconds: totalTimeSpent,
      });

      if (res.data.success) {
        navigate(`/result/${res.data.attemptId}`);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error submitting test. Please try again.', 'error');
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <h2 className="text-lg font-bold">Preparing Your 120 MCQ Examination Paper...</h2>
        <p className="text-slate-400 text-sm">Please do not refresh the page.</p>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
          <p className="text-sm text-slate-600 leading-relaxed">{error}</p>
          <button
            onClick={() => navigate('/test-series')}
            className="px-6 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl shadow hover:bg-blue-700"
          >
            Explore & Unlock Model Papers
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = paper.questions[currentIndex];
  const totalQuestions = paper.questions.length;
  const answeredCount = answers.filter(a => a !== -1 && a !== undefined).length;
  const unattemptedCount = totalQuestions - answeredCount;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Test Exam Top Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 px-4 sm:px-6 py-3 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Paper Name */}
          <div className="flex items-center space-x-3 truncate">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              CBT
            </div>
            <div className="truncate">
              <h1 className="font-bold text-sm sm:text-base text-white truncate">
                {paper.title}
              </h1>
              <p className="text-[11px] text-slate-400 truncate">
                {paper.testSeriesTitle} | Total Marks: {paper.totalMarks}
              </p>
            </div>
          </div>

          {/* Timer & Submit Trigger */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <QuizTimer
              initialMinutes={paper.durationMinutes}
              onTimeUp={handleSubmit}
              onTick={secLeft => setTotalTimeSpent(paper.durationMinutes * 60 - secLeft)}
            />
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-lg shadow transition"
            >
              Submit Paper
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area: Left Question Card + Right Palette */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Left Side: Question Pane (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="flex-grow">
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              totalQuestions={totalQuestions}
              selectedOption={answers[currentIndex]}
              onSelectOption={handleSelectOption}
              isReview={reviewFlags[currentIndex]}
              onToggleReview={handleToggleReview}
              onClearResponse={handleClearResponse}
            />
          </div>

          {/* Navigation Controls Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl font-bold text-sm transition ${
                currentIndex === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-xs font-semibold text-slate-500">
              Q {currentIndex + 1} of {totalQuestions}
            </span>

            {currentIndex < totalQuestions - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center space-x-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow transition"
              >
                <span>Save & Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="flex items-center space-x-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow transition"
              >
                <span>Finish & Submit</span>
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Question Palette (4 cols) */}
        <div className="lg:col-span-4">
          <QuestionPalette
            totalQuestions={totalQuestions}
            currentIndex={currentIndex}
            answers={answers}
            reviewFlags={reviewFlags}
            visitedFlags={visitedFlags}
            onSelectQuestion={handleSelectQuestion}
            onSubmitTest={() => setShowSubmitModal(true)}
          />
        </div>
      </main>

      {/* Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-150">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Ready to Submit Exam Paper?
              </h3>
              <p className="text-xs text-slate-500">
                Review your response summary before final evaluation.
              </p>
            </div>

            {/* Stats Breakdown */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                <div className="text-2xl font-extrabold text-emerald-700">{answeredCount}</div>
                <div className="text-[11px] font-semibold text-emerald-800">Answered</div>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
                <div className="text-2xl font-extrabold text-amber-700">{unattemptedCount}</div>
                <div className="text-[11px] font-semibold text-amber-800">Unanswered</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 p-3 rounded-xl">
                <div className="text-2xl font-extrabold text-purple-700">
                  {reviewFlags.filter(Boolean).length}
                </div>
                <div className="text-[11px] font-semibold text-purple-800">Marked Review</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                disabled={submitting}
                className="w-1/2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition"
              >
                Back to Test
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-1/2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-sm shadow-md transition flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <span>Evaluating...</span>
                ) : (
                  <span>Yes, Submit</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestAttemptScreen;
