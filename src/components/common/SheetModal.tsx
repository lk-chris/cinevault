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
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
    >
      <div
        className="w-full max-w-[560px] max-h-[90vh] overflow-y-auto bg-s1 rounded-2xl p-5 border border-white/[0.08] shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {sheetContent}
      </div>
    </div>
  );
}
