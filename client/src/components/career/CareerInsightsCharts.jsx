import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  PieChart as PieIcon,
  DollarSign,
  Cpu,
  BarChart2,
  TrendingUp,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const PIE_PALETTE = [
  '#0284c7', // Sky
  '#8b5cf6', // Violet
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#84cc16', // Lime
  '#d97706', // Warm amber
  '#64748b', // Slate
];

export function CareerInsightsCharts({
  roles = [],
  activeCategory = 'All Domains',
  onSelectCategory,
}) {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('domains'); // 'domains' | 'salaries' | 'skills'
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 1. Data for Domain Distribution Chart
  const domainDistributionData = useMemo(() => {
    const counts = {};
    roles.forEach((r) => {
      const cat = r.category || 'Uncategorized';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: roles.length > 0 ? Math.round((count / roles.length) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [roles]);

  // 2. Data for Salary Comparison Chart
  const salaryComparisonData = useMemo(() => {
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

      if (typeof min === 'number' && typeof max === 'number' && !isNaN(min) && !isNaN(max)) {
        list.push({
          id: r.id,
          title: r.title,
          shortTitle: r.title.length > 22 ? `${r.title.slice(0, 20)}…` : r.title,
          category: r.category,
          minLpa: min,
          maxLpa: max,
          spreadLpa: parseFloat((max - min).toFixed(1)),
          rangeText: `₹${min} - ₹${max} LPA`,
        });
      }
    });

    return list.sort((a, b) => b.maxLpa - a.maxLpa);
  }, [roles]);

  // Highest & Lowest salary highlight
  const salaryHighlights = useMemo(() => {
    if (salaryComparisonData.length === 0) return null;
    const highest = salaryComparisonData[0];
    const lowest = [...salaryComparisonData].sort((a, b) => a.minLpa - b.minLpa)[0];
    return { highest, lowest };
  }, [salaryComparisonData]);

  // 3. Data for Skill Landscape Chart
  const skillLandscapeData = useMemo(() => {
    const counts = {};
    roles.forEach((r) => {
      const skills = r.technicalSkills || [];
      skills.forEach((s) => {
        // Clean skill label
        const clean = s.split('/')[0].split('(')[0].trim();
        counts[clean] = (counts[clean] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .map(([skill, count]) => ({
        skill,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [roles]);

  // Chart theme colors
  const strokeColor = isDark ? '#262626' : '#e5e5e5';
  const textColor = isDark ? '#a1a1a1' : '#737373';
  const tooltipBg = isDark ? '#171717' : '#ffffff';
  const tooltipBorder = isDark ? '#404040' : '#e5e5e5';

  return (
    <div className="bg-card text-card-foreground border border-border rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
      {/* Header and View Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-foreground" />
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
            Career Discovery Insights
          </h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border/60">
            {activeCategory}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="flex items-center bg-secondary/80 p-0.5 rounded-xl border border-border/60 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('domains')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'domains'
                  ? 'bg-card text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>Domain Distribution</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('salaries')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'salaries'
                  ? 'bg-card text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Salary Benchmarks</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('skills')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'skills'
                  ? 'bg-card text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Skill Landscape</span>
            </button>
          </div>

          {/* Collapse Toggle */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary cursor-pointer"
            title={isCollapsed ? 'Expand insights' : 'Collapse insights'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="pt-2 animate-in fade-in duration-200">
          {/* TAB 1: DOMAIN DISTRIBUTION (DONUT CHART) */}
          {activeTab === 'domains' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <p>
                  Distribution of {roles.length} roles across catalogued domains. Click a slice to filter.
                </p>
                {activeCategory !== 'All Domains' && (
                  <button
                    type="button"
                    onClick={() => onSelectCategory('All Domains')}
                    className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer"
                  >
                    View All Domains
                  </button>
                )}
              </div>

              {domainDistributionData.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  No domain distribution data available for current selection.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
                  {/* Donut Chart */}
                  <div className="lg:col-span-2 h-64 sm:h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={domainDistributionData}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={95}
                          paddingAngle={3}
                          onClick={(entry) => onSelectCategory(entry.name)}
                          cursor="pointer"
                        >
                          {domainDistributionData.map((entry, index) => (
                            <Cell
                              key={`cell-${entry.name}`}
                              fill={PIE_PALETTE[index % PIE_PALETTE.length]}
                              stroke={isDark ? '#171717' : '#ffffff'}
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const d = payload[0].payload;
                              return (
                                <div
                                  className="p-2.5 rounded-xl text-xs space-y-1 shadow-lg border"
                                  style={{
                                    backgroundColor: tooltipBg,
                                    borderColor: tooltipBorder,
                                  }}
                                >
                                  <div className="font-bold text-foreground">{d.name}</div>
                                  <div className="text-muted-foreground">
                                    {d.count} {d.count === 1 ? 'Role' : 'Roles'} ({d.percentage}% of catalog)
                                  </div>
                                  <div className="text-[10px] text-purple-500 font-semibold">
                                    Click to filter dashboard
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Accessible Legend Breakdown */}
                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {domainDistributionData.map((item, idx) => {
                      const isCurrent = activeCategory === item.name;
                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => onSelectCategory(item.name)}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all text-left cursor-pointer ${
                            isCurrent
                              ? 'bg-secondary font-bold text-foreground ring-1 ring-border'
                              : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: PIE_PALETTE[idx % PIE_PALETTE.length] }}
                            />
                            <span className="truncate">{item.name}</span>
                          </div>
                          <span className="font-mono text-[11px] font-bold text-foreground shrink-0 ml-2">
                            {item.count} ({item.percentage}%)
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SALARY COMPARISON */}
          {activeTab === 'salaries' && (
            <div className="space-y-3">
              {salaryHighlights && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-1">
                  <div className="p-3 rounded-xl bg-secondary/50 border border-border/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Highest Ceiling Role
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-foreground">
                        {salaryHighlights.highest.title}
                      </p>
                    </div>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                      Up to {salaryHighlights.highest.maxLpa} LPA
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-secondary/50 border border-border/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Entry-Level Baseline
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-foreground">
                        {salaryHighlights.lowest.title}
                      </p>
                    </div>
                    <span className="text-xs font-black text-foreground bg-secondary px-2 py-1 rounded-lg border border-border">
                      From {salaryHighlights.lowest.minLpa} LPA
                    </span>
                  </div>
                </div>
              )}

              {salaryComparisonData.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  No verified salary records found for the current filtered roles.
                </div>
              ) : (
                <div className="h-72 sm:h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={salaryComparisonData.slice(0, 10)}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} horizontal={false} />
                      <XAxis
                        type="number"
                        domain={[0, 'dataMax + 2']}
                        unit=" LPA"
                        tick={{ fill: textColor, fontSize: 11 }}
                      />
                      <YAxis
                        type="category"
                        dataKey="shortTitle"
                        width={130}
                        tick={{ fill: textColor, fontSize: 11 }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div
                                className="p-2.5 rounded-xl text-xs space-y-1 shadow-lg border"
                                style={{
                                  backgroundColor: tooltipBg,
                                  borderColor: tooltipBorder,
                                }}
                              >
                                <div className="font-bold text-foreground">{d.title}</div>
                                <div className="text-muted-foreground text-[11px]">{d.category}</div>
                                <div className="font-black text-emerald-600 dark:text-emerald-400 pt-1">
                                  Campus Range: {d.rangeText}
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                  Base: {d.minLpa} LPA • Peak: {d.maxLpa} LPA
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="minLpa" name="Minimum LPA" fill="#a1a1a1" radius={[0, 0, 0, 0]} />
                      <Bar
                        dataKey="maxLpa"
                        name="Maximum LPA"
                        fill={isDark ? '#fafafa' : '#171717'}
                        radius={[0, 6, 6, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SKILL LANDSCAPE */}
          {activeTab === 'skills' && (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">
                Most requested technical skills across the currently filtered career paths (database frequency).
              </div>

              {skillLandscapeData.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  No technical skill mappings available for selected roles.
                </div>
              ) : (
                <div className="h-72 sm:h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={skillLandscapeData}
                      margin={{ top: 10, right: 20, left: 10, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} vertical={false} />
                      <XAxis
                        dataKey="skill"
                        angle={-25}
                        textAnchor="end"
                        interval={0}
                        height={55}
                        tick={{ fill: textColor, fontSize: 10 }}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fill: textColor, fontSize: 11 }}
                        unit=" roles"
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div
                                className="p-2.5 rounded-xl text-xs space-y-1 shadow-lg border"
                                style={{
                                  backgroundColor: tooltipBg,
                                  borderColor: tooltipBorder,
                                }}
                              >
                                <div className="font-bold text-foreground">{d.skill}</div>
                                <div className="text-muted-foreground">
                                  Required across <span className="font-bold text-foreground">{d.count}</span> catalogued career {d.count === 1 ? 'role' : 'roles'}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar
                        dataKey="count"
                        name="Roles Requiring Skill"
                        fill="#8b5cf6"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
