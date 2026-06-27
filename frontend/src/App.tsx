import { Seo } from './components/Seo';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { Navbar } from './components/Layout/Navbar';
import { Footer } from './components/Layout/Footer';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import { VerifiedRoute } from './components/auth/VerifiedRoute';
import { AuthProvider } from './context/AuthContext';
import { useLanguage } from './i18n/LanguageContext';
import { useTranslation } from 'react-i18next';

const Home = lazy(() => import('./pages/Home').then(({ Home }) => ({ default: Home })));
const Login = lazy(() => import('./pages/Login').then(({ Login }) => ({ default: Login })));
const Register = lazy(() => import('./pages/Register').then(({ Register }) => ({ default: Register })));
const VerificationPending = lazy(() => import('./pages/VerificationPending').then(({ VerificationPending }) => ({ default: VerificationPending })));
const VerificationSuccess = lazy(() => import('./pages/VerificationSuccess').then(({ VerificationSuccess }) => ({ default: VerificationSuccess })));
const VerificationError = lazy(() => import('./pages/VerificationError').then(({ VerificationError }) => ({ default: VerificationError })));
const Labs = lazy(() => import('./pages/Labs').then(({ Labs }) => ({ default: Labs })));
const LabDetail = lazy(() => import('./pages/LabDetail').then(({ LabDetail }) => ({ default: LabDetail })));
const Vulnerabilities = lazy(() => import('./pages/Vulnerabilities').then(({ Vulnerabilities }) => ({ default: Vulnerabilities })));
const VulnerabilityDetail = lazy(() => import('./pages/Vulnerabilities').then(({ VulnerabilityDetail }) => ({ default: VulnerabilityDetail })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(({ Dashboard }) => ({ default: Dashboard })));
const Achievements = lazy(() => import('./pages/Achievements').then(({ Achievements }) => ({ default: Achievements })));
const Leaderboard = lazy(() => import('./pages/Leaderboard').then(({ Leaderboard }) => ({ default: Leaderboard })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(({ AdminDashboard }) => ({ default: AdminDashboard })));
const AdminWriteups = lazy(() => import('./pages/admin/AdminWriteups').then(({ AdminWriteups }) => ({ default: AdminWriteups })));
const AdminWriteupCreate = lazy(() => import('./pages/admin/AdminWriteupCreate').then(({ AdminWriteupCreate }) => ({ default: AdminWriteupCreate })));
const AdminWriteupDetail = lazy(() => import('./pages/admin/AdminWriteupDetail').then(({ AdminWriteupDetail }) => ({ default: AdminWriteupDetail })));
const Writeups = lazy(() => import('./pages/Writeups').then(({ Writeups }) => ({ default: Writeups })));
const WriteupDetail = lazy(() => import('./pages/Writeups').then(({ WriteupDetail }) => ({ default: WriteupDetail })));
const Glossary = lazy(() => import('./pages/Glossary').then(({ Glossary }) => ({ default: Glossary })));
const Resources = lazy(() => import('./pages/Resources').then(({ Resources }) => ({ default: Resources })));
const LearningPaths = lazy(() => import('./pages/LearningPaths').then(({ LearningPaths }) => ({ default: LearningPaths })));
const Encoder = lazy(() => import('./pages/tools/Encoder').then(({ Encoder }) => ({ default: Encoder })));
const Interceptor = lazy(() => import('./pages/tools/Interceptor').then(({ Interceptor }) => ({ default: Interceptor })));
const ReportGenerator = lazy(() => import('./pages/tools/ReportGenerator').then(({ ReportGenerator }) => ({ default: ReportGenerator })));
const Search = lazy(() => import('./pages/Search').then(({ Search }) => ({ default: Search })));

function NotFound() {
  const { darkMode } = useAppStore();
  const { t } = useTranslation();

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="text-center">
        <div className="text-8xl mb-6">🔍</div>
        <h1 className={`text-4xl font-black mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>404</h1>
        <p className={`text-lg mb-6 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('pageNotFound')}</p>
        <a href="/" className="bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-3 rounded-xl transition-colors">
          {t('backToHome')}
        </a>
      </div>
    </div>
  );
}

export default function App() {
  const { darkMode } = useAppStore();
  const { direction, locale } = useLanguage();

  return (
    <div className={`${darkMode ? 'dark' : ''} w-full max-w-full overflow-x-hidden`}>
      <div
        className={`min-h-screen w-full max-w-full overflow-x-hidden transition-colors ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}
        dir={direction}
        lang={locale}
      >
        <BrowserRouter>
          <Seo />
          <AuthProvider>
            <Navbar />
            <Suspense fallback={<main className="min-h-screen" aria-busy="true" />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-email/success" element={<VerificationSuccess />} />
                <Route path="/verify-email/error" element={<VerificationError />} />
                <Route path="/labs" element={<Labs />} />
                <Route path="/labs/:slug" element={<LabDetail />} />
                <Route path="/vulnerabilities" element={<Vulnerabilities />} />
                <Route path="/vulnerabilities/:slug" element={<VulnerabilityDetail />} />
                <Route path="/writeups" element={<Writeups />} />
                <Route path="/writeups/:slug" element={<WriteupDetail />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/verify-email" element={<VerificationPending />} />
                  <Route element={<VerifiedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route element={<AdminRoute />}>
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/admin/writeups" element={<AdminWriteups />} />
                      <Route path="/admin/writeups/create" element={<AdminWriteupCreate />} />
                      <Route path="/admin/writeups/:id" element={<AdminWriteupDetail />} />
                    </Route>
                  </Route>
                </Route>
                <Route path="/achievements" element={<Achievements />} />
                <Route path="/glossary" element={<Glossary />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/paths" element={<LearningPaths />} />
                <Route path="/tools/encoder" element={<Encoder />} />
                <Route path="/tools/interceptor" element={<Interceptor />} />
                <Route path="/tools/report-generator" element={<ReportGenerator />} />
                <Route path="/search" element={<Search />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <Footer />
          </AuthProvider>
        </BrowserRouter>
      </div>
    </div>
  );
}
