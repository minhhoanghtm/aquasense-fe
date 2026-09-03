import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import { routes } from './routes';

function App() {
  return (
    <>
      <Header />
      <div className="flex-1 w-full">
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
          <Route path="/monitoring" element={<Navigate to="/monitoring" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
