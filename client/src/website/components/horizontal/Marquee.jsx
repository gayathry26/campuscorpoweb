import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';

export default function Marquee({ items = [], speed = 28 }) {
  const prefersReducedMotion = useReducedMotion();

  // Duplicate list to achieve continuous, seamless infinite loop
  const duplicatedItems = [...items, ...items];

  return (
    <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] py-2">
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-400 font-semibold pl-2 flex-shrink-0">
          Also Included:
        </span>

        {prefersReducedMotion ? (
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            {items.map((item) => (
              <Link
                key={item.id}
                to={`/career-explorer?domain=${item.id}`}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-200 bg-white hover:border-neutral-950 text-xs font-medium text-neutral-700 hover:text-neutral-950 transition-colors flex-shrink-0"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
        ) : (
          <motion.div
            className="flex items-center gap-3 flex-shrink-0 hover:[animation-play-state:paused]"
            animate={{ x: ['0%', '-50%'] }}
            transition={{
              ease: 'linear',
              duration: speed,
              repeat: Infinity,
            }}
          >
            {duplicatedItems.map((item, idx) => (
              <Link
                key={`${item.id}-${idx}`}
                to={`/career-explorer?domain=${item.id}`}
                className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-200/90 bg-[#FAFAFA] hover:bg-neutral-950 hover:border-neutral-950 hover:text-white text-xs font-medium text-neutral-700 transition-all duration-200 flex-shrink-0 shadow-2xs"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-300 group-hover:bg-emerald-400 transition-colors" />
                <span>{item.title}</span>
                <span className="text-[10px] font-mono text-neutral-400 group-hover:text-neutral-400">
                  {item.roleCount} roles
                </span>
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
