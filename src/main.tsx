import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Shim window.alert para entornos iframe / PWA sin bloquear la UI
if (typeof window !== 'undefined') {
  window.alert = (message?: any) => {
    window.dispatchEvent(
      new CustomEvent('mallaesa-notification', {
        detail: { message: String(message ?? ''), type: 'info' }
      })
    );
  };
}

createRoot(document.getElementById('root')!).render(<App />);
