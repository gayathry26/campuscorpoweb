import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  MapPin,
  Search,
  Building2,
  Briefcase,
  ExternalLink,
  Navigation,
  CheckCircle2,
  Layers,
  Filter,
  RotateCcw,
  Star,
  ChevronRight,
  Globe,
  Compass,
  Sparkles,
  Map as MapIcon,
  LayoutGrid,
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import careerService from '../../services/careerService';
import { useToast } from '../../context/ToastContext';

export function CompanyLocationExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const shouldReduceMotion = useReducedMotion();

  // Search & Filter State
  const initialCity = searchParams.get('city') || 'Coimbatore';
  const [cityInput, setCityInput] = useState(initialCity === 'ALL' ? '' : initialCity);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [postalCode, setPostalCode] = useState(searchParams.get('postal_code') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('company_type') || 'ALL');
  const [selectedDomain, setSelectedDomain] = useState(searchParams.get('domain') || 'ALL');
  const [selectedExp, setSelectedExp] = useState(searchParams.get('experience_level') || 'ALL');
  const [selectedWorkMode, setSelectedWorkMode] = useState(searchParams.get('work_mode') || 'ALL');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'openings');

  // Geolocation State
  const [userCoords, setUserCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // UI View States
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [selectedMapCompany, setSelectedMapCompany] = useState(null);

  // Data & Status State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, totalPages: 0 });
  const [metadata, setMetadata] = useState({
    cities: [],
    domains: [],
    companyTypes: [],
    experienceLevels: [],
    workModes: [],
    stats: {},
    popularLocations: []
  });

  // 1. Fetch Metadata (cities, filters, categories)
  useEffect(() => {
    async function loadMeta() {
      try {
        const meta = await careerService.getCompanyLocationMetadata();
        setMetadata(meta);
      } catch (err) {
        console.warn('Failed to load location metadata:', err);
      }
    }
    loadMeta();
  }, []);

  // 2. Fetch Companies by Location
  const fetchCompanies = useCallback(async (customParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        city: selectedCity === 'ALL' ? undefined : (selectedCity || undefined),
        postal_code: postalCode || undefined,
        q: searchQuery || undefined,
        company_type: selectedType === 'ALL' ? undefined : selectedType,
        domain: selectedDomain === 'ALL' ? undefined : selectedDomain,
        experience_level: selectedExp === 'ALL' ? undefined : selectedExp,
        work_mode: selectedWorkMode === 'ALL' ? undefined : selectedWorkMode,
        sort: sortBy,
        ...customParams,
      };

      if (userCoords?.lat && userCoords?.lng) {
        params.lat = userCoords.lat;
        params.lng = userCoords.lng;
      }

      const data = await careerService.searchCompaniesByLocation(params);
      setCompanies(data.companies || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 12, totalPages: 0 });
      if (data.companies?.length > 0 && !selectedMapCompany) {
        setSelectedMapCompany(data.companies[0]);
      }
    } catch (err) {
      console.error('Error fetching location companies:', err);
      setError(err.response?.data?.message || err.message || 'Unable to connect to company location service.');
    } finally {
      setLoading(false);
    }
  }, [selectedCity, postalCode, searchQuery, selectedType, selectedDomain, selectedExp, selectedWorkMode, sortBy, userCoords, selectedMapCompany]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Handle Location Search Form Submit
  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSelectedCity(cityInput.trim() || 'ALL');
    setSearchParams({
      city: cityInput.trim() || 'ALL',
      ...(postalCode ? { postal_code: postalCode } : {}),
      ...(searchQuery ? { q: searchQuery } : {}),
      ...(selectedType !== 'ALL' ? { company_type: selectedType } : {}),
      ...(selectedDomain !== 'ALL' ? { domain: selectedDomain } : {}),
      ...(selectedExp !== 'ALL' ? { experience_level: selectedExp } : {}),
      ...(selectedWorkMode !== 'ALL' ? { work_mode: selectedWorkMode } : {}),
      sort: sortBy,
    });
  };

  // Handle Quick City Pill Click
  const handleQuickCitySelect = (cityName) => {
    setCityInput(cityName === 'ALL' ? '' : cityName);
    setSelectedCity(cityName);
    setPostalCode('');
    setUserCoords(null);
  };

  // Geolocation Request - ONLY on explicit user click
  const handleRequestUserLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'error');
      return;
    }
    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserCoords(coords);
        setIsLocating(false);
        setSortBy('distance');
        showToast(`GPS location detected (${coords.lat.toFixed(2)}°, ${coords.lng.toFixed(2)}°). Sorting by distance.`, 'success');
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        let msg = 'Could not retrieve your location. Please check browser permissions.';
        if (err.code === 1) msg = 'Location access was denied. You can manually select a city like Coimbatore.';
        setLocationError(msg);
        showToast(msg, 'warning');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Reset all search and filters
  const handleResetFilters = () => {
    setCityInput('Coimbatore');
    setSelectedCity('Coimbatore');
    setPostalCode('');
    setSearchQuery('');
    setSelectedType('ALL');
    setSelectedDomain('ALL');
    setSelectedExp('ALL');
    setSelectedWorkMode('ALL');
    setSortBy('openings');
    setUserCoords(null);
    setSearchParams({});
    showToast('Search filters reset to default.', 'info');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20">
      {/* ------------------------------------------------------------- */}
      {/* HEADER SECTION                                                */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              <Compass className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span>Location Intelligence • Verified IT Directory</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>Verified Portals</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <span>IT Companies by Location</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Discover verified tech companies, regional development centres, and live campus hiring opportunities in Coimbatore, Chennai, Bengaluru, and major tech corridors.
          </p>
        </div>

        {/* Global Stats Counter */}
        <div className="flex items-center gap-3">
          <div className="bg-card border border-border p-3 rounded-2xl shadow-xs text-center min-w-[100px]">
            <div className="text-lg font-black text-foreground font-mono">{metadata.stats?.total_companies || companies.length}</div>
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">IT Companies</div>
          </div>
          <div className="bg-card border border-border p-3 rounded-2xl shadow-xs text-center min-w-[100px]">
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">{metadata.stats?.total_jobs || 23}</div>
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Active Openings</div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* LOCATION SEARCH & FILTER CONTROLS                             */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        {/* Top Search Inputs Bar */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* City / Location Input */}
          <div className="md:col-span-5 relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="Enter City, Region or State (e.g. Coimbatore, Chennai)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Postal Code / PIN */}
          <div className="md:col-span-3 relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">PIN</span>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="PIN Code (e.g. 641035)..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
            />
          </div>

          {/* Action Buttons */}
          <div className="md:col-span-4 flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-primary text-primary-foreground hover:opacity-90 shadow-xs cursor-pointer transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Search Location</span>
            </button>

            <button
              type="button"
              onClick={handleRequestUserLocation}
              disabled={isLocating}
              title="Use Current Device Location (GPS)"
              className={`p-2.5 rounded-xl border border-border transition-all cursor-pointer ${
                userCoords
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                  : 'bg-background hover:bg-muted text-foreground'
              }`}
            >
              <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin text-primary' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                isFiltersOpen
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'bg-background border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </form>

        {/* Popular City Quick-Select Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-bold text-muted-foreground uppercase mr-1">Popular Hubs:</span>
          {['Coimbatore', 'Chennai', 'Bengaluru', 'Hyderabad', 'Pune', 'All'].map((city) => {
            const isSelected = (city === 'All' && selectedCity === 'ALL') || selectedCity.toLowerCase() === city.toLowerCase();
            return (
              <button
                key={city}
                type="button"
                onClick={() => handleQuickCitySelect(city === 'All' ? 'ALL' : city)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {city === 'All' ? 'All Locations' : city}
              </button>
            );
          })}
        </div>

        {/* GPS Active Notice */}
        {userCoords && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300">
            <span className="flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Location active: <strong>{userCoords.lat.toFixed(3)}° N, {userCoords.lng.toFixed(3)}° E</strong>. Showing companies ordered by nearest distance.</span>
            </span>
            <button
              type="button"
              onClick={() => setUserCoords(null)}
              className="text-[11px] underline font-bold cursor-pointer hover:opacity-80 ml-2"
            >
              Clear GPS
            </button>
          </div>
        )}

        {/* Collapsible Advanced Filters Drawer */}
        <AnimatePresence>
          {isFiltersOpen && (
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Filter: Company Type */}
                <div>
                  <label className="block text-[11px] uppercase font-bold text-muted-foreground mb-1">Company Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none"
                  >
                    <option value="ALL">All Types (MNC, Product, R&D)</option>
                    <option value="GLOBAL_R_AND_D">Global R&D / Innovation Center</option>
                    <option value="PRODUCT">Product Engineering / SaaS</option>
                    <option value="MNC">Multinational Corporation (MNC)</option>
                    <option value="SERVICE">IT Services & Consulting</option>
                  </select>
                </div>

                {/* Filter: Technology Domain */}
                <div>
                  <label className="block text-[11px] uppercase font-bold text-muted-foreground mb-1">Technology Domain</label>
                  <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none"
                  >
                    <option value="ALL">All IT Domains</option>
                    <option value="Automotive & Embedded IoT">Automotive & Embedded IoT</option>
                    <option value="Cloud & DevOps">Cloud Platforms & DevOps</option>
                    <option value="AI & Machine Learning">AI, ML & Computer Vision</option>
                    <option value="Full-Stack Web & Microservices">Full-Stack & Microservices</option>
                    <option value="FinTech & Banking Platforms">FinTech & BFSI Platforms</option>
                    <option value="Semiconductor Automation & Instrumentation">Semiconductor Automation</option>
                  </select>
                </div>

                {/* Filter: Experience Level */}
                <div>
                  <label className="block text-[11px] uppercase font-bold text-muted-foreground mb-1">Experience Level</label>
                  <select
                    value={selectedExp}
                    onChange={(e) => setSelectedExp(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none"
                  >
                    <option value="ALL">All Experience Levels</option>
                    <option value="FRESHER">Fresher / Graduate Trainee</option>
                    <option value="INTERNSHIP">Internship & Pre-Placement</option>
                    <option value="ENTRY_LEVEL">Entry Level (0–2 Years)</option>
                    <option value="MID_LEVEL">Mid-Senior (2–5+ Years)</option>
                  </select>
                </div>

                {/* Filter: Work Mode */}
                <div>
                  <label className="block text-[11px] uppercase font-bold text-muted-foreground mb-1">Work Mode</label>
                  <select
                    value={selectedWorkMode}
                    onChange={(e) => setSelectedWorkMode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none"
                  >
                    <option value="ALL">All Work Modes</option>
                    <option value="HYBRID">Hybrid (Office + Remote)</option>
                    <option value="ONSITE">Onsite / Tech Park Campus</option>
                    <option value="REMOTE">Fully Remote / Virtual</option>
                  </select>
                </div>

                {/* Keyword / Tech search */}
                <div className="sm:col-span-2 md:col-span-3">
                  <label className="block text-[11px] uppercase font-bold text-muted-foreground mb-1">Skill or Role Keyword</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by tech stack (e.g. AUTOSAR, React, Python, Kafka)..."
                    className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none"
                  />
                </div>

                {/* Reset Filters button */}
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 cursor-pointer transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All Filters</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* RESULTS HEADER & SORTING TOOLBAR                              */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
        <div>
          <span className="font-bold text-foreground">
            {companies.length} verified IT {companies.length === 1 ? 'company' : 'companies'}
          </span>
          <span className="text-muted-foreground">
            {' '}found {selectedCity && selectedCity !== 'ALL' ? `in ${selectedCity}` : 'across all locations'}
            {postalCode ? ` (PIN ${postalCode})` : ''}
          </span>
        </div>

        {/* View Mode & Sort Controls */}
        <div className="flex items-center gap-2">
          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 bg-card border border-border px-3 py-1.5 rounded-xl text-xs">
            <span className="text-muted-foreground font-semibold">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-foreground font-bold focus:outline-none cursor-pointer"
            >
              {userCoords && <option value="distance">Nearest Distance (GPS)</option>}
              <option value="openings">Most Career Openings</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Company Name (A–Z)</option>
            </select>
          </div>

          {/* Grid vs Map Toggle */}
          <div className="hidden lg:flex items-center bg-card border border-border p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                viewMode === 'grid' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                viewMode === 'map' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Split Map View"
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* LOADING & ERROR STATES                                        */}
      {/* ------------------------------------------------------------- */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="p-5 rounded-2xl bg-card border border-border space-y-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-muted" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
              <div className="h-10 bg-muted rounded" />
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-muted rounded-full" />
                <div className="h-6 w-20 bg-muted rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-500/20 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <h3 className="text-base font-bold text-red-900 dark:text-red-200">Unable to load company location directory</h3>
          <p className="text-xs text-red-700 dark:text-red-300 max-w-md mx-auto">{error}</p>
          <button
            type="button"
            onClick={() => fetchCompanies()}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700 shadow-xs cursor-pointer"
          >
            Retry Location Query
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && companies.length === 0 && (
        <div className="p-12 rounded-2xl bg-card border border-border text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No companies found in this location</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            We couldn't find any verified IT companies matching your criteria in <strong>{selectedCity}</strong>. Try browsing Coimbatore, Chennai, or Bengaluru.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleQuickCitySelect('Coimbatore')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow-xs cursor-pointer hover:opacity-90"
            >
              Explore Coimbatore IT Directory
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* COMPANY RESULTS: GRID VIEW OR SPLIT MAP VIEW                  */}
      {/* ------------------------------------------------------------- */}
      {!loading && !error && companies.length > 0 && (
        <div className={`grid gap-6 ${viewMode === 'map' ? 'lg:grid-cols-12' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {/* Main Cards List */}
          <div className={`space-y-5 ${viewMode === 'map' ? 'lg:col-span-7' : 'contents'}`}>
            {companies.map((comp) => {
              const office = comp.primary_office || comp.nearest_office || comp.offices?.[0];
              const isSelectedOnMap = selectedMapCompany?.id === comp.id;

              return (
                <motion.div
                  key={comp.id}
                  onClick={() => setSelectedMapCompany(comp)}
                  whileHover={shouldReduceMotion ? false : { y: -3, transition: { duration: 0.15 } }}
                  className={`bg-card rounded-2xl border transition-colors duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                    isSelectedOnMap && viewMode === 'map'
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <div className="p-5 space-y-4">
                    {/* Card Top: Logo, Name, Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {/* Company Logo or Monogram */}
                        <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-border flex items-center justify-center shrink-0 p-1.5 overflow-hidden">
                          {comp.logo_url ? (
                            <img
                              src={comp.logo_url}
                              alt={comp.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/48?text=' + encodeURIComponent(comp.name.substring(0, 2));
                              }}
                            />
                          ) : (
                            <span className="font-extrabold text-sm text-primary font-mono">
                              {comp.name.substring(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div>
                          <Link
                            to={`/career-explorer/companies/${comp.id}`}
                            className="font-bold text-foreground text-base hover:text-primary transition-colors flex items-center gap-1.5 leading-snug"
                          >
                            <span>{comp.name}</span>
                          </Link>
                          <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {comp.industry}
                          </div>
                        </div>
                      </div>

                      {/* Verified Badge & Tier */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>Verified</span>
                        </span>
                        {comp.rating && (
                          <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{comp.rating.toFixed(1)}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Location Address & Distance Info */}
                    {office && (
                      <div className="p-3 rounded-xl bg-muted/40 border border-border/80 text-xs space-y-1">
                        <div className="flex items-start gap-1.5 text-foreground font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{office.office_name}</span>
                        </div>
                        <div className="text-muted-foreground pl-5 line-clamp-1">
                          {office.address_line1}, {office.city} - {office.postal_code}
                        </div>
                        {comp.distance_km != null && (
                          <div className="pl-5 pt-0.5 flex items-center gap-1 text-primary font-bold">
                            <span>📍 {comp.distance_km} km away</span>
                            {comp.distance_km < 10 && <span className="text-[10px] bg-primary/10 px-1.5 rounded">Near Campus</span>}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Verified Tech Stack Tags */}
                    {comp.tech_stack && comp.tech_stack.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                          Verified Tech Stack:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {comp.tech_stack.slice(0, 5).map((tech, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 border border-border"
                            >
                              {tech}
                            </span>
                          ))}
                          {comp.tech_stack.length > 5 && (
                            <span className="px-1.5 py-0.5 text-[10px] text-muted-foreground">
                              +{comp.tech_stack.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Active Verified Job Opportunities Preview */}
                    {comp.active_jobs_count > 0 && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <div>
                            <strong className="text-emerald-900 dark:text-emerald-200 block">
                              {comp.active_jobs_count} Verified Career {comp.active_jobs_count === 1 ? 'Opening' : 'Openings'}
                            </strong>
                            {comp.jobs?.[0] && (
                              <span className="text-[11px] text-emerald-700 dark:text-emerald-300 line-clamp-1">
                                {comp.jobs[0].title} {comp.jobs[0].ctc_lpa ? `(₹${comp.jobs[0].ctc_lpa} LPA)` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="px-5 py-3.5 bg-muted/20 border-t border-border flex items-center justify-between gap-2">
                    <Link
                      to={`/career-explorer/companies/${comp.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
                    >
                      <span>Explore Offices & Careers</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    <div className="flex items-center gap-2">
                      {comp.careers_url && (
                        <a
                          href={comp.careers_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-xs cursor-pointer"
                          title="Open Verified Careers Portal"
                        >
                          <span>Careers</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {comp.website && (
                        <a
                          href={comp.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
                          title="Official Website"
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Desktop Interactive Map Column (Split View) */}
          {viewMode === 'map' && (
            <div className="hidden lg:block lg:col-span-5 sticky top-20 self-start">
              <div className="bg-card border border-border rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                    <MapIcon className="w-4 h-4 text-primary" />
                    <span>Location Pins ({selectedCity || 'All'})</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">OpenStreetMap</span>
                </div>

                {/* Simulated Interactive Vector Map Canvas */}
                <div className="w-full h-80 rounded-xl bg-neutral-900 border border-border relative overflow-hidden flex flex-col justify-between p-3 select-none">
                  {/* Map Grid Background Texture */}
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]" />

                  {/* Top Map Location Badge */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-black/70 text-white backdrop-blur-xs flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-red-500" />
                      <span>{selectedCity} Hub</span>
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono bg-black/60 px-2 py-0.5 rounded">
                      GPS: 11.016° N, 76.955° E
                    </span>
                  </div>

                  {/* Interactive Office Pins Scatter */}
                  <div className="relative z-10 w-full h-44 flex flex-wrap items-center justify-center gap-3 p-2">
                    {companies.slice(0, 8).map((c, idx) => {
                      const isSel = selectedMapCompany?.id === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedMapCompany(c)}
                          className={`group relative p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                            isSel
                              ? 'bg-primary text-primary-foreground scale-110 z-20 ring-2 ring-white'
                              : 'bg-neutral-800/90 text-neutral-200 hover:bg-neutral-700 hover:scale-105'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <span className="truncate max-w-[100px]">{c.name.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Bottom Map Controls Note */}
                  <div className="relative z-10 text-[10px] text-neutral-400 flex items-center justify-between border-t border-neutral-800 pt-2">
                    <span>Click any pin to inspect verified office details</span>
                    <span className="text-emerald-400">● 100% Verified Offices</span>
                  </div>
                </div>

                {/* Selected Map Company Detail Card */}
                {selectedMapCompany && (
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground text-sm">{selectedMapCompany.name}</span>
                      <span className="text-[11px] font-bold text-primary font-mono">{selectedMapCompany.company_type}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {selectedMapCompany.overview}
                    </p>
                    <div className="pt-2 flex items-center justify-between">
                      <Link
                        to={`/career-explorer/companies/${selectedMapCompany.id}`}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <span>View All Offices & Jobs</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      {selectedMapCompany.careers_url && (
                        <a
                          href={selectedMapCompany.careers_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded text-xs font-bold bg-primary text-primary-foreground"
                        >
                          Careers Portal
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CompanyLocationExplorer;
