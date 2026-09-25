import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import MainLayout from './components/MainLayout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import { routes, type RouteConfig } from './routes';

function renderRoutes(routeList: RouteConfig[]) {
  return routeList.map((route, idx) => {
    const Component = route.element;
    if (route.children && route.children.length > 0) {
      return (
        <Route key={route.path || idx} path={route.path} element={<Component />}>
          {renderRoutes(route.children)}
        </Route>
      );
    }
    if (route.index) {
      return <Route key={`index-${idx}`} index element={<Component />} />;
    }
    return (
      <Route
        key={route.path || idx}
        path={route.path}
        element={<Component />}
      />
    );
  });
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route element={<MainLayout />}>
        {renderRoutes(routes.filter((r) => r.path !== '/login' && r.path !== '/forgot-password'))}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
