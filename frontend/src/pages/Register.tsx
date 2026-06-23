import { FormEvent, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Lock, Mail, User, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useAppStore } from '../store/useAppStore';
import oziroSecMarkDark from '../assets/oziro-sec-mark-dark.png';
import oziroSecMarkLight from '../assets/oziro-sec-mark-light.png';

type ValidationRule = {
  label: string;
  valid: boolean;
};

const usernamePattern = /^[a-z0-9](?!.*\.\.)[a-z0-9._-]{1,30}[a-z0-9]$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Register() {
  const { t } = useTranslation();
  const { direction, locale } = useLanguage();
  const { isAuthenticated, isLoading, register } = useAuth();
  const darkMode = useAppStore((state) => state.darkMode);
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizedUsername = username.trim().toLowerCase();
  const usernameValid = usernamePattern.test(normalizedUsername);
  const emailValid = emailPattern.test(email);

  const passwordRules = useMemo<ValidationRule[]>(() => [
    { label: t('ruleLength'), valid: password.length >= 8 },
    { label: t('ruleUppercase'), valid: /[A-Z]/.test(password) },
    { label: t('ruleNumber'), valid: /\d/.test(password) },
    { label: t('ruleSpecial'), valid: /[^A-Za-z0-9]/.test(password) },
  ], [password, t]);

  const passwordValid = passwordRules.every((rule) => rule.valid);
  const canSubmit = usernameValid && emailValid && passwordValid && !isSubmitting && !isLoading;

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/verify-email" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await register({
        username,
        email,
        password,
      });
      navigate('/verify-email', { replace: true });
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : t('registerError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = `w-full rounded-xl border py-3 pe-4 ps-10 text-start outline-none transition-colors ${
    darkMode
      ? 'border-slate-700 bg-slate-950 text-white placeholder-slate-600 focus:border-green-500'
      : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-green-500'
  }`;

  const renderRule = (rule: ValidationRule) => {
    const Icon = rule.valid ? CheckCircle2 : XCircle;

    return (
      <li
        key={rule.label}
        className={`flex items-center gap-2 text-xs ${rule.valid ? 'text-green-400' : darkMode ? 'text-slate-500' : 'text-slate-500'}`}
      >
        <Icon size={14} className="shrink-0" />
        <span>{rule.label}</span>
      </li>
    );
  };

  return (
    <main
      className={`min-h-screen px-4 py-12 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}
      dir={direction}
      lang={locale}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_460px]">
        <section className="order-2 lg:order-1">
          <div className={`rounded-3xl border p-8 ${darkMode ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-white'}`}>
            <div className="mb-6 flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-slate-950">
              <img src={darkMode ? oziroSecMarkDark : oziroSecMarkLight} alt="Oziro Sec" className="h-full w-full object-contain" />
            </div>
            <h1 className={`mb-3 text-4xl font-black leading-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {t('registerTitle')}
            </h1>
            <p className={`max-w-xl text-base leading-8 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {t('registerSubtitle')}
            </p>
            <div className={`mt-8 rounded-2xl border p-4 text-sm leading-7 ${darkMode ? 'border-green-500/20 bg-green-500/5 text-green-200' : 'border-green-200 bg-green-50 text-green-800'}`}>
              {t('registerSecurityNote')}
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
                  {t('username')}
                </span>
                <div className="relative">
                  <User size={16} className={`absolute start-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    autoComplete="username"
                    className={inputClass}
                    dir="ltr"
                    onChange={(event) => setUsername(event.target.value.trim().toLowerCase())}
                    required
                    type="text"
                    value={username}
                  />
                </div>
                <p className={`mt-2 text-xs ${username.length === 0 || usernameValid ? 'text-green-400' : 'text-red-400'}`}>
                  {t('ruleUsername')}
                </p>
              </label>

              <label className="block">
                <span className={`mb-2 block text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {t('email')}
                </span>
                <div className="relative">
                  <Mail size={16} className={`absolute start-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    autoComplete="email"
                    className={inputClass}
                    dir="ltr"
                    inputMode="email"
                    onChange={(event) => setEmail(event.target.value.trim())}
                    required
                    type="email"
                    value={email}
                  />
                </div>
                <p className={`mt-2 text-xs ${email.length === 0 || emailValid ? 'text-green-400' : 'text-red-400'}`}>
                  {t('ruleEmail')}
                </p>
              </label>

              <label className="block">
                <span className={`mb-2 block text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {t('password')}
                </span>
                <div className="relative">
                  <Lock size={16} className={`absolute start-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    autoComplete="new-password"
                    className={inputClass}
                    dir="ltr"
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    type="password"
                    value={password}
                  />
                </div>
              </label>

              <div className={`rounded-2xl border p-4 ${darkMode ? 'border-slate-800 bg-slate-950/70' : 'border-slate-200 bg-slate-50'}`}>
                <div className={`mb-3 text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {t('passwordRules')}
                </div>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {passwordRules.map(renderRule)}
                </ul>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                className="flex w-full items-center justify-center rounded-xl bg-green-500 px-5 py-3 font-bold text-white transition-all hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={!canSubmit}
                type="submit"
              >
                {isSubmitting ? t('creatingAccount') : t('createAccount')}
              </button>

              <div className={`text-center text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {t('alreadyHaveAccount')}{' '}
                <Link className="font-semibold text-green-400 hover:text-green-300" to="/login">
                  {t('goToLogin')}
                </Link>
              </div>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

