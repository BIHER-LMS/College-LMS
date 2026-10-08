import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'info',
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant p-10 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 bg-surface-container flex items-center justify-center text-on-surface-variant mb-4">
        <span className="material-symbols-outlined text-[1.75rem]">{icon}</span>
      </div>
      <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">{title}</h4>
      {description && (
        <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mt-1.5 leading-relaxed">
          {description}
        </p>
      )}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-primary-container text-on-primary text-label-md font-label-md hover:bg-on-background transition-colors"
          type="button"
        >
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
