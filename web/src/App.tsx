import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import MainLayout from './components/MainLayout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import { routes, type RouteConfig } from './routes';
import { getCurrentUser } from './services/authApi';
import { useEffect, useState } from 'react';
import type { User } from './types/User';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const [user, setUser] = useState<User | null>(getCurrentUser());

  useEffect(() => {
    const handleStorageUpdate = () => {
      setUser(getCurrentUser());
    };
    window.addEventListener("storage", handleStorageUpdate);
    return () => window.removeEventListener("storage", handleStorageUpdate);
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && (!user.role || !allowedRoles.includes(user.role))) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}

function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      <h1 className="text-4xl font-bold text-[var(--critical)] mb-4">403</h1>
      <h2 className="text-xl font-semibold text-[var(--text-heading)] mb-2">Không có quyền truy cập</h2>
      <p className="text-[var(--text-body)] mb-6">Bạn không có quyền xem trang này. Vui lòng liên hệ quản trị viên.</p>
      <button 
        onClick={() => window.history.back()}
        className="px-4 py-2 bg-[var(--accent)] text-[var(--text-on-accent)] rounded-lg font-medium hover:opacity-90"
      >
        Quay lại
      </button>
    </div>
  );
}

function renderRoutes(routeList: RouteConfig[]) {
  return routeList.map((route, idx) => {
    const Component = route.element;
    if (route.children && route.children.length > 0) {
      return (
        <Route key={route.path || idx} path={route.path} element={<ProtectedRoute allowedRoles={route.allowedRoles}><Component /></ProtectedRoute>}>
          {renderRoutes(route.children)}
        </Route>
      );
    }
    if (route.index) {
      return <Route key={`index-${idx}`} index element={<ProtectedRoute allowedRoles={route.allowedRoles}><Component /></ProtectedRoute>} />;
    }
    return (
      <Route
        key={route.path || idx}
        path={route.path}
        element={<ProtectedRoute allowedRoles={route.allowedRoles}><Component /></ProtectedRoute>}
      />
    );
  });
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/403" element={<MainLayout />} >
         <Route index element={<UnauthorizedPage />} />
      </Route>
      <Route element={<MainLayout />}>
        {renderRoutes(routes.filter((r) => r.path !== '/login' && r.path !== '/forgot-password'))}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
