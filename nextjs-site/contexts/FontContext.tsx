import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Font = 'default' | 'opendyslexic';

interface FontContextType {
  font: Font;
  setFont: (font: Font) => void;
  hasChosenFont: boolean;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

interface FontProviderProps {
  children: ReactNode;
}

export function FontProvider({ children }: FontProviderProps) {
  const [font, setFontState] = useState<Font>('default');
  const [hasChosenFont, setHasChosenFont] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Hydration-safe: read localStorage after mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('preferredFont') as Font;
    const chosen = localStorage.getItem('hasChosenFont');
    if (saved) setFontState(saved);
    if (chosen) setHasChosenFont(true);
  }, []);

  const setFont = (newFont: Font) => {
    setFontState(newFont);
    localStorage.setItem('preferredFont', newFont);
    localStorage.setItem('hasChosenFont', 'true');
    setHasChosenFont(true);
  };

  return (
    <FontContext.Provider value={{ font, setFont, hasChosenFont }}>
      <div className={font === 'opendyslexic' ? 'opendyslexic-font' : ''}>
        {children}
      </div>
    </FontContext.Provider>
  );
}

export const useFont = () => {
  const ctx = useContext(FontContext);
  if (!ctx) {
    // Return default values for SSR
    return {
      font: 'default' as Font,
      setFont: () => {},
      hasChosenFont: false,
    };
  }
  return ctx;
};
