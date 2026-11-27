import React, { useState } from 'react';
import {
  Filter,
  ArrowUpDown,
  RotateCcw,
  SlidersHorizontal,
  X,
  Check,
} from 'lucide-react';
import { ROLE_TAGS } from '../../data/itRoles';

export function CareerFilterBar({
  selectedTags = [],
  onToggleTag,
  sortBy = 'alphabetical-asc',
  onSortChange,
  totalMatching = 0,
  totalAvailable = 0,
  onResetFilters,
  hasActiveFilters = false,
}) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <div className="bg-card text-card-foreground border border-border rounded-2xl p-3 sm:p-4 shadow-xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Results Count & Mobile Toggle */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs sm:text-sm font-bold text-foreground">
            {totalMatching} of {totalAvailable} Career Roles
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer ml-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right: Sort Dropdown & Mobile Filter Button */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Mobile Filter Toggle */}
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-secondary text-foreground border border-border cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Tags ({selectedTags.length})</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-secondary text-foreground border border-border/80 focus:outline-none focus:ring-1 focus:ring-foreground cursor-pointer shadow-2xs"
            >
              <option value="alphabetical-asc">Sort: Title (A → Z)</option>
              <option value="alphabetical-desc">Sort: Title (Z → A)</option>
              <option value="salary-desc">Sort: Salary (Highest First)</option>
              <option value="salary-asc">Sort: Salary (Lowest First)</option>
              <option value="skills-desc">Sort: Most Skills Required</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Tag Filter Pills */}
      <div className="hidden md:flex flex-wrap items-center gap-1.5 pt-1 border-t border-border/60">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3" />
          <span>Role Focus:</span>
        </span>

        {ROLE_TAGS.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onToggleTag(tag)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-foreground text-background shadow-2xs'
                  : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-800'
              }`}
            >
              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              <span>{tag}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Collapsible Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="md:hidden pt-2 border-t border-border/60 space-y-2 animate-in fade-in-50 duration-150">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Filter by Role Focus Tags
          </span>
          <div className="flex flex-wrap gap-1.5">
            {ROLE_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onToggleTag(tag)}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-foreground text-background'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  <span>{tag}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
