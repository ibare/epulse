import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import App from './App';

const RateDetailPage = lazy(() => import('../pages/RateDetailPage'));

export default function AppRouter() {
  return (
    <HashRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/rate" element={<RateDetailPage />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
