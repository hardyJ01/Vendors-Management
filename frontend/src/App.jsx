import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/Auth';
import AuthPage from './pages/Auth';
import DashboardPage from './pages/Dashboard';

function App() {
  const { authToken } = useAuth();

  return (
    <Routes>
      <Route path="/" element={authToken ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
      <Route
        path="/dashboard"
        element={authToken ? <DashboardPage /> : <Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default App;
