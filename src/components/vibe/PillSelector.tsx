import React from 'react';
import type { StepOpt } from '../../types';

interface PillSelectorProps {
  opts: StepOpt[];
  selectedSet: Set<string>;
  onToggle: (id: string) => void;
}

export default function PillSelector({ opts, selectedSet, onToggle }: PillSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {opts.map((o) => {
        const on = selectedSet.has(o.id);
        return (
          <button
            key={o.id}
            onClick={() => onToggle(o.id)}
            className={`inline-flex items-center h-12 px-[22px] rounded-full text-base font-medium transition-all active:scale-[0.96] border ${
              on
                ? "bg-am border-am text-[#111] font-semibold"
                : "bg-s1 border-white/[0.08] text-gray-300 hover:bg-s3"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
