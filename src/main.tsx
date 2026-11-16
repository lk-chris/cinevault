import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AdminApp from './admin/AdminApp';
import './styles/index.css';

const isAdmin = location.pathname.startsWith('/admin') || location.hash.startsWith('#/admin');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isAdmin ? <AdminApp /> : <App />}
  </React.StrictMode>
);
