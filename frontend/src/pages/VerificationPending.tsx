import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { LogOut, MailCheck, RefreshCw, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppStore } from '../store/useAppStore';

type VerificationStatusResponse = {
  data: {
    verified: boolean;
    email: string;
    email_verified_at: string | null;
  };
};

export function VerificationPending() {
  const { user, isAuthenticated, isLoading, apiFetch, logout, refreshUser } = useAuth();
  const darkMode = useAppStore((state) => state.darkMode);
  const navigate = useNavigate();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isLoading && user?.email_verified_at) {
    return <Navigate to="/dashboard" replace />;
  }

  const resend = async () => {
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      await apiFetch('/email/verification-notification', { method: 'POST' });
      setMessage('Verification email sent. Check your inbox.');
      setCooldown(60);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to send verification email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const refreshStatus = async () => {
    setError(null);
    setIsRefreshing(true);

    try {
      const status = await apiFetch<VerificationStatusResponse>('/email/verification');

      if (status.data.verified) {
        await refreshUser();
        navigate('/dashboard', { replace: true });
        return;
      }

      setMessage('Your email is still pending verification.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to refresh verification status.');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <main className={`min-h-screen px-4 py-12 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <section className={`mx-auto max-w-2xl rounded-3xl border p-8 text-center ${darkMode ? 'border-slate-800 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-900'}`}>
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/15 text-green-400">
          <MailCheck size={32} />
        </div>
        <h1 className="mb-3 text-3xl font-black">Verify your email address</h1>
        <p className={`mb-6 leading-7 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          We sent a verification link to <span className="font-semibold text-green-400">{user?.email}</span>.
          Verify your email to access labs, progress, leaderboard, and admin features.
        </p>

        {message && <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">{message}</div>}
        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-3 font-bold text-white transition-colors hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting || cooldown > 0}
            onClick={resend}
            type="button"
          >
            <Send size={18} />
            {cooldown > 0 ? `Resend in ${cooldown}s` : isSubmitting ? 'Sending...' : 'Resend email'}
          </button>
          <button
            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 font-bold transition-colors ${darkMode ? 'border-slate-700 text-slate-200 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
            disabled={isRefreshing}
            onClick={refreshStatus}
            type="button"
          >
            <RefreshCw size={18} />
            {isRefreshing ? 'Checking...' : 'I verified my email'}
          </button>
          <button
            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 font-bold transition-colors ${darkMode ? 'border-slate-700 text-slate-200 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
            onClick={() => void logout()}
            type="button"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </section>
    </main>
  );
}

