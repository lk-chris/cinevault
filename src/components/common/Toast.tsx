import React from 'react';
import { useApp } from '../../context/AppContext';

export default function Toast() {
  const { toastMsg } = useApp();

  return (
    <div
      className={`fixed left-1/2 z-[60] bg-s3 border border-white/[0.08] py-2.5 px-[18px] rounded-full text-sm transition-all duration-300 pointer-events-none ${
        toastMsg
          ? "top-[max(18px,env(safe-area-inset-top))] -translate-x-1/2 translate-y-0 opacity-100"
          : "top-[max(18px,env(safe-area-inset-top))] -translate-x-1/2 -translate-y-20 opacity-0"
      }`}
    >
      {toastMsg}
    </div>
  );
}
