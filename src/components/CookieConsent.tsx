import { useEffect, useState } from 'react';

const STORAGE_KEY = 'gate24-cookie-consent';
const GA_ID = import.meta.env.PUBLIC_GA_MEASUREMENT_ID ?? '';

function loadGoogleAnalytics(measurementId: string) {
  if (document.getElementById('ga-script')) return;

  const script = document.createElement('script');
  script.id = 'ga-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  const inline = document.createElement('script');
  inline.text = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}');
  `;
  document.head.appendChild(inline);
}

export default function CookieConsent() {
  const [choice, setChoice] = useState<'granted' | 'denied' | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'granted' || stored === 'denied') {
      setChoice(stored);
      if (stored === 'granted' && GA_ID) loadGoogleAnalytics(GA_ID);
    }
  }, []);

  if (choice !== null || !GA_ID) return null;

  const decide = (value: 'granted' | 'denied') => {
    window.localStorage.setItem(STORAGE_KEY, value);
    setChoice(value);
    if (value === 'granted') loadGoogleAnalytics(GA_ID);
  };

  return (
    <div className="cookie-banner" role="dialog" aria-live="polite" aria-label="Cookie consent">
      <p>
        This site uses Google Analytics to understand traffic. No data is collected until you accept.{' '}
        <a href="/cookies">Cookie policy</a>
      </p>
      <div className="actions">
        <button type="button" className="btn btn-ghost" onClick={() => decide('denied')}>
          Decline
        </button>
        <button type="button" className="btn btn-primary" onClick={() => decide('granted')}>
          Accept
        </button>
      </div>
      <style>{`
        .cookie-banner {
          position: fixed;
          left: 1rem;
          right: 1rem;
          bottom: 1rem;
          max-width: 34rem;
          margin-inline: auto;
          background: var(--color-bg-raised, #141414);
          border: 1px solid var(--color-border, #2a2a2a);
          padding: 1.1rem 1.25rem;
          z-index: 200;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .cookie-banner p {
          margin: 0;
          font-size: 0.85rem;
          color: var(--color-fg-muted, #a8a49c);
          max-width: none;
        }
        .cookie-banner a {
          color: var(--color-fg, #f5f3ef);
        }
        .actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }
      `}</style>
    </div>
  );
}
