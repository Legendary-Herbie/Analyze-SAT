import React from 'react';
import { AlertTriangle, Trash2, RotateCcw, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: Trash2,
          iconBg: 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400',
          btnBg: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
        };
      case 'warning':
        return {
          icon: RotateCcw,
          iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
          btnBg: 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm',
        };
      case 'primary':
      default:
        return {
          icon: AlertTriangle,
          iconBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
          btnBg: 'bg-[#2c4160] hover:bg-[#20324c] dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white shadow-sm',
        };
    }
  };

  const currentVariant = getVariantStyles();
  const Icon = currentVariant.icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150"
      style={{ backgroundColor: 'rgba(11, 17, 32, 0.65)' }}
    >
      <div className="bg-white dark:bg-slate-900 border border-[#e5e9f0] dark:border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${currentVariant.iconBg}`}>
              <Icon className="w-5 h-5" />
            </div>
            <button
              onClick={onCancel}
              className="w-7 h-7 rounded-lg bg-[#f1f4f8] dark:bg-slate-800 hover:bg-[#e2e7ee] dark:hover:bg-slate-700 flex items-center justify-center text-[#6f7b90] dark:text-slate-400 hover:text-[#182235] dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-base font-extrabold text-[#182235] dark:text-slate-100">
            {title}
          </h3>
          <p className="text-xs text-[#6f7b90] dark:text-slate-400 mt-1.5 leading-relaxed">
            {message}
          </p>

          <div className="flex items-center justify-end gap-2.5 mt-5 pt-3 border-t border-[#f0f2f5] dark:border-slate-800">
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-2 text-xs font-bold text-[#405978] dark:text-slate-300 hover:bg-[#f6f8fb] dark:hover:bg-slate-800 rounded-xl border border-[#e5e9f0] dark:border-slate-700 transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onCancel();
              }}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all ${currentVariant.btnBg}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
