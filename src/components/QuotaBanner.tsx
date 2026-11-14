import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const QuotaBanner: React.FC = () => {
  const [quotaReached, setQuotaReached] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => {
      setQuotaReached(true);
    };

    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    };
  }, []);

  if (!quotaReached) return null;

  return (
    <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs md:text-sm font-medium text-center sticky top-0 z-50 shadow-md flex items-center justify-center gap-2">
      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-950" />
      <span>
        Google Maps Platform quota reached. If you are the app owner, visit{' '}
        <a
          href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-bold hover:text-slate-900"
        >
          maps developer site
        </a>{' '}
        for instructions to update your account.
      </span>
      <button 
        onClick={() => setQuotaReached(false)}
        className="ml-2 p-1 hover:bg-amber-600/30 rounded-full transition"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
