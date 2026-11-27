import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DollarSign, TrendingUp, Info } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function CompactSalaryRangeChart({ roles = [], domainName = '' }) {
  const { isDark } = useTheme();

  // Extract accurate min and max LPA for each role
  const validSalaryRoles = useMemo(() => {
    const list = [];
    roles.forEach((r) => {
      const stats = r.stats || {};
      let min = stats.minLpa;
      let max = stats.maxLpa;

      if ((min === undefined || max === undefined) && stats.averageSalary) {
        const m = String(stats.averageSalary).match(/([\d.]+)\s*-\s*[^\d]*([\d.]+)/);
        if (m) {
          min = parseFloat(m[1]);
          max = parseFloat(m[2]);
        }
      }

      if (
        typeof min === 'number' &&
        typeof max === 'number' &&
        !isNaN(min) &&
        !isNaN(max) &&
        max > 0 &&
        max >= min
      ) {
        const spread = parseFloat((max - min).toFixed(1));
        list.push({
          id: r.id,
          title: r.title,
          shortTitle: r.title.length > 20 ? `${r.title.slice(0, 18)}…` : r.title,
          minLpa: min,
          rangeLpa: Math.max(0.4, spread),
          maxLpa: max,
          rangeText: `₹${min} - ₹${max} LPA`,
        });
      }
    });

    return list.sort((a, b) => b.maxLpa - a.maxLpa);
  }, [roles]);

  // Case 0: No salary data at all -> completely hide chart
  if (validSalaryRoles.length === 0) {
    return null;
  }

  // Case 1: Exactly 1 role with salary -> show compact summary card, not an oversized SVG
  if (validSalaryRoles.length === 1) {
    const roleSalary = validSalaryRoles[0];
    return (
      <div className="bg-card border border-border rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground">
              {roleSalary.title} Campus Placement Benchmark
            </div>
            <div className="text-[11px] text-muted-foreground">
              Official institutional recruitment compensation spread
            </div>
          </div>
        </div>
        <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
          {roleSalary.rangeText}
        </div>
      </div>
    );
  }

  // Case 2 & 3: 2 or more roles -> render compact horizontal floating range chart
  const lowestEntry = [...validSalaryRoles].sort((a, b) => a.minLpa - b.minLpa)[0];
  const highestCeiling = validSalaryRoles[0];

  // Dynamic height strictly bounded based on number of items
  // 2 roles: 120px; 3 roles: 155px; 4-6 roles: 190px
  const dynamicHeight = Math.max(120, Math.min(240, validSalaryRoles.length * 40 + 40));

  const strokeColor = isDark ? '#262626' : '#e5e5e5';
  const textColor = isDark ? '#a1a1a1' : '#737373';
  const tooltipBg = isDark ? '#171717' : '#ffffff';
  const tooltipBorder = isDark ? '#404040' : '#e5e5e5';

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-border/70">
        <div>
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xs sm:text-sm font-bold text-foreground">
              Salary Range Comparison (Floating Spread)
            </h3>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Floating horizontal bars depict the campus placement minimum and maximum LPA for each role:
          </p>
        </div>

        {/* High / Low summary badges */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-2.5 py-1 rounded-md bg-secondary text-foreground text-[11px] font-semibold border border-border/80">
            <span className="text-muted-foreground mr-1">Entry Baseline:</span>
            <span className="font-bold">₹{lowestEntry.minLpa} LPA</span>
          </div>
          <div className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold border border-emerald-500/20">
            <span className="text-muted-foreground mr-1">Top Ceiling:</span>
            <span className="font-bold">₹{highestCeiling.maxLpa} LPA</span>
          </div>
        </div>
      </div>

      {/* Floating Range Chart (Stacked: Transparent Base + Range Bar) */}
      <div style={{ height: `${dynamicHeight}px` }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={validSalaryRoles}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={strokeColor} />
            <XAxis
              type="number"
              unit=" LPA"
              stroke={textColor}
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              dataKey="shortTitle"
              type="category"
              stroke={textColor}
              fontSize={11}
              width={130}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                borderColor: tooltipBorder,
                borderRadius: '10px',
                fontSize: '11px',
                color: isDark ? '#ffffff' : '#000000',
                boxShadow: '0 8px 20px -4px rgba(0,0,0,0.25)',
              }}
              formatter={(val, name, item) => [
                `${item.payload.rangeText} (Spread: ₹${(item.payload.maxLpa - item.payload.minLpa).toFixed(1)} LPA)`,
                'Compensation Band',
              ]}
              labelFormatter={(label, payload) => {
                return payload?.[0]?.payload?.title || label;
              }}
            />
            {/* Transparent base bar starts at 0 and ends at minLpa */}
            <Bar
              dataKey="minLpa"
              stackId="salary"
              fill="transparent"
              name="Baseline Minimum"
              isAnimationActive={false}
            />
            {/* Visible floating bar starts at minLpa and ends at maxLpa */}
            <Bar
              dataKey="rangeLpa"
              stackId="salary"
              fill="#10b981"
              radius={[0, 5, 5, 0]}
              name="Salary Range"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CompactSalaryRangeChart;
