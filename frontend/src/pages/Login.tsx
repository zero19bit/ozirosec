import { FormEvent, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useAppStore } from '../store/useAppStore';
import oziroSecMarkDark from '../assets/oziro-sec-mark-dark.png';
import oziroSecMarkLight from '../assets/oziro-sec-mark-light.png';

type LocationState = {
  from?: {
    pathname?: string;
  };
};

export function Login() {
  const { t } = useTranslation();
  const { direction, locale } = useLanguage();
  const { isAuthenticated, isLoading, login, user } = useAuth();
  const darkMode = useAppStore((state) => state.darkMode);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const redirectTo = state?.from?.pathname ?? '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoading && isAuthenticated) {
    return <Navigate to={user?.email_verified_at ? redirectTo : '/verify-email'} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const authenticatedUser = await login({
        email,
        password,
        remember,
      });
      navigate(authenticatedUser.email_verified_at ? redirectTo : '/verify-email', { replace: true });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : t('loginError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className={`min-h-screen px-4 py-12 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}
      dir={direction}
      lang={locale}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_420px]">
        <section className="order-2 lg:order-1">
          <div className={`rounded-3xl border p-8 ${darkMode ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-white'}`}>
            <div className="mb-6 flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-slate-950">
              <img src={darkMode ? oziroSecMarkDark : oziroSecMarkLight} alt="Oziro Sec" className="h-full w-full object-contain" />
            </div>
            <h1 className={`mb-3 text-4xl font-black leading-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {t('loginTitle')}
            </h1>
            <p className={`max-w-xl text-base leading-8 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {t('loginSubtitle')}
            </p>
            <div className={`mt-8 rounded-2xl border p-4 text-sm leading-7 ${darkMode ? 'border-green-500/20 bg-green-500/5 text-green-200' : 'border-green-200 bg-green-50 text-green-800'}`}>
              {t('loginSecurityNote')}
            </div>
          </div>
        </section>

        <section className="order-1 lg:order-2">
          <form
            onSubmit={handleSubmit}
            className={`rounded-3xl border p-6 shadow-2xl ${darkMode ? 'border-slate-800 bg-slate-900 shadow-slate-950/40' : 'border-slate-200 bg-white shadow-slate-200/70'}`}
          >
            <div className="space-y-5">
              <label className="block">
                <span className={`mb-2 block text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {t('email')}
                </span>
                <div className="relative">
                  <Mail size={16} className={`absolute start-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    autoComplete="email"
                    className={`w-full rounded-xl border py-3 pe-4 ps-10 text-start outline-none transition-colors ${
                      darkMode
                        ? 'border-slate-700 bg-slate-950 text-white placeholder-slate-600 focus:border-green-500'
                        : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-green-500'
                    }`}
                    dir="ltr"
                    inputMode="email"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="analyst@example.com"
                    required
                    type="email"
                    value={email}
                  />
                </div>
              </label>

              <label className="block">
                <span className={`mb-2 block text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {t('password')}
                </span>
                <div className="relative">
                  <Lock size={16} className={`absolute start-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    autoComplete="current-password"
                    className={`w-full rounded-xl border py-3 pe-4 ps-10 text-start outline-none transition-colors ${
                      darkMode
                        ? 'border-slate-700 bg-slate-950 text-white placeholder-slate-600 focus:border-green-500'
                        : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-green-500'
                    }`}
                    dir="ltr"
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    type="password"
                    value={password}
                  />
                </div>
              </label>

              <label className={`flex items-center gap-2 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                <input
                  checked={remember}
                  className="h-4 w-4 rounded border-slate-400 text-green-500 focus:ring-green-500"
                  onChange={(event) => setRemember(event.target.checked)}
                  type="checkbox"
                />
                <span>{t('rememberMe')}</span>
              </label>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                className="flex w-full items-center justify-center rounded-xl bg-green-500 px-5 py-3 font-bold text-white transition-all hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSubmitting || isLoading}
                type="submit"
              >
                {isSubmitting ? t('signingIn') : t('signIn')}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

