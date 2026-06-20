import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppStore } from '../../store/useAppStore';

export function AdminRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { darkMode } = useAppStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className={`min-h-[55vh] flex items-center justify-center ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className={`h-16 w-16 rounded-2xl animate-pulse ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

