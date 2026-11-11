import React from 'react';
import { useApp } from '../../context/AppContext';

export default function SheetModal() {
  const { sheetContent, setSheetContent } = useApp();

  if (!sheetContent) return null;

  return (
    <div
      id="sh"
      onClick={(e) => {
        if ((e.target as HTMLElement).id === "sh") setSheetContent(null);
      }}
      className="fixed inset-0 z-50 bg-black/75 flex items-end justify-center backdrop-blur-sm"
    >
      <div
        className="w-full max-w-[540px] bg-s1 rounded-t-[24px] p-5 pb-[calc(24px+env(safe-area-inset-bottom,0px))] border border-white/[0.08] animate-in fade-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {sheetContent}
      </div>
    </div>
  );
}
