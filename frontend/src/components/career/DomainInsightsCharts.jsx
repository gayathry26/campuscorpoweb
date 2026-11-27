import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart2,
  DollarSign,
  Cpu,
  Layers,
  ChevronDown,
  ChevronUp,
  GitCompare,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function DomainInsightsCharts({
  domainName = '',
  roles = [],
  topSkills = [],
}) {
  const { isDark } = useTheme();

  // If there's only 1 role, DO NOT RENDER oversized charts!
  if (roles.length <= 1) {
    return null;
  }

  // 1. Prepare Salary Comparison Data (Min LPA to Max LPA Range)
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

      if (
        typeof min === 'number' &&
        typeof max === 'number' &&
        !isNaN(min) &&
        !isNaN(max) &&
        max > 0
      ) {
        const spread = parseFloat((max - min).toFixed(1));
        list.push({
          id: r.id,
          title: r.title,
          shortTitle: r.title.length > 22 ? `${r.title.slice(0, 20)}…` : r.title,
          minLpa: min,
          rangeLpa: Math.max(0.5, spread),
          maxLpa: max,
          rangeText: `₹${min} - ₹${max} LPA`,
        });
      }
    });

    return list.sort((a, b) => b.maxLpa - a.maxLpa);
  }, [roles]);

  const hasSalaryData = salaryComparisonData.length >= 2;

  // 2. Prepare Skills Landscape Data
  const skillLandscapeData = useMemo(() => {
    if (topSkills && topSkills.length > 0) {
      return topSkills.slice(0, 8).map((item) => ({
        ...item,
        ratioText: `${item.count} of ${roles.length} roles`,
      }));
    }

    const counts = {};
    roles.forEach((r) => {
      (r.technicalSkills || []).forEach((s) => {
        const clean = s.split('/')[0].split('(')[0].trim();
        counts[clean] = (counts[clean] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .map(([skill, count]) => ({
        skill,
        count,
        ratioText: `${count} of ${roles.length} roles`,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [roles, topSkills]);

  // 3. Prepare Role Distribution Data (Only for >= 2 roles)
  const roleDistributionData = useMemo(() => {
    return roles.map((r) => ({
      id: r.id,
      title: r.title,
      shortTitle: r.title.length > 22 ? `${r.title.slice(0, 20)}…` : r.title,
      skillsCount: (r.technicalSkills || []).length,
      toolsCount: (r.tools || []).length,
    }));
  }, [roles]);

  // Default active tab based on available data
  const defaultTab = hasSalaryData ? 'salaries' : 'skills';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Salary Highlights
  const salaryHighlights = useMemo(() => {
    if (salaryComparisonData.length === 0) return null;
    const highest = salaryComparisonData[0];
    const lowest = [...salaryComparisonData].sort((a, b) => a.minLpa - b.minLpa)[0];
    return { highest, lowest };
  }, [salaryComparisonData]);

  // Theme Colors
  const strokeColor = isDark ? '#262626' : '#e5e5e5';
  const textColor = isDark ? '#a1a1a1' : '#737373';
  const tooltipBg = isDark ? '#171717' : '#ffffff';
  const tooltipBorder = isDark ? '#404040' : '#e5e5e5';

  // Dynamic Chart Height based on item count
  const salaryChartHeight = Math.max(160, Math.min(320, salaryComparisonData.length * 48 + 50));
  const skillsChartHeight = Math.max(180, Math.min(320, skillLandscapeData.length * 36 + 50));
  const rolesChartHeight = Math.max(160, Math.min(300, roleDistributionData.length * 48 + 50));

  return (
    <div className="bg-card text-card-foreground border border-border rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
      {/* Header and Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-foreground" />
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
            {domainName} Insights
          </h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border/60">
            {roles.length} Roles Catalogued
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented Control */}
          <div className="inline-flex rounded-xl bg-secondary p-1 border border-border/60">
            {hasSalaryData && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('salaries');
                  setIsCollapsed(false);
                }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'salaries'
                    ? 'bg-foreground text-background shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Salary Range Comparison
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setActiveTab('skills');
                setIsCollapsed(false);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'skills'
                  ? 'bg-foreground text-background shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Required Skills
            </button>

            {roles.length >= 2 && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('roles');
                  setIsCollapsed(false);
                }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'roles'
                    ? 'bg-foreground text-background shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {roles.length <= 3 ? 'Role Comparison' : 'Role Distribution'}
              </button>
            )}
          </div>

          {/* Collapse Toggle */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground border border-border/60 cursor-pointer"
            title={isCollapsed ? 'Expand Insights' : 'Collapse Insights'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Chart Body */}
      {!isCollapsed && (
        <div className="animate-in fade-in-50 duration-200">
          {/* TAB 1: SALARY RANGE COMPARISON (HORIZONTAL RANGE BARS) */}
          {activeTab === 'salaries' && hasSalaryData && (
            <div className="space-y-4">
              {salaryHighlights && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-secondary/50 border border-border/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Highest Compensation Ceiling
                      </span>
                      <div className="text-xs font-bold text-foreground">
                        {salaryHighlights.highest.title}
                      </div>
                      <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {salaryHighlights.highest.rangeText}
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs">
                      MAX
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-secondary/50 border border-border/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Baseline Entry Range
                      </span>
                      <div className="text-xs font-bold text-foreground">
                        {salaryHighlights.lowest.title}
                      </div>
                      <div className="text-xs font-black text-foreground mt-0.5">
                        {salaryHighlights.lowest.rangeText}
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center font-bold text-xs border border-border">
                      MIN
                    </div>
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground flex items-center justify-between">
                <span>
                  Floating horizontal bars depict the campus placement minimum and maximum LPA for each role:
                </span>
                <span className="font-semibold text-foreground">
                  {salaryComparisonData.length} Roles with Benchmarks
                </span>
              </div>

              {/* Range Chart: Transparent Base + Floating Range Bar */}
              <div style={{ height: `${salaryChartHeight}px` }} className="w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salaryComparisonData}
                    layout="vertical"
                    margin={{ top: 10, right: 35, left: 20, bottom: 5 }}
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
                      width={140}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: tooltipBg,
                        borderColor: tooltipBorder,
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: isDark ? '#ffffff' : '#000000',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
                      }}
                      formatter={(val, name, item) => [
                        `${item.payload.rangeText} (Min: ₹${item.payload.minLpa} LPA, Max: ₹${item.payload.maxLpa} LPA)`,
                        'Campus Compensation Band',
                      ]}
                      labelFormatter={(label, payload) => {
                        return payload?.[0]?.payload?.title || label;
                      }}
                    />
                    {/* Stacked Bars: Transparent Min + Emerald Range */}
                    <Bar
                      dataKey="minLpa"
                      stackId="salary"
                      fill="transparent"
                      name="Baseline Min"
                      isAnimationActive={false}
                    />
                    <Bar
                      dataKey="rangeLpa"
                      stackId="salary"
                      fill="#10b981"
                      radius={[0, 6, 6, 0]}
                      name="Salary Range"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TAB 2: REQUIRED SKILLS (FREQUENCY LANDSCAPE) */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground">
                <p>
                  Competency frequency across <strong>{domainName}</strong> career pathways in CampusCorp:
                </p>
                <span className="font-semibold text-foreground">
                  {skillLandscapeData.length} Key Competencies Documented
                </span>
              </div>

              {skillLandscapeData.length > 0 ? (
                <div style={{ height: `${skillsChartHeight}px` }} className="w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={skillLandscapeData}
                      layout="vertical"
                      margin={{ top: 10, right: 35, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={strokeColor} />
                      <XAxis
                        type="number"
                        stroke={textColor}
                        fontSize={11}
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        dataKey="skill"
                        type="category"
                        stroke={textColor}
                        fontSize={11}
                        width={140}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: tooltipBg,
                          borderColor: tooltipBorder,
                          borderRadius: '12px',
                          fontSize: '12px',
                          color: isDark ? '#ffffff' : '#000000',
                          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
                        }}
                        formatter={(val, name, item) => [
                          `${val} of ${roles.length} roles require this competency (${Math.round((val / roles.length) * 100)}%)`,
                          'Curriculum Frequency',
                        ]}
                      />
                      <Bar
                        dataKey="count"
                        fill="#8b5cf6"
                        radius={[0, 6, 6, 0]}
                        name="Required In Roles"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground bg-secondary/30 rounded-xl">
                  No skill records documented for this domain yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ROLE COMPARISON / DISTRIBUTION */}
          {activeTab === 'roles' && roles.length >= 2 && (
            <div className="space-y-4">
              {/* For 2 to 3 roles: Show side-by-side Role Comparison Matrix with 1-click Compare */}
              {roles.length <= 3 ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
                    <p>
                      Direct side-by-side comparison across all {roles.length} roles in <strong>{domainName}</strong>:
                    </p>
                    <Link
                      to={`/compare?roles=${roles.map((r) => r.id).join(',')}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-foreground text-background hover:opacity-90 transition-all shadow-xs shrink-0"
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                      <span>Compare All {roles.length} Roles Side-by-Side</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {roles.map((r) => (
                      <div
                        key={r.id}
                        className="p-4 rounded-xl bg-secondary/40 border border-border/80 space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold text-foreground">{r.title}</h4>
                          <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                            {r.stats?.averageSalary || 'Benchmark Verified'}
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-2">
                            {r.shortDescription}
                          </p>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-border/60">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Top Skills:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(r.technicalSkills || []).slice(0, 3).map((s, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-card border border-border text-foreground truncate max-w-[140px]"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* For 4+ roles: Show Role Competency Depth Chart */
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground">
                    <p>
                      Competency depth: required technical skills and tools per career role in <strong>{domainName}</strong>:
                    </p>
                    <span className="font-semibold text-foreground">
                      {roleDistributionData.length} Catalogued Roles
                    </span>
                  </div>

                  <div style={{ height: `${rolesChartHeight}px` }} className="w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={roleDistributionData}
                        layout="vertical"
                        margin={{ top: 10, right: 35, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={strokeColor} />
                        <XAxis
                          type="number"
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
                          width={140}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: tooltipBg,
                            borderColor: tooltipBorder,
                            borderRadius: '12px',
                            fontSize: '12px',
                            color: isDark ? '#ffffff' : '#000000',
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
                          }}
                          formatter={(val, name) => [
                            `${val} competencies`,
                            name === 'skillsCount' ? 'Technical Skills' : 'Production Tools',
                          ]}
                          labelFormatter={(label, payload) => {
                            return payload?.[0]?.payload?.title || label;
                          }}
                        />
                        <Bar
                          dataKey="skillsCount"
                          fill="#6366f1"
                          radius={[0, 6, 6, 0]}
                          name="skillsCount"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
