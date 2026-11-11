import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { EMP } from '../../constants/vibeData';
import type { Tab } from '../../types';

interface EmptyStateProps {
  tab: Tab;
}

export default function EmptyState({ tab }: EmptyStateProps) {
  const navigate = useNavigate();
  const { setCur } = useApp();

  const handleOpenVibe = () => {
    setCur(0);
    navigate('/vibe');
  };

  return (
    <div className="p-7 border border-dashed border-white/[0.08] rounded-2xl text-t2 text-sm">
      <b className="block text-white text-[17px] mb-1">
        {EMP[tab]?.[0] ?? "No titles found"}
      </b>
      <p className="m-0 mb-3">
        {EMP[tab]?.[1] ?? "Try adjusting your vibe filters or category selection."}
      </p>
      {tab === "tonight" && (
        <button
          onClick={handleOpenVibe}
          className="py-1.5 px-4 rounded-full bg-am text-[#111] font-bold text-xs hover:brightness-110 transition-all"
        >
          Customize vibe
        </button>
      )}
    </div>
  );
}
