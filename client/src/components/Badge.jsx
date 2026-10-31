import React from 'react';

/**
 * Universal Badge Component for Categories, Statuses, and Career Domains
 * - Consistent accessible contrast in both light and dark mode
 * - Clean micro-pill aesthetic with subtle borders
 */
export function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const variantStyles = {
    default: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 border-border font-medium',
    primary: 'bg-[#171717] text-[#fafafa] dark:bg-[#fafafa] dark:text-[#0a0a0a] border-transparent font-semibold shadow-2xs',
    secondary: 'bg-secondary text-secondary-foreground border-border font-medium',
    outline: 'bg-transparent text-muted-foreground border-border font-medium',
    success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-semibold',
    warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 font-semibold',
    danger: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30 font-semibold',
    error: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30 font-semibold',
    info: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30 font-semibold',
    cyan: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 font-semibold',
    purple: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 font-semibold',
    coding: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 font-semibold',
    'non-coding': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-semibold',
    creative: 'bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/30 font-semibold',
    emerging: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 font-semibold',
    management: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 font-semibold',
    hybrid: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30 font-semibold',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 leading-tight',
    md: 'text-xs px-2.5 py-0.5 leading-tight',
    lg: 'text-sm px-3.5 py-1 leading-tight',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border transition-colors ${
        variantStyles[variant] || variantStyles.default
      } ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      {children}
    </span>
  );
}

export function CategoryBadge({ category, children, size = 'md', className = '' }) {
  const norm = (category || '').toLowerCase().replace(/\s+/g, '-');
  return (
    <Badge variant={norm} size={size} className={className}>
      {children || category}
    </Badge>
  );
}

export function StatusBadge({ status, className = '' }) {
  const map = {
    ACTIVE: { variant: 'success', label: 'Active' },
    PLACED: { variant: 'success', label: 'Placed' },
    ACCEPTED: { variant: 'success', label: 'Accepted' },
    OFFERED: { variant: 'info', label: 'Offered' },
    SHORTLISTED: { variant: 'info', label: 'Shortlisted' },
    IN_PROCESS: { variant: 'warning', label: 'In Process' },
    APPLIED: { variant: 'default', label: 'Applied' },
    REGISTERED: { variant: 'default', label: 'Registered' },
    REJECTED: { variant: 'danger', label: 'Rejected' },
    SUPER_DREAM: { variant: 'purple', label: 'Super Dream' },
    DREAM: { variant: 'info', label: 'Dream' },
    REGULAR: { variant: 'default', label: 'Regular' },
    UPCOMING: { variant: 'warning', label: 'Upcoming' },
    COMPLETED: { variant: 'success', label: 'Completed' },
    VERIFIED: { variant: 'success', label: 'Verified' },
    PENDING: { variant: 'warning', label: 'Pending' },
  };

  const item = map[status] || { variant: 'default', label: status || 'Pending' };

  return <Badge variant={item.variant} className={className}>{item.label}</Badge>;
}

export default Badge;
