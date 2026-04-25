import React, { useEffect } from 'react';
import { CheckCircle, XCircle, HelpCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: number) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const config = {
    success: { icon: CheckCircle, bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', iconColor: 'text-green-600' },
    error: { icon: XCircle, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', iconColor: 'text-red-600' },
    warning: { icon: HelpCircle, bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', iconColor: 'text-yellow-600' },
    info: { icon: AlertCircle, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', iconColor: 'text-blue-600' },
  };

  const { icon: Icon, bg, border, text, iconColor } = config[toast.type];

  return (
    <div className={`${bg} ${border} ${text} border rounded-lg shadow-lg p-4 flex items-start gap-3 min-w-[320px] max-w-md animate-slide-in`}>
      <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button onClick={() => onClose(toast.id)} className={`${iconColor} hover:opacity-70`}>
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC<{ toasts: ToastMessage[]; onClose: (id: number) => void }> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-6 right-6 z-[100] space-y-3">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onClose={onClose} />
      ))}
    </div>
  );
};

export default Toast;
