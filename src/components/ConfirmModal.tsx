import React from 'react';
import { AlertTriangle, Trash2, RefreshCw, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      bg: 'bg-rose-50',
      border: 'border-rose-100',
      text: 'text-rose-700',
      iconBg: 'bg-rose-100',
      iconText: 'text-rose-600',
      btnBg: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-200',
      icon: Trash2,
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      text: 'text-amber-700',
      iconBg: 'bg-amber-100',
      iconText: 'text-amber-600',
      btnBg: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-200',
      icon: AlertTriangle,
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      text: 'text-blue-700',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
      btnBg: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-200',
      icon: RefreshCw,
    },
  };

  const style = typeStyles[type] || typeStyles.danger;
  const IconComponent = style.icon;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" id="confirm-modal-wrapper">
      <div
        className="bg-white w-full max-w-md rounded-2xl border border-slate-100 shadow-2xl overflow-hidden p-6 relative animate-scale-up"
        id="confirm-modal-box"
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
          id="close-confirm-modal-btn"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4" id="confirm-modal-content">
          <div className={`p-3 rounded-xl ${style.iconBg} ${style.iconText} flex-shrink-0`} id="confirm-modal-icon-container">
            <IconComponent className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1.5" id="confirm-modal-text-content">
            <h3 className="font-bold text-slate-800 text-lg font-display" id="confirm-modal-title">{title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium" id="confirm-modal-message">
              {message}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-50" id="confirm-modal-buttons">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200/60 transition-all"
            id="confirm-modal-cancel-btn"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-sm focus:ring-4 transition-all ${style.btnBg}`}
            id="confirm-modal-submit-btn"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
