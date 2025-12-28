import { useState, useEffect } from 'react';
import { useFont } from '@/contexts/FontContext';

export default function WelcomeModal() {
  const { hasChosenFont, setFont } = useFont();
  const [isVisible, setIsVisible] = useState(false);
  const [selectedFont, setSelectedFont] = useState<'default' | 'opendyslexic'>('default');
  const [mounted, setMounted] = useState(false);

  // Check localStorage directly on mount to ensure persistence
  useEffect(() => {
    setMounted(true);
    const hasChosen = localStorage.getItem('hasChosenFont');

    if (!hasChosen) {
      setIsVisible(true);
    }
  }, []);

  const handleFontSelect = (font: 'default' | 'opendyslexic') => {
    setSelectedFont(font);
  };

  const handleContinue = () => {
    setFont(selectedFont);
    setIsVisible(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      // Don't just close - save default preference
      setFont('default');
      setIsVisible(false);
    }
  };

  // Don't render until mounted to avoid hydration issues
  if (!mounted || !isVisible) return null;

  return (
    <div className="welcome-overlay" onKeyDown={handleKeyDown}>
      <div className="welcome-modal">
        <h2>Welcome to My Website</h2>
        <p>
          To enhance your reading experience, please select your preferred font style. You can change this
          anytime using the font toggle in the sidebar.
        </p>

        <div className="font-options">
          <div
            className={`font-option ${selectedFont === 'default' ? 'selected' : ''}`}
            data-font="default"
            onClick={() => handleFontSelect('default')}
            style={{ cursor: 'pointer' }}
          >
            <h3>Default Font</h3>
            <p>Standard font optimized for general readability.</p>
          </div>
          <div
            className={`font-option ${selectedFont === 'opendyslexic' ? 'selected' : ''}`}
            data-font="opendyslexic"
            onClick={() => handleFontSelect('opendyslexic')}
            style={{ cursor: 'pointer' }}
          >
            <h3>OpenDyslexic</h3>
            <p>Specially designed for readers with dyslexia.</p>
          </div>
        </div>

        <button id="continue-btn" className="continue-btn" onClick={handleContinue}>
          Continue with Selected Font
        </button>
      </div>

      <style jsx>{`
        .welcome-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }

        .welcome-modal {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .welcome-modal h2 {
          margin-top: 0;
          color: #333;
        }

        .font-options {
          display: flex;
          gap: 1rem;
          margin: 1.5rem 0;
        }

        .font-option {
          flex: 1;
          border: 2px solid #ddd;
          padding: 1rem;
          border-radius: 4px;
          transition: all 0.3s;
        }

        .font-option:hover {
          border-color: #ac4142;
        }

        .font-option.selected {
          border-color: #ac4142;
          background: #fef9f9;
        }

        .font-option h3 {
          margin-top: 0;
          font-size: 1.2rem;
        }

        .continue-btn {
          width: 100%;
          padding: 0.75rem 1.5rem;
          background: #ac4142;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.3s;
        }

        .continue-btn:hover {
          background: #8c3334;
        }

        @media (max-width: 600px) {
          .font-options {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
