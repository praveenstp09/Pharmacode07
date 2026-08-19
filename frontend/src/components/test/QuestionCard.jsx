import React from 'react';
import { Tag } from 'lucide-react';

const QuestionCard = ({
  question,
  questionNumber,
  totalQuestions,
  selectedOption,
  onSelectOption,
  isReview,
  onToggleReview,
  onClearResponse,
}) => {
  if (!question) return null;

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-7 flex flex-col h-full">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-extrabold rounded-full">
            Question {questionNumber} of {totalQuestions}
          </span>
          {question.subject && (
            <span className="flex items-center text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
              <Tag className="w-3 h-3 mr-1 text-slate-500" />
              {question.subject}
            </span>
          )}
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Marks: <span className="text-emerald-600 font-bold">+1.0</span> | Negative:{' '}
          <span className="text-rose-600 font-bold">-0.25</span>
        </div>
      </div>

      {/* Question Text */}
      <div className="py-6 text-base sm:text-lg font-medium text-slate-900 leading-relaxed">
        {question.questionText}
      </div>

      {/* Optional image if present */}
      {question.imageUrl && (
        <div className="mb-4">
          <img
            src={question.imageUrl}
            alt="Question Diagram"
            className="max-h-60 rounded-lg border border-slate-200 object-contain"
          />
        </div>
      )}

      {/* 4 MCQ Options */}
      <div className="space-y-3 my-2 flex-grow">
        {question.options.map((option, idx) => {
          const isSelected = selectedOption === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectOption(idx)}
              className={`w-full text-left p-3.5 sm:p-4 rounded-xl border-2 transition flex items-start space-x-3.5 ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-semibold shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 text-slate-800'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 border border-slate-300'
                }`}
              >
                {optionLabels[idx]}
              </div>
              <span className="text-sm sm:text-base leading-relaxed pt-0.5">{option}</span>
            </button>
          );
        })}
      </div>

      {/* Action buttons: Clear Response & Mark for Review */}
      <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={onToggleReview}
          className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold border transition ${
            isReview
              ? 'bg-purple-100 border-purple-300 text-purple-800'
              : 'border-slate-300 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {isReview ? '★ Marked for Review' : '☆ Mark for Review'}
        </button>

        {selectedOption !== -1 && selectedOption !== undefined && (
          <button
            type="button"
            onClick={onClearResponse}
            className="text-xs sm:text-sm font-medium text-rose-600 hover:text-rose-700 underline"
          >
            Clear Response
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;
