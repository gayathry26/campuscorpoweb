import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export function StatCard({ title, value, subtitle, icon: Icon, trend = null }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      whileInView={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      whileHover={shouldReduceMotion ? false : { y: -2, transition: { duration: 0.15 } }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="bg-card text-card-foreground rounded-xl border border-border p-4 sm:p-5 shadow-xs transition-colors hover:border-neutral-400 dark:hover:border-neutral-600"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="p-2 rounded-lg border border-border bg-secondary text-foreground">
            <Icon className="w-4 h-4 text-foreground" />
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{value}</span>
        {trend && (
          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-secondary text-foreground border border-border">
            {trend > 0 ? `+${trend}%` : `${trend}%`}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-muted-foreground font-normal leading-normal">{subtitle}</p>
      )}
    </motion.div>
  );
}

export default StatCard;
