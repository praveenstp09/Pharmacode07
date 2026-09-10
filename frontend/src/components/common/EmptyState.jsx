import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon,
  title,
  subtitle,
  actionText,
  actionHref,
  onAction,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-3xl border border-slate-200 p-10 sm:p-12 text-center space-y-4 shadow-sm ${className}`}>
      {Icon && (
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
          <Icon className="w-8 h-8" />
        </div>
      )}
      {title && <h3 className="text-xl font-bold text-slate-900">{title}</h3>}
      {subtitle && (
        <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
      {actionText && (
        <div className="pt-2">
          {actionHref ? (
            <Link
              to={actionHref}
              className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow transition"
            >
              {actionText}
            </Link>
          ) : onAction ? (
            <button
              type="button"
              onClick={onAction}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow transition"
            >
              {actionText}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
