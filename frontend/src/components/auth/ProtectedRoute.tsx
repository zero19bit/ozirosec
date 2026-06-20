import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppStore } from '../../store/useAppStore';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const darkMode = useAppStore((state) => state.darkMode);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className={`min-h-[60vh] px-4 py-10 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="mx-auto max-w-5xl space-y-4">
          <div className={`h-10 w-56 animate-pulse rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className={`h-36 animate-pulse rounded-2xl border ${
                  darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

