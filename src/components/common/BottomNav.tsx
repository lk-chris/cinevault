import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Moon, Bookmark, Eye, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { wl, wd, setCur } = useApp();

  const currentPath = location.pathname;

  const navItems = [
    { path: '/tonight', label: 'Tonight', icon: <Moon size={20} /> },
    {
      path: '/watchlist',
      label: 'Watchlist',
      icon: <Bookmark size={20} />,
      badge: wl.size > 0 ? wl.size : null,
      badgeClass: 'bg-am text-[#111]'
    },
    {
      path: '/watched',
      label: 'Watched',
      icon: <Eye size={20} />,
      badge: wd.size > 0 ? wd.size : null,
      badgeClass: 'bg-white/20 text-white'
    },
  ];

  const handleVibeClick = () => {
    setCur(0);
    navigate('/vibe');
  };

  return (
    <nav className="fixed left-0 right-0 bottom-0 flex justify-around bg-[#141519]/[0.96] border-t border-white/[0.08] py-2 pb-[calc(8px+env(safe-area-inset-bottom,0px))] z-40 backdrop-blur-md">
      {navItems.map((item) => {
        const isActive = currentPath === item.path || (item.path === '/tonight' && currentPath === '/');
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`relative flex flex-col items-center gap-1 font-mono text-[11px] min-w-[64px] transition-colors ${
              isActive ? 'text-white font-medium' : 'text-t2 hover:text-white'
            }`}
          >
            {item.icon}
            {item.badge !== null && (
              <i
                className={`absolute -top-1 left-[calc(50%+5px)] min-w-4 h-4 px-1 rounded-full font-mono font-medium text-[10px] leading-4 text-center not-italic ${item.badgeClass}`}
              >
                {item.badge}
              </i>
            )}
            {item.label}
          </button>
        );
      })}

      <button
        onClick={handleVibeClick}
        className={`flex flex-col items-center gap-1 font-mono text-[11px] min-w-[64px] transition-colors ${
          currentPath === '/vibe' ? 'text-am font-medium' : 'text-t2 hover:text-white'
        }`}
      >
        <SlidersHorizontal size={20} />
        Vibe
      </button>
    </nav>
  );
}
