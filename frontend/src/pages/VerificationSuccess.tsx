import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppStore } from '../store/useAppStore';

export function VerificationSuccess() {
  const { isAuthenticated, isLoading, refreshUser } = useAuth();
  const darkMode = useAppStore((state) => state.darkMode);
  const [searchParams] = useSearchParams();
  const alreadyVerified = searchParams.get('status') === 'already-verified';

  useEffect(() => {
    if (isAuthenticated) {
      void refreshUser();
    }
  }, [isAuthenticated, refreshUser]);

  return (
    <main className={`min-h-screen px-4 py-12 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <section className={`mx-auto max-w-xl rounded-3xl border p-8 text-center ${darkMode ? 'border-slate-800 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-900'}`}>
        <CheckCircle2 className="mx-auto mb-5 text-green-400" size={56} />
        <h1 className="mb-3 text-3xl font-black">Email verified</h1>
        <p className={`mb-6 leading-7 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          {alreadyVerified ? 'This email address was already verified.' : 'Your HackPath email address is verified and your account is ready.'}
        </p>
        {isAuthenticated ? (
          <>
            <button
              className="mb-3 w-full rounded-xl bg-green-500 px-5 py-3 font-bold text-white hover:bg-green-400"
              onClick={() => void refreshUser()}
              type="button"
            >
              Refresh account status
            </button>
            <Link className="block w-full rounded-xl border border-green-500/40 px-5 py-3 font-bold text-green-400 hover:bg-green-500/10" to="/dashboard">
              Continue to dashboard
            </Link>
          </>
        ) : !isLoading && (
          <Link className="block w-full rounded-xl bg-green-500 px-5 py-3 font-bold text-white hover:bg-green-400" to="/login">
            Log in to continue
          </Link>
        )}
      </section>
    </main>
  );
}
