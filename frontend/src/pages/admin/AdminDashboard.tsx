import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Users,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAppStore } from '../../store/useAppStore';

type AdminMetrics = {
  total_registered: number;
  admin_users: number;
  suspended_users: number;
  resolved_flags: number;
  correct_submissions: number;
  failed_submissions: number;
};

type AdminUser = {
  id: number | string;
  username: string | null;
  name: string | null;
  email: string | null;
  role: string;
  suspended_at: string | null;
  created_at: string | null;
  completed_labs: number | string;
};

type SubmissionLog = {
  id: number | string;
  user_id: number | string | null;
  username: string | null;
  email: string | null;
  lab_key: string;
  was_correct: boolean | 0 | 1;
  ip_digest: string | null;
  user_agent_digest: string | null;
  created_at: string | null;
};

type UsersPayload = {
  data: AdminUser[];
  current_page?: number;
  last_page?: number;
  total?: number;
};

const emptyMetrics: AdminMetrics = {
  total_registered: 0,
  admin_users: 0,
  suspended_users: 0,
  resolved_flags: 0,
  correct_submissions: 0,
  failed_submissions: 0,
};

export function AdminDashboard() {
  const { apiFetch, user: currentUser } = useAuth();
  const { darkMode } = useAppStore();
  const { direction, locale } = useLanguage();
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [metrics, setMetrics] = useState<AdminMetrics>(emptyMetrics);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<SubmissionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyUserId, setBusyUserId] = useState<number | string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const labels = useMemo(() => {
    if (locale === 'fa') {
      return {
        title: 'کنترل مرکزی ادمین',
        subtitle: 'مدیریت کاربران، نقش‌ها و پایش رویدادهای امنیتی آزمایشگاه',
        users: 'مدیریت کاربران',
        logs: 'لاگ‌های امنیتی',
        totalUsers: 'کل کاربران',
        admins: 'ادمین‌ها',
        suspended: 'تعلیق‌شده',
        resolved: 'فلگ‌های حل‌شده',
        name: 'کاربر',
        email: 'ایمیل',
        role: 'نقش',
        status: 'وضعیت',
        completed: 'لاب‌های کامل',
        actions: 'عملیات',
        active: 'فعال',
        admin: 'ادمین',
        user: 'کاربر',
        makeAdmin: 'ارتقا به ادمین',
        removeAdmin: 'حذف نقش ادمین',
        suspend: 'تعلیق',
        restore: 'بازگردانی',
        current: 'شما',
        lab: 'لاب',
        result: 'نتیجه',
        time: 'زمان',
        success: 'موفق',
        failed: 'ناموفق',
        noRows: 'داده‌ای برای نمایش وجود ندارد.',
      };
    }

    return {
      title: 'Admin Command Center',
      subtitle: 'Manage users, roles, and live security training audit events.',
      users: 'User Management',
      logs: 'Security Audit Logs',
      totalUsers: 'Total users',
      admins: 'Admins',
      suspended: 'Suspended',
      resolved: 'Resolved flags',
      name: 'User',
      email: 'Email',
      role: 'Role',
      status: 'Status',
      completed: 'Completed labs',
      actions: 'Actions',
      active: 'Active',
      admin: 'Admin',
      user: 'User',
      makeAdmin: 'Make admin',
      removeAdmin: 'Remove admin',
      suspend: 'Suspend',
      restore: 'Restore',
      current: 'You',
      lab: 'Lab',
      result: 'Result',
      time: 'Time',
      success: 'Success',
      failed: 'Failed',
      noRows: 'No records to display yet.',
    };
  }, [locale]);

  const loadAdminData = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const [metricsPayload, usersPayload, logsPayload] = await Promise.all([
        apiFetch<{ data: AdminMetrics }>('/admin/metrics'),
        apiFetch<{ data: UsersPayload }>('/admin/users?per_page=25'),
        apiFetch<{ data: SubmissionLog[] }>('/admin/logs?limit=50'),
      ]);

      setMetrics(metricsPayload.data);
      setUsers(usersPayload.data.data);
      setLogs(logsPayload.data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load admin data.');
    } finally {
      setIsLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    void loadAdminData();
  }, [loadAdminData]);

  const updateUser = async (targetUser: AdminUser, payload: { role?: string; suspended?: boolean }) => {
    setBusyUserId(targetUser.id);
    setError(null);

    try {
      const response = await apiFetch<{ data: { user: AdminUser } }>(`/admin/users/${targetUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      setUsers((current) => current.map((row) => (
        row.id === targetUser.id ? { ...row, ...response.data.user } : row
      )));
      void loadAdminData();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'User update failed.');
    } finally {
      setBusyUserId(null);
    }
  };

  const metricCards = [
    { label: labels.totalUsers, value: metrics.total_registered, icon: <Users size={18} />, tone: 'from-cyan-400 to-blue-500' },
    { label: labels.admins, value: metrics.admin_users, icon: <ShieldCheck size={18} />, tone: 'from-emerald-400 to-green-500' },
    { label: labels.suspended, value: metrics.suspended_users, icon: <AlertTriangle size={18} />, tone: 'from-amber-400 to-orange-500' },
    { label: labels.resolved, value: metrics.resolved_flags, icon: <CheckCircle2 size={18} />, tone: 'from-fuchsia-400 to-pink-500' },
  ];

  return (
    <main
      dir={direction}
      className={`min-h-screen overflow-hidden px-4 py-10 sm:px-6 lg:px-8 ${
        darkMode
          ? 'bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_32%),#020617]'
          : 'bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.13),transparent_32%),#f8fafc]'
      }`}
    >
      <div className="mx-auto max-w-7xl">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className={`relative overflow-hidden rounded-[2rem] border p-6 shadow-2xl sm:p-8 ${
            darkMode
              ? 'border-emerald-400/20 bg-slate-900/70 shadow-emerald-950/40'
              : 'border-emerald-200 bg-white/85 shadow-slate-200'
          }`}
        >
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(16,185,129,0.16),transparent_42%,rgba(34,211,238,0.10))]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="text-start">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-emerald-300">
                <Activity size={14} />
                Admin API
              </span>
              <h1 className={`mt-5 text-3xl font-black tracking-tight sm:text-5xl ${darkMode ? 'text-white' : 'text-slate-950'}`}>
                {labels.title}
              </h1>
              <p className={`mt-3 max-w-2xl text-sm leading-7 sm:text-base ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {labels.subtitle}
              </p>
            </div>

            <div className={`rounded-2xl border px-4 py-3 text-start ${
              darkMode ? 'border-slate-700 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
            }`}>
              <p className={`text-xs font-semibold uppercase tracking-widest ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Signed in
              </p>
              <p className={`mt-1 font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {currentUser?.name ?? currentUser?.username ?? currentUser?.email ?? 'Admin'}
              </p>
            </div>
          </div>
        </motion.section>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-start text-sm font-semibold text-red-300">
            {error}
          </div>
        )}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((card) => (
            <div
              key={card.label}
              className={`rounded-3xl border p-5 text-start ${
                darkMode ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-white'
              }`}
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${card.tone} text-white shadow-lg`}>
                {card.icon}
              </div>
              <div className={`mt-5 text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-950'}`}>
                {isLoading ? '...' : card.value.toLocaleString(locale)}
              </div>
              <div className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {card.label}
              </div>
            </div>
          ))}
        </section>

        <section className={`mt-6 rounded-[1.75rem] border p-3 ${
          darkMode ? 'border-slate-800 bg-slate-900/75' : 'border-slate-200 bg-white'
        }`}>
          <div className="flex flex-wrap items-center gap-2 p-2">
            {(['users', 'logs'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-2xl px-4 py-2 text-sm font-bold transition-colors ${
                  activeTab === tab
                    ? 'bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : darkMode
                      ? 'text-slate-300 hover:bg-slate-800'
                      : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab === 'users' ? labels.users : labels.logs}
              </button>
            ))}
          </div>

          {activeTab === 'users' ? (
            <div className="overflow-x-auto p-2">
              <table className="min-w-full border-separate border-spacing-y-2 text-start text-sm">
                <thead>
                  <tr className={darkMode ? 'text-slate-400' : 'text-slate-500'}>
                    {[labels.name, labels.email, labels.role, labels.status, labels.completed, labels.actions].map((heading) => (
                      <th key={heading} className="px-4 py-3 text-start font-bold">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} className={`rounded-2xl px-4 py-8 text-center ${darkMode ? 'bg-slate-950 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                        {labels.noRows}
                      </td>
                    </tr>
                  )}
                  {users.map((row) => {
                    const isCurrentUser = String(row.id) === String(currentUser?.id);
                    const isBusy = busyUserId === row.id;

                    return (
                      <tr key={row.id} className={darkMode ? 'bg-slate-950/70' : 'bg-slate-50'}>
                        <td className="rounded-s-2xl px-4 py-4">
                          <div className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{row.name ?? row.username ?? 'Unknown'}</div>
                          {row.name && row.username && <div className="mt-1 text-xs opacity-70">@{row.username}</div>}
                          {isCurrentUser && <div className="mt-1 text-xs font-semibold text-emerald-400">{labels.current}</div>}
                        </td>
                        <td className={`px-4 py-4 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{row.email ?? '-'}</td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-black ${
                            row.role === 'admin'
                              ? 'bg-emerald-400/15 text-emerald-300'
                              : darkMode
                                ? 'bg-slate-800 text-slate-300'
                                : 'bg-slate-200 text-slate-700'
                          }`}>
                            {row.role === 'admin' ? labels.admin : labels.user}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-black ${
                            row.suspended_at
                              ? 'bg-red-500/15 text-red-300'
                              : 'bg-cyan-400/15 text-cyan-300'
                          }`}>
                            {row.suspended_at ? labels.suspended : labels.active}
                          </span>
                        </td>
                        <td className={`px-4 py-4 font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                          {Number(row.completed_labs ?? 0).toLocaleString(locale)}
                        </td>
                        <td className="rounded-e-2xl px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={isBusy || isCurrentUser}
                              onClick={() => updateUser(row, { role: row.role === 'admin' ? 'user' : 'admin' })}
                              className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-300 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {row.role === 'admin' ? labels.removeAdmin : labels.makeAdmin}
                            </button>
                            <button
                              type="button"
                              disabled={isBusy || isCurrentUser}
                              onClick={() => updateUser(row, { suspended: !row.suspended_at })}
                              className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs font-black text-amber-300 transition hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {row.suspended_at ? labels.restore : labels.suspend}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid gap-3 p-2">
              {logs.length === 0 && (
                <div className={`rounded-2xl px-4 py-8 text-center ${darkMode ? 'bg-slate-950 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                  {labels.noRows}
                </div>
              )}
              {logs.map((log) => {
                const passed = log.was_correct === true || log.was_correct === 1;

                return (
                  <div
                    key={log.id}
                    className={`grid gap-4 rounded-2xl border p-4 text-start md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-center ${
                      darkMode ? 'border-slate-800 bg-slate-950/70' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className={`text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {labels.lab}
                      </div>
                      <div className={`mt-1 font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{log.lab_key}</div>
                    </div>
                    <div className={darkMode ? 'text-slate-300' : 'text-slate-600'}>
                      <div className="font-bold">{log.username ?? log.email ?? `User #${log.user_id ?? '-'}`}</div>
                      <div className="mt-1 text-xs opacity-70">{log.email ?? log.ip_digest ?? '-'}</div>
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {log.created_at ? new Date(log.created_at).toLocaleString(locale) : '-'}
                    </div>
                    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-black ${
                      passed ? 'bg-emerald-400/15 text-emerald-300' : 'bg-red-500/15 text-red-300'
                    }`}>
                      {passed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      {passed ? labels.success : labels.failed}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

