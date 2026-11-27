import React from 'react';

/**
 * Universal Badge Component — CampusCorpo Burgundy & Warm Neutral Palette
 */
export function Badge({ children, variant = 'default', size = 'sm', className = '' }) {
  const variantStyles = {
    default: 'bg-[#F2EFF1] text-[#29252A] dark:bg-[#262126] dark:text-[#F7F6F7] border-[#EAE6E8] dark:border-white/10 font-medium',
    primary: 'bg-[#8B2942] text-white border-transparent font-semibold',
    burgundy: 'bg-[#F8EDF0] text-[#8B2942] dark:bg-[#312128] dark:text-[#F2B8C7] border-[#E5C8D0] dark:border-[#8B2942]/40 font-semibold',
    secondary: 'bg-[#F8EDF0] text-[#702038] dark:bg-[#2B2226] dark:text-[#F2D0D9] border-[#EAE6E8] dark:border-white/10 font-medium',
    outline: 'bg-transparent text-muted-foreground border-border font-medium',
    success: 'bg-[#26966B]/10 text-[#26966B] dark:text-[#34B383] border-[#26966B]/25 font-semibold',
    warning: 'bg-[#E5A13B]/12 text-[#B87A1E] dark:text-[#E5A13B] border-[#E5A13B]/30 font-semibold',
    danger: 'bg-[#B42318]/10 text-[#B42318] dark:text-[#F07178] border-[#B42318]/25 font-semibold',
    error: 'bg-[#B42318]/10 text-[#B42318] dark:text-[#F07178] border-[#B42318]/25 font-semibold',
    info: 'bg-[#F8EDF0] text-[#8B2942] dark:bg-[#312128] dark:text-[#F2B8C7] border-[#E5C8D0] dark:border-[#8B2942]/40 font-semibold',
    cyan: 'bg-[#26966B]/10 text-[#26966B] border-[#26966B]/25 font-semibold',
    purple: 'bg-[#F8EDF0] text-[#8B2942] dark:bg-[#312128] dark:text-[#F2B8C7] border-[#E5C8D0] font-semibold',
    coding: 'bg-[#F8EDF0] text-[#8B2942] border-[#E5C8D0] font-semibold',
    'non-coding': 'bg-[#26966B]/10 text-[#26966B] border-[#26966B]/25 font-semibold',
    creative: 'bg-[#F8EDF0] text-[#702038] border-[#E5C8D0] font-semibold',
    emerging: 'bg-[#F8EDF0] text-[#8B2942] border-[#E5C8D0] font-semibold',
    management: 'bg-[#E5A13B]/12 text-[#B87A1E] border-[#E5A13B]/30 font-semibold',
    hybrid: 'bg-[#26966B]/10 text-[#26966B] border-[#26966B]/25 font-semibold',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 leading-tight',
    md: 'text-xs px-2.5 py-1 leading-tight',
    lg: 'text-sm px-3 py-1 leading-tight',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border transition-colors ${
        variantStyles[variant] || variantStyles.default
      } ${sizeStyles[size] || sizeStyles.sm} ${className}`}
    >
      {children}
    </span>
  );
}

export function CategoryBadge({ category, children, size = 'sm', className = '' }) {
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
    SELECTED: { variant: 'success', label: 'Selected' },
    ACCEPTED: { variant: 'success', label: 'Accepted' },
    OFFERED: { variant: 'burgundy', label: 'Offered' },
    SHORTLISTED: { variant: 'burgundy', label: 'Shortlisted' },
    INTERVIEW: { variant: 'warning', label: 'Interview' },
    IN_PROCESS: { variant: 'warning', label: 'In Process' },
    APPLIED: { variant: 'default', label: 'Applied' },
    REGISTERED: { variant: 'default', label: 'Registered' },
    REJECTED: { variant: 'danger', label: 'Rejected' },
    SUPER_DREAM: { variant: 'primary', label: 'Super Dream' },
    DREAM: { variant: 'burgundy', label: 'Dream' },
    REGULAR: { variant: 'default', label: 'Regular' },
    UPCOMING: { variant: 'warning', label: 'Upcoming' },
    COMPLETED: { variant: 'success', label: 'Completed' },
    VERIFIED: { variant: 'success', label: 'Verified' },
    CONFIRMED: { variant: 'success', label: 'Confirmed' },
    PENDING: { variant: 'warning', label: 'Pending' },
  };

  const key = typeof status === 'string' ? status.toUpperCase().replace(/\s+/g, '_') : '';
  const item = map[key] || { variant: 'default', label: status || 'Pending' };

  return (
    <Badge variant={item.variant} className={className}>
      {item.label}
    </Badge>
  );
}

export default Badge;
