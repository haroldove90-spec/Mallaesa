import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish?: () => void;
  forceShow?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, forceShow }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onFinish) onFinish();
    }, 1800);

    return () => clearTimeout(timer);
  }, [onFinish, forceShow]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-700 ease-out">
      <div className="w-full max-w-sm sm:max-w-md px-8 flex flex-col items-center justify-center animate-fade-in">
        {/* Splash logo without encapsulating boxes or container borders */}
        <img
          src="https://appdesignproyectos.com/mallaesalogo.png"
          alt="MALLAESA"
          className="w-full max-h-36 object-contain filter drop-shadow-sm transition-transform duration-1000 transform scale-100 hover:scale-105"
        />
        
        {/* Subtle industrial loading bar in #898A82 */}
        <div className="w-32 h-1 bg-stone-200 rounded-full mt-8 overflow-hidden">
          <div className="h-full bg-[#898A82] rounded-full animate-pulse w-3/4"></div>
        </div>
        <p className="text-xs uppercase tracking-widest text-[#898A82] font-semibold mt-3">
          Seguridad Perimetral
        </p>
      </div>
    </div>
  );
};
