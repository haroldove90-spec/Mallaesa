import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export function notify(message: string, type: 'success' | 'error' | 'info' = 'info') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('mallaesa-notification', {
        detail: { message, type }
      })
    );
  }
}

export const NotificationToast: React.FC = () => {
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  useEffect(() => {
    const handleNotification = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type?: 'success' | 'error' | 'info' }>;
      if (!customEvent.detail || !customEvent.detail.message) return;

      const newNotif: ToastNotification = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        message: customEvent.detail.message,
        type: customEvent.detail.type || (customEvent.detail.message.includes('éxito') || customEvent.detail.message.includes('¡') ? 'success' : 'info')
      };

      setNotifications(prev => [...prev.slice(-3), newNotif]); // Keep max 4 toasts visible

      // Auto dismiss after 4.5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
      }, 4500);
    };

    window.addEventListener('mallaesa-notification', handleNotification);
    return () => {
      window.removeEventListener('mallaesa-notification', handleNotification);
    };
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3">
      {notifications.map(notif => {
        const isSuccess = notif.type === 'success' || notif.message.includes('éxito') || notif.message.includes('¡');
        const isError = notif.type === 'error' || notif.message.toLowerCase().includes('error') || notif.message.toLowerCase().includes('favor');

        return (
          <div
            key={notif.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border text-sm backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
              isSuccess
                ? 'bg-[#1e2922]/95 text-emerald-100 border-emerald-600/40'
                : isError
                ? 'bg-[#2d1b1b]/95 text-rose-100 border-rose-600/40'
                : 'bg-neutral-900/95 text-white border-neutral-700/60'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : isError ? (
                <AlertCircle className="w-5 h-5 text-amber-400" />
              ) : (
                <Info className="w-5 h-5 text-neutral-300" />
              )}
            </div>

            <div className="flex-1 font-medium leading-snug break-words">
              {notif.message}
            </div>

            <button
              onClick={() => removeNotification(notif.id)}
              className="shrink-0 p-1 rounded-md text-neutral-400 hover:text-white transition-colors"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
