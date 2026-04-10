import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import App from './App';

const RateDetailPage = lazy(() => import('../pages/RateDetailPage'));
const StockKrDetailPage = lazy(() => import('../pages/StockKrDetailPage'));
const StockUsDetailPage = lazy(() => import('../pages/StockUsDetailPage'));
const BondKrDetailPage = lazy(() => import('../pages/BondKrDetailPage'));
const BondUsDetailPage = lazy(() => import('../pages/BondUsDetailPage'));
const FxDetailPage = lazy(() => import('../pages/FxDetailPage'));

export default function AppRouter() {
  return (
    <HashRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/rate" element={<RateDetailPage />} />
          <Route path="/stock-kr" element={<StockKrDetailPage />} />
          <Route path="/stock-us" element={<StockUsDetailPage />} />
          <Route path="/bond-kr" element={<BondKrDetailPage />} />
          <Route path="/bond-us" element={<BondUsDetailPage />} />
          <Route path="/fx" element={<FxDetailPage />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
