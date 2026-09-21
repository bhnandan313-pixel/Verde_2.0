import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import InputEngine  from './pages/InputEngine';
import ResultsDash  from './pages/ResultsDash';
import SourcingDash from './pages/SourcingDash';
import AdvancedPage from './pages/AdvancedPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<InputEngine />} />
        <Route path="/advanced" element={<AdvancedPage />} />
        <Route path="/results"  element={<ResultsDash />} />
        <Route path="/sourcing" element={<SourcingDash />} />
        {/* Catch-all: redirect unknown routes to home */}
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
