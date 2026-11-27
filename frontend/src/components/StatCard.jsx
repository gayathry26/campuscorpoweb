import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export function StatCard({ title, value, subtitle, icon: Icon, trend = null, accent = false }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
      whileInView={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      whileHover={shouldReduceMotion ? false : { y: -2, transition: { duration: 0.14 } }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={`bg-card text-card-foreground rounded-xl border border-border p-4 shadow-2xs transition-all hover:border-[#8B2942]/30 hover:shadow-xs ${
        accent ? 'border-t-2 border-t-[#8B2942]' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider leading-tight">
          {title}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-[#F8EDF0] dark:bg-[#312128] text-[#8B2942] dark:text-[#F2B8C7] flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 stroke-[1.9]" />
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          {value ?? 0}
        </span>
        {trend !== null && trend !== undefined && (
          <span
            className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${
              trend >= 0
                ? 'bg-[#26966B]/10 text-[#26966B]'
                : 'bg-[#B42318]/10 text-[#B42318]'
            }`}
          >
            {trend > 0 ? `+${trend}%` : `${trend}%`}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-muted-foreground font-normal leading-snug truncate">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

export default StatCard;
