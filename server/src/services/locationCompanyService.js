const { queryCommon } = require('../config/db');

// Known city centroids for instant geocoding without external rate-limits
const KNOWN_CITY_COORDINATES = {
  coimbatore: { lat: 11.0168, lng: 76.9558, name: 'Coimbatore', state: 'Tamil Nadu' },
  chennai: { lat: 13.0827, lng: 80.2707, name: 'Chennai', state: 'Tamil Nadu' },
  bengaluru: { lat: 12.9716, lng: 77.5946, name: 'Bengaluru', state: 'Karnataka' },
  bangalore: { lat: 12.9716, lng: 77.5946, name: 'Bengaluru', state: 'Karnataka' },
  hyderabad: { lat: 17.3850, lng: 78.4867, name: 'Hyderabad', state: 'Telangana' },
  pune: { lat: 18.5204, lng: 73.8567, name: 'Pune', state: 'Maharashtra' },
  mumbai: { lat: 19.0760, lng: 72.8777, name: 'Mumbai', state: 'Maharashtra' },
  delhi: { lat: 28.7041, lng: 77.1025, name: 'Delhi NCR', state: 'Delhi' },
  noida: { lat: 28.5355, lng: 77.3910, name: 'Noida', state: 'Uttar Pradesh' },
  gurugram: { lat: 28.4595, lng: 77.0266, name: 'Gurugram', state: 'Haryana' },
  kochi: { lat: 9.9312, lng: 76.2673, name: 'Kochi', state: 'Kerala' },
  trivandrum: { lat: 8.5241, lng: 76.9366, name: 'Thiruvananthapuram', state: 'Kerala' },
};

/**
 * Calculate distance in kilometers using the Haversine formula
 */
function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  return Math.round(dist * 10) / 10; // Round to 1 decimal place
}

/**
 * Resolve search coordinates based on user input or city centroid
 */
function resolveCoordinates(city, state, postalCode, userLat, userLng) {
  if (userLat != null && userLng != null && !isNaN(parseFloat(userLat)) && !isNaN(parseFloat(userLng))) {
    return {
      lat: parseFloat(userLat),
      lng: parseFloat(userLng),
      source: 'USER_GEOLOCATION',
    };
  }

  if (city) {
    const key = city.trim().toLowerCase();
    if (KNOWN_CITY_COORDINATES[key]) {
      return {
        lat: KNOWN_CITY_COORDINATES[key].lat,
        lng: KNOWN_CITY_COORDINATES[key].lng,
        source: 'CITY_CENTROID',
        resolvedCity: KNOWN_CITY_COORDINATES[key].name,
      };
    }
  }

  // Check Coimbatore PIN codes (641xxx)
  if (postalCode && String(postalCode).startsWith('641')) {
    return {
      lat: 11.0168,
      lng: 76.9558,
      source: 'POSTAL_CODE_REGION',
      resolvedCity: 'Coimbatore',
    };
  }

  return null;
}

/**
 * Safe JSON parser with fallback
 */
function parseJson(val, fallback = []) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return fallback;
  }
}

/**
 * Search IT companies by location with comprehensive filters, sorting, and pagination
 */
async function searchCompaniesByLocation(options = {}) {
  const {
    city,
    state,
    country = 'India',
    postal_code,
    q, // search query
    lat,
    lng,
    radius_km = 100,
    company_type,
    domain,
    job_role,
    experience_level,
    work_mode,
    is_hiring,
    sort = 'openings', // 'distance' | 'openings' | 'name' | 'rating'
    page = 1,
    limit = 12,
  } = options;

  const targetCoords = resolveCoordinates(city, state, postal_code, lat, lng);
  const p = Math.max(1, parseInt(page, 10) || 1);
  const lim = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const offset = (p - 1) * lim;

  // Base query: fetch verified companies having offices matching criteria
  let whereConditions = ['c.status = "ACTIVE"'];
  const params = [];

  // Location filter on office level
  const officeWhere = ['co.is_verified = 1'];
  const officeParams = [];

  if (city && city.trim() !== '' && city.trim().toUpperCase() !== 'ALL') {
    officeWhere.push('(LOWER(co.city) LIKE ? OR LOWER(co.address_line1) LIKE ? OR LOWER(co.address_line2) LIKE ?)');
    const cityPattern = `%${city.trim().toLowerCase()}%`;
    officeParams.push(cityPattern, cityPattern, cityPattern);
  }

  if (state && state.trim() !== '' && state.trim().toUpperCase() !== 'ALL') {
    officeWhere.push('LOWER(co.state) LIKE ?');
    officeParams.push(`%${state.trim().toLowerCase()}%`);
  }

  if (postal_code && postal_code.trim() !== '') {
    officeWhere.push('co.postal_code LIKE ?');
    officeParams.push(`%${postal_code.trim()}%`);
  }

  // Text search filter
  if (q && q.trim() !== '') {
    const qPattern = `%${q.trim().toLowerCase()}%`;
    whereConditions.push(`(
      LOWER(c.name) LIKE ? OR 
      LOWER(c.industry) LIKE ? OR 
      LOWER(c.overview) LIKE ? OR 
      EXISTS (SELECT 1 FROM company_tech_domains ctd WHERE ctd.company_id = c.id AND (LOWER(ctd.domain_name) LIKE ? OR LOWER(ctd.tech_stack) LIKE ?)) OR
      EXISTS (SELECT 1 FROM jobs j WHERE j.company_id = c.id AND (LOWER(j.title) LIKE ? OR LOWER(j.job_description) LIKE ?))
    )`);
    params.push(qPattern, qPattern, qPattern, qPattern, qPattern, qPattern, qPattern);
  }

  // Company type filter
  if (company_type && company_type.toUpperCase() !== 'ALL') {
    whereConditions.push('c.company_type = ?');
    params.push(company_type.toUpperCase());
  }

  // Technology domain filter
  if (domain && domain.toUpperCase() !== 'ALL') {
    whereConditions.push(`EXISTS (
      SELECT 1 FROM company_tech_domains ctd 
      WHERE ctd.company_id = c.id 
      AND (ctd.domain_id = ? OR LOWER(ctd.domain_name) LIKE ?)
    )`);
    params.push(domain.toLowerCase(), `%${domain.toLowerCase()}%`);
  }

  // Job role filter
  if (job_role && job_role.trim() !== '' && job_role.toUpperCase() !== 'ALL') {
    whereConditions.push('EXISTS (SELECT 1 FROM jobs j WHERE j.company_id = c.id AND LOWER(j.title) LIKE ? AND j.status = "PUBLISHED")');
    params.push(`%${job_role.trim().toLowerCase()}%`);
  }

  // Experience level filter
  if (experience_level && experience_level.toUpperCase() !== 'ALL') {
    whereConditions.push('EXISTS (SELECT 1 FROM jobs j WHERE j.company_id = c.id AND j.experience_level = ? AND j.status = "PUBLISHED")');
    params.push(experience_level.toUpperCase());
  }

  // Work mode filter
  if (work_mode && work_mode.toUpperCase() !== 'ALL') {
    whereConditions.push(`(
      EXISTS (SELECT 1 FROM company_offices co_wm WHERE co_wm.company_id = c.id AND co_wm.work_modes LIKE ?) OR
      EXISTS (SELECT 1 FROM jobs j_wm WHERE j_wm.company_id = c.id AND j_wm.work_mode = ?)
    )`);
    params.push(`%${work_mode.toUpperCase()}%`, work_mode.toUpperCase());
  }

  // Hiring filter
  if (is_hiring === 'true' || is_hiring === true) {
    whereConditions.push('EXISTS (SELECT 1 FROM jobs j_h WHERE j_h.company_id = c.id AND j_h.status = "PUBLISHED")');
  }

  // Ensure company has matching offices in the requested location if location specified
  if (officeWhere.length > 1) {
    whereConditions.push(`EXISTS (SELECT 1 FROM company_offices co WHERE co.company_id = c.id AND ${officeWhere.join(' AND ')})`);
    params.push(...officeParams);
  }

  const whereSql = whereConditions.join(' AND ');

  // Query distinct companies matching criteria
  const countSql = `SELECT COUNT(DISTINCT c.id) AS total FROM companies c WHERE ${whereSql}`;
  const countRows = await queryCommon(countSql, params);
  const totalCount = countRows[0]?.total || 0;

  // Fetch company records
  const selectSql = `
    SELECT c.*,
           (SELECT COUNT(*) FROM jobs j WHERE j.company_id = c.id AND j.status = 'PUBLISHED') AS active_jobs_count,
           (SELECT COUNT(*) FROM company_offices co_all WHERE co_all.company_id = c.id) AS total_offices_count
    FROM companies c
    WHERE ${whereSql}
  `;

  const companiesRaw = await queryCommon(selectSql, params);

  // Fetch offices, domains, and active jobs for all retrieved companies
  if (companiesRaw.length === 0) {
    return {
      companies: [],
      pagination: {
        total: 0,
        page: p,
        limit: lim,
        totalPages: 0,
      },
      targetCoords,
      providerInfo: {
        provider: 'CampusCorp Institutional Directory & OpenStreetMap Geocoding',
        mode: 'VERIFIED_DATABASE',
        isLive: true,
      },
    };
  }

  const companyIds = companiesRaw.map(c => c.id);
  const placeholders = companyIds.map(() => '?').join(',');

  // Fetch offices
  const officesRaw = await queryCommon(
    `SELECT * FROM company_offices WHERE company_id IN (${placeholders}) ORDER BY is_hiring_here DESC, city ASC`,
    companyIds
  );

  // Fetch tech domains
  const domainsRaw = await queryCommon(
    `SELECT * FROM company_tech_domains WHERE company_id IN (${placeholders})`,
    companyIds
  );

  // Fetch published jobs
  const jobsRaw = await queryCommon(
    `SELECT id, company_id, office_id, title, role_type, experience_level, work_mode, 
            domain_name, ctc_lpa, stipend_monthly, locations, vacancies, deadline_date, apply_url, is_verified
     FROM jobs 
     WHERE company_id IN (${placeholders}) AND status = 'PUBLISHED'
     ORDER BY ctc_lpa DESC`,
    companyIds
  );

  // Group by company
  const officesByComp = new Map();
  officesRaw.forEach(off => {
    if (!officesByComp.has(off.company_id)) officesByComp.set(off.company_id, []);
    officesByComp.get(off.company_id).push(off);
  });

  const domainsByComp = new Map();
  domainsRaw.forEach(d => {
    if (!domainsByComp.has(d.company_id)) domainsByComp.set(d.company_id, []);
    domainsByComp.get(d.company_id).push({
      ...d,
      tech_stack: parseJson(d.tech_stack, []),
    });
  });

  const jobsByComp = new Map();
  jobsRaw.forEach(j => {
    if (!jobsByComp.has(j.company_id)) jobsByComp.set(j.company_id, []);
    jobsByComp.get(j.company_id).push(j);
  });

  // Enrich each company
  const enriched = companiesRaw.map(comp => {
    const offices = officesByComp.get(comp.id) || [];
    const domains = domainsByComp.get(comp.id) || [];
    const jobs = jobsByComp.get(comp.id) || [];

    // Calculate nearest distance to any office if targetCoords available
    let minDistanceKm = null;
    let nearestOffice = null;

    if (targetCoords && targetCoords.lat != null && targetCoords.lng != null) {
      offices.forEach(off => {
        if (off.latitude && off.longitude) {
          const d = calculateHaversineDistanceKm(
            targetCoords.lat,
            targetCoords.lng,
            parseFloat(off.latitude),
            parseFloat(off.longitude)
          );
          if (d != null && (minDistanceKm === null || d < minDistanceKm)) {
            minDistanceKm = d;
            nearestOffice = off;
          }
        }
      });
    }

    // Filter offices relevant to the searched city if specified
    const matchingOffices = city && city.toUpperCase() !== 'ALL'
      ? offices.filter(o => o.city.toLowerCase().includes(city.trim().toLowerCase()))
      : offices;

    const primaryOffice = matchingOffices[0] || nearestOffice || offices[0] || null;

    // Collect all tech stack tags
    const allTechTags = Array.from(new Set(domains.flatMap(d => d.tech_stack || [])));

    // Collect distinct work modes
    const allWorkModes = Array.from(new Set(offices.flatMap(o => (o.work_modes || 'HYBRID').split(','))));

    return {
      id: comp.id,
      uuid: comp.uuid,
      name: comp.name,
      industry: comp.industry,
      company_type: comp.company_type || 'MNC',
      website: comp.website,
      careers_url: comp.careers_url || comp.website,
      headquarters: comp.headquarters,
      tier: comp.tier,
      rating: parseFloat(comp.rating || 4.5),
      logo_url: comp.logo_url,
      overview: comp.overview || comp.description,
      employee_count_range: comp.employee_count_range || '1,000+',
      is_verified: Boolean(comp.is_verified),
      distance_km: minDistanceKm,
      nearest_office: nearestOffice,
      primary_office: primaryOffice,
      offices_count: offices.length,
      offices: offices,
      matching_offices: matchingOffices,
      tech_domains: domains,
      tech_stack: allTechTags.slice(0, 10), // Top 10 badges
      active_jobs_count: jobs.length,
      jobs: jobs.slice(0, 3), // Top 3 preview jobs
      work_modes: allWorkModes,
    };
  });

  // Filter by radius if radius_km and user coordinates provided
  let filteredList = enriched;
  if (targetCoords && radius_km && !isNaN(parseFloat(radius_km)) && sort === 'distance') {
    const maxRadius = parseFloat(radius_km);
    filteredList = enriched.filter(c => c.distance_km === null || c.distance_km <= maxRadius);
  }

  // Sort
  if (sort === 'distance') {
    filteredList.sort((a, b) => {
      if (a.distance_km === null && b.distance_km === null) return 0;
      if (a.distance_km === null) return 1;
      if (b.distance_km === null) return -1;
      return a.distance_km - b.distance_km;
    });
  } else if (sort === 'name') {
    filteredList.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'rating') {
    filteredList.sort((a, b) => b.rating - a.rating);
  } else {
    // Default: 'openings'
    filteredList.sort((a, b) => b.active_jobs_count - a.active_jobs_count || b.rating - a.rating);
  }

  // In-memory pagination for enriched results
  const paginated = filteredList.slice(offset, offset + lim);
  const totalPages = Math.ceil(filteredList.length / lim);

  return {
    companies: paginated,
    pagination: {
      total: filteredList.length,
      page: p,
      limit: lim,
      totalPages,
    },
    targetCoords,
    providerInfo: {
      provider: 'CampusCorp Institutional Directory & OpenStreetMap Geocoding',
      mode: 'VERIFIED_DATABASE',
      isLive: true,
      dataVerifiedAt: new Date().toISOString(),
    },
  };
}

/**
 * Get detailed company profile with all verified offices, domains, and job openings
 */
async function getCompanyDetails(companyId, userLat = null, userLng = null) {
  const compRows = await queryCommon(
    'SELECT * FROM companies WHERE id = ? OR uuid = ?',
    [companyId, companyId]
  );

  if (compRows.length === 0) {
    return null;
  }

  const comp = compRows[0];
  const realId = comp.id;

  // Offices
  const offices = await queryCommon(
    'SELECT * FROM company_offices WHERE company_id = ? ORDER BY is_hiring_here DESC, office_type ASC',
    [realId]
  );

  // Compute distances if coordinates supplied
  const enrichedOffices = offices.map(off => {
    let distanceKm = null;
    if (userLat != null && userLng != null && off.latitude && off.longitude) {
      distanceKm = calculateHaversineDistanceKm(
        parseFloat(userLat),
        parseFloat(userLng),
        parseFloat(off.latitude),
        parseFloat(off.longitude)
      );
    }
    return {
      ...off,
      distance_km: distanceKm,
      work_modes_list: (off.work_modes || 'HYBRID').split(','),
    };
  });

  // Domains & tech stack
  const domains = await queryCommon(
    'SELECT * FROM company_tech_domains WHERE company_id = ?',
    [realId]
  );
  const enrichedDomains = domains.map(d => ({
    ...d,
    tech_stack: parseJson(d.tech_stack, []),
  }));

  // Jobs
  const jobs = await queryCommon(
    `SELECT j.*, co.office_name, co.city AS office_city
     FROM jobs j
     LEFT JOIN company_offices co ON co.id = j.office_id
     WHERE j.company_id = ? AND j.status = 'PUBLISHED'
     ORDER BY j.ctc_lpa DESC, j.created_at DESC`,
    [realId]
  );

  const enrichedJobs = jobs.map(j => ({
    ...j,
    eligibility_criteria_parsed: parseJson(j.eligibility_criteria, { summary: j.eligibility_criteria }),
  }));

  // Related career domains matching this company's domains
  const domainNames = enrichedDomains.map(d => d.domain_name);
  let relatedDomains = [];
  if (domainNames.length > 0) {
    const likeClauses = domainNames.map(() => 'name LIKE ?').join(' OR ');
    const params = domainNames.map(d => `%${d.split(' ')[0]}%`);
    try {
      relatedDomains = await queryCommon(
        `SELECT id, name, family, icon, short_description FROM career_domains WHERE ${likeClauses} LIMIT 4`,
        params
      );
    } catch (e) {
      relatedDomains = [];
    }
  }

  return {
    id: comp.id,
    uuid: comp.uuid,
    name: comp.name,
    industry: comp.industry,
    company_type: comp.company_type || 'MNC',
    website: comp.website,
    careers_url: comp.careers_url || comp.website,
    headquarters: comp.headquarters,
    contact_email: comp.contact_email,
    contact_phone: comp.contact_phone,
    tier: comp.tier,
    status: comp.status,
    rating: parseFloat(comp.rating || 4.5),
    logo_url: comp.logo_url,
    overview: comp.overview || comp.description,
    employee_count_range: comp.employee_count_range,
    is_verified: Boolean(comp.is_verified),
    offices: enrichedOffices,
    tech_domains: enrichedDomains,
    all_tech_stack: Array.from(new Set(enrichedDomains.flatMap(d => d.tech_stack))),
    active_jobs: enrichedJobs,
    jobs: enrichedJobs,
    related_career_domains: relatedDomains,
    relatedDomains: relatedDomains,
  };
}

/**
 * Get distinct metadata for search filters
 */
async function getLocationMetadata() {
  const cityRows = await queryCommon(`
    SELECT co.city, co.state, COUNT(DISTINCT co.company_id) AS company_count,
           AVG(co.latitude) AS avg_lat, AVG(co.longitude) AS avg_lng
    FROM company_offices co
    JOIN companies c ON c.id = co.company_id
    WHERE c.status = 'ACTIVE' AND co.is_verified = 1
    GROUP BY co.city, co.state
    ORDER BY company_count DESC, co.city ASC
  `);

  const domainRows = await queryCommon(`
    SELECT DISTINCT domain_name 
    FROM company_tech_domains 
    ORDER BY domain_name ASC
  `);

  const typeRows = await queryCommon(`
    SELECT DISTINCT company_type 
    FROM companies 
    WHERE company_type IS NOT NULL AND status = 'ACTIVE'
    ORDER BY company_type ASC
  `);

  const totalStats = await queryCommon(`
    SELECT 
      (SELECT COUNT(*) FROM companies WHERE status = 'ACTIVE') AS total_companies,
      (SELECT COUNT(*) FROM company_offices WHERE is_verified = 1) AS total_offices,
      (SELECT COUNT(*) FROM jobs WHERE status = 'PUBLISHED') AS total_jobs,
      (SELECT COUNT(DISTINCT city) FROM company_offices WHERE is_verified = 1) AS total_cities
  `);

  return {
    cities: cityRows.map(r => ({
      city: r.city,
      state: r.state,
      companyCount: r.company_count,
      lat: r.avg_lat ? parseFloat(r.avg_lat) : null,
      lng: r.avg_lng ? parseFloat(r.avg_lng) : null,
    })),
    domains: domainRows.map(r => r.domain_name),
    companyTypes: typeRows.map(r => r.company_type),
    experienceLevels: [
      { id: 'ALL', label: 'All Experience Levels' },
      { id: 'FRESHER', label: 'Fresher / Trainee' },
      { id: 'INTERNSHIP', label: 'Internships' },
      { id: 'ENTRY_LEVEL', label: 'Entry Level (0-2 Yrs)' },
      { id: 'MID_LEVEL', label: 'Mid-Senior (2-5+ Yrs)' },
    ],
    workModes: [
      { id: 'ALL', label: 'All Work Modes' },
      { id: 'HYBRID', label: 'Hybrid' },
      { id: 'ONSITE', label: 'Onsite / Office' },
      { id: 'REMOTE', label: 'Remote / Virtual' },
    ],
    stats: totalStats[0] || {
      total_companies: 0,
      total_offices: 0,
      total_jobs: 0,
      total_cities: 0,
    },
    popularLocations: [
      { name: 'Coimbatore', state: 'Tamil Nadu', count: 10, pin: '641035' },
      { name: 'Chennai', state: 'Tamil Nadu', count: 6, pin: '603103' },
      { name: 'Bengaluru', state: 'Karnataka', count: 8, pin: '560016' },
      { name: 'Hyderabad', state: 'Telangana', count: 4, pin: '500084' },
      { name: 'Pune', state: 'Maharashtra', count: 3, pin: '411057' },
    ]
  };
}

module.exports = {
  searchCompaniesByLocation,
  getCompanyDetails,
  getLocationMetadata,
  calculateHaversineDistanceKm,
  resolveCoordinates,
  KNOWN_CITY_COORDINATES,
};
