import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface DetailHeaderProps {
  title: string;
  loading?: boolean;
}

export default function DetailHeader({ title, loading }: DetailHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/tonight');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0A0A0C]/95 backdrop-blur-md border-b border-white/[0.08] px-4 pt-[max(12px,env(safe-area-inset-top))] pb-2.5">
      <div className="max-w-[1100px] mx-auto flex items-center justify-between">
        <button
          onClick={handleBack}
          aria-label="Back"
          className="w-10 h-10 rounded-full bg-s1 border border-white/[0.08] grid place-items-center backdrop-blur-md hover:bg-s2 transition-colors text-white"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="text-sm font-semibold truncate max-w-[200px] sm:max-w-[420px] text-gray-200">
          {title}
        </div>
        <div className="w-10 flex justify-end">
          {loading && (
            <div className="w-4 h-4 rounded-full border-2 border-am border-t-transparent animate-spin" />
          )}
        </div>
      </div>
    </header>
  );
}
