import React from 'react';

const QuestionPalette = ({
  totalQuestions,
  currentIndex,
  answers,
  reviewFlags,
  visitedFlags,
  onSelectQuestion,
  onSubmitTest,
}) => {
  // Counts
  let answeredCount = 0;
  let markedReviewCount = 0;
  let notAnsweredCount = 0;
  let notVisitedCount = 0;

  for (let i = 0; i < totalQuestions; i++) {
    const isAnswered = answers[i] !== undefined && answers[i] !== -1;
    const isReview = reviewFlags[i];
    const isVisited = visitedFlags[i];

    if (isReview) {
      markedReviewCount++;
    } else if (isAnswered) {
      answeredCount++;
    } else if (isVisited) {
      notAnsweredCount++;
    } else {
      notVisitedCount++;
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col h-full">
      <h3 className="font-bold text-slate-900 text-sm pb-3 border-b border-slate-100 uppercase tracking-wider">
        Question Palette
      </h3>

      {/* Legend Badges */}
      <div className="grid grid-cols-2 gap-2 my-3 text-xs">
        <div className="flex items-center space-x-1.5">
          <span className="w-4 h-4 rounded bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px]">
            ✓
          </span>
          <span className="text-slate-600">Answered ({answeredCount})</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-4 h-4 rounded bg-amber-500 text-white flex items-center justify-center font-bold text-[10px]">
            •
          </span>
          <span className="text-slate-600">Unanswered ({notAnsweredCount})</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-4 h-4 rounded bg-purple-600 text-white flex items-center justify-center font-bold text-[10px]">
            ★
          </span>
          <span className="text-slate-600">Review ({markedReviewCount})</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-4 h-4 rounded bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[10px]">
            -
          </span>
          <span className="text-slate-600">Not Visited ({notVisitedCount})</span>
        </div>
      </div>

      {/* 120 Questions Grid (Scrollable) */}
      <div className="flex-grow overflow-y-auto max-h-[350px] pr-1 my-2 border-t border-b border-slate-100 py-3">
        <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
          {Array.from({ length: totalQuestions }).map((_, idx) => {
            const isCurrent = currentIndex === idx;
            const isAnswered = answers[idx] !== undefined && answers[idx] !== -1;
            const isReview = reviewFlags[idx];
            const isVisited = visitedFlags[idx];

            let btnClass = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200';

            if (isReview) {
              btnClass = 'bg-purple-600 text-white border-purple-700 shadow-sm';
            } else if (isAnswered) {
              btnClass = 'bg-emerald-500 text-white border-emerald-600 shadow-sm';
            } else if (isVisited) {
              btnClass = 'bg-amber-400 text-amber-950 border-amber-500 font-semibold';
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectQuestion(idx)}
                className={`h-8 sm:h-9 rounded-lg text-xs font-bold transition flex items-center justify-center border ${btnClass} ${
                  isCurrent ? 'ring-2 ring-blue-600 ring-offset-1 scale-105' : ''
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit Test Button */}
      <div className="pt-3">
        <button
          type="button"
          onClick={onSubmitTest}
          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 text-sm"
        >
          Submit Test Paper
        </button>
      </div>
    </div>
  );
};

export default QuestionPalette;
