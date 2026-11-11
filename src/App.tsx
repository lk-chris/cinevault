import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import FeedPage from './pages/FeedPage';
import VibePage from './pages/VibePage';
import DetailPage from './pages/DetailPage';
import Toast from './components/common/Toast';
import SheetModal from './components/common/SheetModal';

// Automatically scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<FeedPage tab="tonight" />} />
          <Route path="/tonight" element={<FeedPage tab="tonight" />} />
          <Route path="/watchlist" element={<FeedPage tab="wl" />} />
          <Route path="/watched" element={<FeedPage tab="wd" />} />
          <Route path="/vibe" element={<VibePage />} />
          <Route path="/title/:id" element={<DetailPage />} />
          {/* Wildcard fallback to tonight's feed */}
          <Route path="*" element={<Navigate to="/tonight" replace />} />
        </Routes>

        {/* Global Toast & Sheet Modal */}
        <Toast />
        <SheetModal />
      </HashRouter>
    </AppProvider>
  );
}
