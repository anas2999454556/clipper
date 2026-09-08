"use client";

import { useEffect, useState, createContext, useContext } from "react";

interface CookieConsentContextValue {
  consent: boolean | null;
}

const CookieConsentContext = createContext<CookieConsentContextValue>({ consent: null });

export function useCookieConsent() {
  return useContext(CookieConsentContext);
}

const STORAGE_KEY = "clipper_cookie_consent";

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true" || stored === "false") {
      setConsent(stored === "true");
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setConsent(true);
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, "false");
    setConsent(false);
  };

  return (
    <CookieConsentContext.Provider value={{ consent }}>
      {children}
      {consent === null && (
        <div
          role="dialog"
          aria-label="Cookie consent"
          className="fixed bottom-0 inset-x-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-2xl mx-auto bg-card border border-border rounded-xl p-5 shadow-lg">
            <p className="text-sm text-foreground mb-1 font-medium">
              We use cookies
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              We use a single authentication cookie to keep you signed in. If you sign in with Google, Google sets
              its own cookies via an iframe. No tracking or analytics cookies are used.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={accept}
                className="rounded-full px-5 py-2 text-sm font-semibold bg-white text-black hover:opacity-90 transition-opacity"
              >
                Accept
              </button>
              <button
                onClick={decline}
                className="rounded-full px-5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </CookieConsentContext.Provider>
  );
}