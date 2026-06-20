import { KeyboardEvent, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDelayedDropdown } from '../../hooks/useDelayedDropdown';
import { useAppStore } from '../../store/useAppStore';
import { LanguageSwitcher } from '../LanguageSwitcher';
import {
  Shield, Menu, X, Moon, Sun, BookOpen, FlaskConical,
  Trophy, ChevronDown, Terminal, Globe, Star, BarChart3, Search,
  Crown, LogIn, UserPlus, LogOut
} from 'lucide-react';

type NavChild = {
  labelKey: string;
  href: string;
  icon: ReactNode;
};

type NavItem = {
  labelKey: string;
  href?: string;
  icon?: ReactNode;
  children?: NavChild[];
};

const navItems: NavItem[] = [
  {
    labelKey: 'navLearn',
    children: [
      { labelKey: 'navVulnerabilities', href: '/vulnerabilities', icon: <Shield size={14} /> },
      { labelKey: 'navLabs', href: '/labs', icon: <FlaskConical size={14} /> },
      { labelKey: 'navLearningPaths', href: '/paths', icon: <BookOpen size={14} /> },
      { labelKey: 'navGlossary', href: '/glossary', icon: <BookOpen size={14} /> },
    ]
  },
  {
    labelKey: 'navTools',
    children: [
      { labelKey: 'navEncoder', href: '/tools/encoder', icon: <Terminal size={14} /> },
      { labelKey: 'navInterceptor', href: '/tools/interceptor', icon: <Globe size={14} /> },
      { labelKey: 'navReportGenerator', href: '/tools/report-generator', icon: <BookOpen size={14} /> },
    ]
  },
  { labelKey: 'navLeaderboard', href: '/leaderboard', icon: <Trophy size={14} /> },
  { labelKey: 'navResources', href: '/resources', icon: <BookOpen size={14} /> },
  { labelKey: 'navDashboard', href: '/dashboard', icon: <BarChart3 size={14} /> },
];

const dropdownMotion = {
  initial: { opacity: 0, y: -6, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -4, scale: 0.98 },
  transition: { duration: 0.16, ease: [0.16, 1, 0.3, 1] },
} as const;

const accordionMotion = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
} as const;

function focusMenuItem(items: Array<HTMLAnchorElement | null>, index: number) {
  items[index]?.focus();
}

export function Navbar() {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoggingOutAllDevices, setIsLoggingOutAllDevices] = useState(false);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const menuItemRefs = useRef<Record<string, Array<HTMLAnchorElement | null>>>({});
  const dropdown = useDelayedDropdown(350);
  const { darkMode, toggleDarkMode, userXP, completedLabs, getLevel } = useAppStore();
  const { user, isAuthenticated, logout, logoutAllDevices } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const level = getLevel();
  const isAdmin = user?.role === 'admin';

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + '/');
  const isDropdownOpen = (labelKey: string) => dropdown.isOpen && activeDropdown === labelKey;

  const openDropdown = (labelKey: string) => {
    setActiveDropdown(labelKey);
    dropdown.open();
  };

  const closeDropdown = () => {
    dropdown.close();
  };

  const closeDropdownNow = () => {
    dropdown.cancelClose();
    setActiveDropdown(null);
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>, item: NavItem) => {
    if (!item.children) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeDropdownNow();
      return;
    }

    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault();
      openDropdown(item.labelKey);
      window.requestAnimationFrame(() => focusMenuItem(menuItemRefs.current[item.labelKey] ?? [], 0));
    }
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>, item: NavItem) => {
    const menuItems = menuItemRefs.current[item.labelKey] ?? [];
    const currentIndex = menuItems.findIndex((node) => node === document.activeElement);
    const lastIndex = menuItems.length - 1;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeDropdownNow();
      triggerRefs.current[item.labelKey]?.focus();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusMenuItem(menuItems, currentIndex >= lastIndex ? 0 : currentIndex + 1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusMenuItem(menuItems, currentIndex <= 0 ? lastIndex : currentIndex - 1);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      focusMenuItem(menuItems, 0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      focusMenuItem(menuItems, lastIndex);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    setMobileOpen(false);
    setMobileAccordion(null);
    closeDropdownNow();

    try {
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (isLoggingOutAllDevices) {
      return;
    }

    if (!window.confirm(t('logoutAllDevicesConfirm'))) {
      return;
    }

    const currentPassword = window.prompt(t('logoutAllDevicesPasswordPrompt'));

    if (!currentPassword) {
      window.alert(t('logoutAllDevicesPasswordRequired'));
      return;
    }

    setIsLoggingOutAllDevices(true);
    setMobileOpen(false);
    setMobileAccordion(null);
    closeDropdownNow();

    try {
      await logoutAllDevices(currentPassword);
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOutAllDevices(false);
    }
  };

  return (
    <nav className={`sticky top-0 z-50 border-b transition-colors ${
      darkMode
        ? 'bg-slate-900/95 border-slate-700/50 backdrop-blur-sm'
        : 'bg-white/95 border-slate-200 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                <Shield size={18} className="text-white" />
              </div>
              <div className="absolute -top-1 -end-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            </div>
            <div>
              <span className={`text-lg font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Hack<span className="text-green-400">Path</span>
              </span>
              <div className={`text-xs leading-none ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('brandSubtitle')}
              </div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              item.children ? (
                <div
                  key={item.labelKey}
                  className="relative"
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                      closeDropdown();
                    }
                  }}
                  onFocus={() => openDropdown(item.labelKey)}
                  onMouseEnter={() => openDropdown(item.labelKey)}
                  onMouseLeave={closeDropdown}
                >
                  <button
                    ref={(node) => {
                      triggerRefs.current[item.labelKey] = node;
                    }}
                    aria-expanded={isDropdownOpen(item.labelKey)}
                    aria-haspopup="menu"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      darkMode
                        ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    onKeyDown={(event) => handleTriggerKeyDown(event, item)}
                    type="button"
                  >
                    {t(item.labelKey)}
                    <ChevronDown size={12} className={`transition-transform ${isDropdownOpen(item.labelKey) ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen(item.labelKey) && (
                      <motion.div
                        {...dropdownMotion}
                        className={`absolute top-full start-0 mt-1 w-52 rounded-xl shadow-xl border py-1 z-50 will-change-transform ${
                          darkMode
                            ? 'bg-slate-800 border-slate-700'
                            : 'bg-white border-slate-200'
                        }`}
                        onKeyDown={(event) => handleMenuKeyDown(event, item)}
                        onMouseEnter={dropdown.cancelClose}
                        onMouseLeave={closeDropdown}
                        role="menu"
                      >
                        {item.children.map((child, index) => (
                          <Link
                            key={child.href}
                            ref={(node) => {
                              menuItemRefs.current[item.labelKey] = menuItemRefs.current[item.labelKey] ?? [];
                              menuItemRefs.current[item.labelKey][index] = node;
                            }}
                            role="menuitem"
                            tabIndex={-1}
                            to={child.href}
                            className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                              isActive(child.href)
                                ? 'text-green-400 bg-green-400/10'
                                : darkMode
                                  ? 'text-slate-300 hover:text-white hover:bg-slate-700'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                            onClick={closeDropdownNow}
                          >
                            {child.icon}
                            {t(child.labelKey)}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={item.href}
                  to={item.href!}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href!)
                      ? 'text-green-400 bg-green-400/10'
                      : darkMode
                        ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              )
            ))}
            {isAuthenticated && isAdmin && (
              <Link
                to="/admin"
                className={`ms-1 flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-black transition-colors ${
                  isActive('/admin')
                    ? 'border-emerald-400/40 bg-emerald-400/15 text-emerald-300'
                    : darkMode
                      ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/15'
                      : 'border-emerald-500/20 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <Crown size={14} />
                {t('navAdminPanel')}
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link to="/search" className={`hidden sm:flex p-2 rounded-lg transition-colors ${
              darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}>
              <Search size={18} />
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  darkMode
                    ? 'border-slate-700 bg-slate-800/50 hover:bg-slate-800'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}>
                  <Star size={14} className="text-yellow-400" />
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {userXP} XP
                  </span>
                  <span className="text-xs text-green-400 font-medium">{t('levelShort')}{level}</span>
                </Link>

                <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  <FlaskConical size={14} className="text-green-400" />
                  <span>{completedLabs.length}</span>
                </div>

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut || isLoggingOutAllDevices}
                  className={`hidden sm:inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    darkMode
                      ? 'border-red-400/20 bg-red-400/10 text-red-200 hover:bg-red-400/15'
                      : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                  }`}
                  type="button"
                >
                  <LogOut size={15} />
                  {isLoggingOut ? t('signingOut') : t('logout')}
                </button>
                <button
                  onClick={handleLogoutAllDevices}
                  disabled={isLoggingOut || isLoggingOutAllDevices}
                  className={`hidden lg:inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    darkMode
                      ? 'border-orange-400/20 bg-orange-400/10 text-orange-100 hover:bg-orange-400/15'
                      : 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100'
                  }`}
                  type="button"
                >
                  <LogOut size={15} />
                  {isLoggingOutAllDevices ? t('loggingOutAllDevices') : t('logoutAllDevices')}
                </button>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition-colors ${
                    darkMode
                      ? 'border-slate-700 bg-slate-800/60 text-slate-100 hover:bg-slate-800'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <LogIn size={15} />
                  {t('signIn')}
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 px-3 py-2 text-sm font-black text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:shadow-emerald-500/40"
                >
                  <UserPlus size={15} />
                  {t('createAccount')}
                </Link>
              </div>
            )}

            <LanguageSwitcher className="hidden sm:inline-flex" />

            <button
              onClick={toggleDarkMode}
              aria-label={darkMode ? t('switchToLight') : t('switchToDark')}
              className={`p-2 rounded-lg transition-colors ${
                darkMode
                  ? 'text-yellow-400 hover:bg-slate-800'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              type="button"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <Link to="/achievements" className={`hidden sm:flex p-2 rounded-lg transition-colors ${
              darkMode ? 'text-slate-400 hover:text-yellow-400 hover:bg-slate-800' : 'text-slate-500 hover:text-yellow-600 hover:bg-slate-100'
            }`}>
              <Trophy size={18} />
            </Link>

            <button
              onClick={() => setMobileOpen((isOpen) => !isOpen)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? t('closeMobileMenu') : t('openMobileMenu')}
              className={`md:hidden p-2 rounded-lg ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}
              type="button"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={`md:hidden border-t py-3 ${
              darkMode ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
            }`}
          >
            <div className="px-4 space-y-1">
              {navItems.map((item) => (
                item.children ? (
                  <div key={item.labelKey}>
                    <button
                      aria-expanded={mobileAccordion === item.labelKey}
                      aria-haspopup="menu"
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                        darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
                      }`}
                      onClick={() => setMobileAccordion((current) => current === item.labelKey ? null : item.labelKey)}
                      type="button"
                    >
                      {t(item.labelKey)}
                      <ChevronDown size={14} className={`transition-transform ${mobileAccordion === item.labelKey ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {mobileAccordion === item.labelKey && (
                        <motion.div
                          {...accordionMotion}
                          className="overflow-hidden"
                          role="menu"
                        >
                          <div className="py-1">
                            {item.children.map((child) => (
                              <Link
                                key={child.href}
                                role="menuitem"
                                to={child.href}
                                onClick={() => {
                                  setMobileOpen(false);
                                  setMobileAccordion(null);
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
                                  isActive(child.href)
                                    ? 'text-green-400 bg-green-400/10'
                                    : darkMode
                                      ? 'text-slate-300 hover:bg-slate-800'
                                      : 'text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                {child.icon}{t(child.labelKey)}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    to={item.href!}
                    onClick={() => {
                      setMobileOpen(false);
                      setMobileAccordion(null);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                      isActive(item.href!)
                        ? 'text-green-400 bg-green-400/10'
                        : darkMode
                          ? 'text-slate-300 hover:bg-slate-800'
                          : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {t(item.labelKey)}
                  </Link>
                )
              ))}
              {isAuthenticated && isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => {
                    setMobileOpen(false);
                    setMobileAccordion(null);
                  }}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-black ${
                    isActive('/admin')
                      ? 'border-emerald-400/40 bg-emerald-400/15 text-emerald-300'
                      : darkMode
                        ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                        : 'border-emerald-500/20 bg-emerald-50 text-emerald-700'
                  }`}
                >
                  <Crown size={15} />
                  {t('navAdminPanel')}
                </Link>
              )}
              {isAuthenticated ? (
                <div className={`mt-3 space-y-3 border-t pt-3 ${
                  darkMode ? 'border-slate-700' : 'border-slate-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <Star size={14} className="text-yellow-400" />
                    <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{userXP} XP</span>
                    <span className="text-sm text-green-400">{t('level')} {level}</span>
                    <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>- {t('labsCount', { count: completedLabs.length })}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut || isLoggingOutAllDevices}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60 ${
                      darkMode
                        ? 'border-red-400/20 bg-red-400/10 text-red-200'
                        : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                    type="button"
                  >
                    <LogOut size={15} />
                    {isLoggingOut ? t('signingOut') : t('logout')}
                  </button>
                  <button
                    onClick={handleLogoutAllDevices}
                    disabled={isLoggingOut || isLoggingOutAllDevices}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60 ${
                      darkMode
                        ? 'border-orange-400/20 bg-orange-400/10 text-orange-100'
                        : 'border-orange-200 bg-orange-50 text-orange-700'
                    }`}
                    type="button"
                  >
                    <LogOut size={15} />
                    {isLoggingOutAllDevices ? t('loggingOutAllDevices') : t('logoutAllDevices')}
                  </button>
                </div>
              ) : (
                <div className={`mt-3 grid grid-cols-2 gap-2 border-t pt-3 ${
                  darkMode ? 'border-slate-700' : 'border-slate-200'
                }`}>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold ${
                      darkMode
                        ? 'border-slate-700 bg-slate-800/60 text-slate-100'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <LogIn size={15} />
                    {t('signIn')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 px-3 py-2 text-sm font-black text-slate-950 shadow-lg shadow-emerald-500/25"
                  >
                    <UserPlus size={15} />
                    {t('createAccount')}
                  </Link>
                </div>
              )}
              <div className={`mt-3 pt-3 border-t ${
                darkMode ? 'border-slate-700' : 'border-slate-200'
              }`}>
                <div className="flex items-center justify-between gap-3">
                  <span className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {t('language')}
                  </span>
                  <LanguageSwitcher compact />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

