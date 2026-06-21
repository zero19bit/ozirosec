import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppStore } from '../store/useAppStore';

export function VerificationError() {
  const { isAuthenticated } = useAuth();
  const darkMode = useAppStore((state) => state.darkMode);
  const [searchParams] = useSearchParams();
  const expired = searchParams.get('reason') === 'expired';

  return (
    <main className={`min-h-screen px-4 py-12 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <section className={`mx-auto max-w-xl rounded-3xl border p-8 text-center ${darkMode ? 'border-slate-800 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-900'}`}>
        <AlertTriangle className="mx-auto mb-5 text-amber-400" size={56} />
        <h1 className="mb-3 text-3xl font-black">Verification link unavailable</h1>
        <p className={`mb-6 leading-7 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          {expired ? 'This verification link has expired. Request a fresh link and try again.' : 'This verification link is invalid or no longer matches your email address.'}
        </p>
        {isAuthenticated ? (
          <Link className="block w-full rounded-xl bg-green-500 px-5 py-3 font-bold text-white hover:bg-green-400" to="/verify-email">Request a new link</Link>
        ) : (
          <Link className="block w-full rounded-xl bg-green-500 px-5 py-3 font-bold text-white hover:bg-green-400" to="/login">Log in to request a new link</Link>
        )}
      </section>
    </main>
  );
}
