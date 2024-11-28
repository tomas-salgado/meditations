import React from 'react';

interface SourceModalProps {
  title: string;
  content: string;
  text?: string;
  onClose: () => void;
}

export const SourceModal = ({ title, content, text, onClose }: SourceModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-xl border border-gray-800" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-baseline gap-3">
            <h3 className="text-2xl font-semibold text-emerald-400">{title}</h3>
            <span className="text-sm text-gray-400">{content}</span>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-emerald-400 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="prose prose-invert max-w-none">
          {text && (
            <blockquote className="border-l-4 border-emerald-400/50 pl-4 my-4 not-italic">
              <p className="text-gray-100 whitespace-pre-wrap text-lg leading-relaxed not-italic">
                "{text}"
              </p>
            </blockquote>
          )}
        </div>
      </div>
    </div>
  );
};
