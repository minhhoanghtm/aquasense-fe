import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import { routes } from './routes';

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <>
      {!isLoginPage && <Header />}
      <div className="flex-1 w-full flex flex-col">
        <Routes>
          {routes.map((route) => {
            const Component = route.element;
            return (
              <Route
                key={route.path}
                path={route.path}
                element={<Component />}
              />
            );
          })}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
