import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { Navbar } from './components/Layout/Navbar';
import { Footer } from './components/Layout/Footer';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import { VerifiedRoute } from './components/auth/VerifiedRoute';
import { AuthProvider } from './context/AuthContext';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { VerificationPending } from './pages/VerificationPending';
import { VerificationSuccess } from './pages/VerificationSuccess';
import { VerificationError } from './pages/VerificationError';
import { Labs } from './pages/Labs';
import { LabDetail } from './pages/LabDetail';
import { Vulnerabilities, VulnerabilityDetail } from './pages/Vulnerabilities';
import { Dashboard } from './pages/Dashboard';
import { Achievements } from './pages/Achievements';
import { Leaderboard } from './pages/Leaderboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminWriteups } from './pages/admin/AdminWriteups';
import { AdminWriteupCreate } from './pages/admin/AdminWriteupCreate';
import { AdminWriteupDetail } from './pages/admin/AdminWriteupDetail';
import { Writeups, WriteupDetail } from './pages/Writeups';
import { Glossary } from './pages/Glossary';
import { Resources } from './pages/Resources';
import { LearningPaths } from './pages/LearningPaths';
import { Encoder } from './pages/tools/Encoder';
import { Interceptor } from './pages/tools/Interceptor';
import { ReportGenerator } from './pages/tools/ReportGenerator';
import { Search } from './pages/Search';
import { useLanguage } from './i18n/LanguageContext';
import { useTranslation } from 'react-i18next';

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
    <div className={darkMode ? 'dark' : ''}>
      <div
        className={`min-h-screen transition-colors ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}
        dir={direction}
        lang={locale}
      >
        <BrowserRouter>
          <AuthProvider>
            <Navbar />
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
            <Footer />
          </AuthProvider>
        </BrowserRouter>
      </div>
    </div>
  );
}

