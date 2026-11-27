import apiClient from '../api/client';
import {
  IT_ROLES,
  DOMAIN_CATEGORIES,
  ROLE_TAGS,
  CAREER_DOMAINS,
  CAREER_FAMILIES,
  filterRoles as localFilterRoles,
  getRoleById as localGetRoleById,
  getRolesByDomain as localGetRolesByDomain,
} from '../data/itRoles';
import { CAREER_DOMAINS as MASTER_DOMAINS } from '../data/masterCareerDomains';
import { MASTER_CAREER_ROLES } from '../data/masterCareerRoles';

/**
 * Career Explorer Service - Fetches all Domain, Role, and Comparison data from SQL via REST API
 */
export const careerService = {
  /**
   * Fetch all career domain categories from SQL database
   */
  async getDomains() {
    try {
      const res = await apiClient.get('/career/domains');
      if (res.data?.success && res.data?.data) {
        return {
          categories: res.data.data.categories || DOMAIN_CATEGORIES,
          domains: res.data.data.domains || [],
          totalRoles: res.data.data.totalRoles || 0,
          source: 'sql',
        };
      }
    } catch (err) {
      console.warn('[careerService] Fallback to local dataset for domains:', err.message);
    }

    return {
      categories: DOMAIN_CATEGORIES,
      domains: DOMAIN_CATEGORIES.filter((c) => c !== 'All Domains').map((c) => ({
        id: c.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: c,
        roleCount: IT_ROLES.filter((r) => r.category === c).length,
      })),
      totalRoles: IT_ROLES.length,
      source: 'local',
    };
  },

  /**
   * Fetch single career domain by slug/ID with dedicated roles and statistics
   */
  async getDomainBySlug(slug) {
    if (!slug) return null;
    try {
      const res = await apiClient.get(`/career/domains/${slug}`);
      if (res.data?.success && res.data?.data) {
        return {
          ...res.data.data,
          source: 'sql',
        };
      }
    } catch (err) {
      console.warn('[careerService] Fallback to local dataset for domain by slug:', err.message);
    }

    // Local fallback: find domain in CAREER_DOMAINS or MASTER_DOMAINS
    const cleanSlug = slug.toLowerCase();
    const allCandidateDomains = [...(CAREER_DOMAINS || []), ...(MASTER_DOMAINS || [])];
    const matchedDomain = allCandidateDomains.find(
      (d) =>
        d &&
        ((d.id && d.id.toLowerCase() === cleanSlug) ||
         (d.name && d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === cleanSlug) ||
         (d.name && d.name.toLowerCase() === cleanSlug))
    );

    if (!matchedDomain) {
      return { notFound: true, message: `Domain '${slug}' not found.` };
    }

    let domainRoles = localGetRolesByDomain(matchedDomain.id);
    if (!domainRoles || domainRoles.length === 0) {
      domainRoles = (MASTER_CAREER_ROLES || []).filter(
        (r) =>
          (r.domainIds && r.domainIds.some((d) => d && d.toLowerCase() === matchedDomain.id.toLowerCase())) ||
          (r.category && r.category.toLowerCase() === matchedDomain.name.toLowerCase())
      );
    }
    let withSalary = 0;
    let minSalary = Infinity;
    let maxSalary = 0;
    const skillCounts = {};
    const toolsSet = new Set();

    domainRoles.forEach((r) => {
      if (r.stats?.averageSalary) {
        withSalary++;
        if (typeof r.stats.minLpa === 'number' && r.stats.minLpa < minSalary) minSalary = r.stats.minLpa;
        if (typeof r.stats.maxLpa === 'number' && r.stats.maxLpa > maxSalary) maxSalary = r.stats.maxLpa;
      }
      (r.technicalSkills || []).forEach((s) => {
        const clean = s.split('/')[0].split('(')[0].trim();
        skillCounts[clean] = (skillCounts[clean] || 0) + 1;
      });
      const roleToolsList = Array.isArray(r.tools)
        ? r.tools
        : typeof r.tools === 'object' && r.tools !== null
        ? Object.values(r.tools).flat().filter((t) => typeof t === 'string')
        : [];
      roleToolsList.forEach((t) => toolsSet.add(t));
    });

    return {
      domain: {
        id: matchedDomain.id,
        name: matchedDomain.name,
        family: matchedDomain.family,
        icon: matchedDomain.icon,
        shortDescription: matchedDomain.shortDescription,
        overview: matchedDomain.overview,
        whatProfessionalsDo: matchedDomain.whatProfessionalsDo || [],
        coreTechnologies: matchedDomain.coreTechnologies || [],
        prerequisites: matchedDomain.prerequisites || [],
        relatedDomains: matchedDomain.relatedDomains || [],
        careerProgression: matchedDomain.careerProgression || '',
        roleCount: domainRoles.length,
      },
      roles: domainRoles,
      stats: {
        totalRoles: domainRoles.length,
        rolesWithSalary: withSalary,
        rolesWithSkills: domainRoles.length,
        minLpa: minSalary === Infinity ? 4.5 : minSalary,
        maxLpa: maxSalary === 0 ? 20.0 : maxSalary,
        topSkills: Object.entries(skillCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([skill, count]) => ({ skill, count })),
        totalTools: toolsSet.size,
      },
      source: 'local',
    };
  },

  /**
   * Fetch IT career roles from SQL database with optional filters
   */
  async getRoles({ category, q, tags } = {}) {
    try {
      const params = {};
      if (category && category !== 'All Domains') params.category = category;
      if (q && q.trim()) params.q = q.trim();
      if (tags && tags.length > 0) {
        params.tags = Array.isArray(tags) ? tags.join(',') : tags;
      }

      const res = await apiClient.get('/career/roles', { params });
      if (res.data?.success && Array.isArray(res.data.data)) {
        return {
          roles: res.data.data,
          source: 'sql',
        };
      }
    } catch (err) {
      console.warn('[careerService] Fallback to local dataset for roles:', err.message);
    }

    // Local fallback
    const filtered = localFilterRoles({
      category,
      searchQuery: q,
      tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
    });

    return {
      roles: filtered,
      source: 'local',
    };
  },

  /**
   * Fetch single role by ID from SQL database
   */
  async getRoleById(roleId) {
    if (!roleId) return null;
    try {
      const res = await apiClient.get(`/career/roles/${roleId}`);
      if (res.data?.success && res.data.data) {
        return res.data.data;
      }
    } catch (err) {
      console.warn(`[careerService] Fallback to local dataset for role ${roleId}:`, err.message);
    }

    const localRole = localGetRoleById(roleId);
    if (localRole) return localRole;

    const cleanId = String(roleId).toLowerCase().trim();
    return (MASTER_CAREER_ROLES || []).find(
      (r) =>
        r.id === cleanId ||
        r.id.toLowerCase() === cleanId ||
        (r.title && r.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === cleanId)
    ) || null;
  },

  /**
   * Fetch specific career role by domain slug and role slug
   */
  async getRoleByDomainAndSlug(domainSlug, roleSlug) {
    if (!domainSlug || !roleSlug) return null;
    try {
      const res = await apiClient.get(`/career/domains/${domainSlug}/roles/${roleSlug}`);
      if (res.data?.success && res.data.data) {
        return {
          ...res.data.data,
          source: 'sql',
        };
      }
    } catch (err) {
      if (err.response?.status === 404) {
        // Try fallback to roleId directly before giving up
      }
      console.warn(`[careerService] Fallback to local dataset for ${domainSlug}/${roleSlug}:`, err.message);
    }

    // Try finding by roleSlug in local database
    let localRole = localGetRoleById(roleSlug);
    if (!localRole) {
      const cleanSlug = String(roleSlug).toLowerCase().trim();
      localRole = (MASTER_CAREER_ROLES || []).find(
        (r) =>
          r.id === cleanSlug ||
          r.id.toLowerCase() === cleanSlug ||
          (r.title && r.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === cleanSlug)
      );
    }
    if (localRole) {
      const domainName = localRole.category || 'Technology';
      return {
        ...localRole,
        domain: {
          id: domainName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name: domainName,
        },
        source: 'local',
      };
    }

    return null;
  },

  /**
   * Compare multiple roles by IDs from SQL database
   */
  async compareRoles(roleIds = []) {
    if (!roleIds || roleIds.length === 0) return [];
    try {
      const idsParam = roleIds.join(',');
      const res = await apiClient.get('/career/compare', { params: { roles: idsParam } });
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
    } catch (err) {
      console.warn('[careerService] Fallback to local dataset for compare:', err.message);
    }

    return roleIds.map((id) => localGetRoleById(id)).filter(Boolean);
  },

  /**
   * Fetch aggregate career stats from SQL
   */
  async getCareerStats() {
    try {
      const res = await apiClient.get('/career/stats');
      if (res.data?.success && res.data.data) {
        return res.data.data;
      }
    } catch (err) {
      console.warn('[careerService] Fallback to local stats calculation:', err.message);
    }

    return {
      totalRoles: IT_ROLES.length,
      totalDomains: DOMAIN_CATEGORIES.filter((c) => c !== 'All Domains').length,
      rolesWithSalary: IT_ROLES.length,
      rolesWithSkills: IT_ROLES.length,
      minLpa: 4.5,
      maxLpa: 26.0,
      topSkills: [],
      domainDistribution: DOMAIN_CATEGORIES.filter((c) => c !== 'All Domains').map((name) => ({
        name,
        count: IT_ROLES.filter((r) => r.category === name).length,
      })),
    };
  },

  /**
   * Fetch personalized student career fit for a role from SQL
   */
  async getRoleFit(roleId) {
    if (!roleId) return null;
    try {
      const res = await apiClient.get(`/career/roles/${roleId}/fit`);
      if (res.data?.success && res.data.data) {
        return res.data.data;
      }
    } catch (err) {
      console.warn(`[careerService] Fallback for role fit (${roleId}):`, err.message);
    }

    return null;
  },

  /**
   * Toggle saving a role to student's favorites
   */
  async toggleFavorite(roleId) {
    try {
      const res = await apiClient.post(`/career/roles/${roleId}/favorite`);
      if (res.data?.success) {
        return res.data;
      }
    } catch (err) {
      console.warn('[careerService] Favorite toggle error, falling back to localStorage:', err.message);
    }

    // Local storage fallback
    try {
      const saved = JSON.parse(localStorage.getItem('campuscorp_favorite_roles') || '[]');
      const isFav = saved.includes(roleId);
      const updated = isFav ? saved.filter((id) => id !== roleId) : [...saved, roleId];
      localStorage.setItem('campuscorp_favorite_roles', JSON.stringify(updated));
      return { success: true, saved: !isFav };
    } catch (e) {
      return { success: false };
    }
  },

  /**
   * Get student's favorite roles
   */
  async getFavorites() {
    try {
      const res = await apiClient.get('/career/favorites');
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
    } catch (err) {}

    try {
      const saved = JSON.parse(localStorage.getItem('campuscorp_favorite_roles') || '[]');
      return saved.map((id) => localGetRoleById(id)).filter(Boolean);
    } catch (e) {
      return [];
    }
  },

  /**
   * Get skills and technologies for a role
   */
  async getRoleSkills(roleId) {
    if (!roleId) return null;
    try {
      const res = await apiClient.get(`/career/roles/${roleId}/skills`);
      if (res.data?.success && res.data.data) {
        return res.data.data;
      }
    } catch (err) {
      console.warn(`[careerService] Fallback for role skills (${roleId}):`, err.message);
    }
    const r = localGetRoleById(roleId);
    return r ? { roleId: r.id, roleTitle: r.title, category: r.category, technicalSkills: r.technicalSkills, softSkills: r.softSkills, tools: r.tools } : null;
  },

  /**
   * Get learning roadmap for a role
   */
  async getRoleRoadmap(roleId) {
    if (!roleId) return null;
    try {
      const res = await apiClient.get(`/career/roles/${roleId}/roadmap`);
      if (res.data?.success && res.data.data) {
        return res.data.data;
      }
    } catch (err) {
      console.warn(`[careerService] Fallback for role roadmap (${roleId}):`, err.message);
    }
    const r = localGetRoleById(roleId);
    return r ? { roleId: r.id, roleTitle: r.title, roadmap: r.roadmap } : null;
  },

  /**
   * Get projects for a role
   */
  async getRoleProjects(roleId) {
    if (!roleId) return null;
    try {
      const res = await apiClient.get(`/career/roles/${roleId}/projects`);
      if (res.data?.success && res.data.data) {
        return res.data.data;
      }
    } catch (err) {
      console.warn(`[careerService] Fallback for role projects (${roleId}):`, err.message);
    }
    const r = localGetRoleById(roleId);
    return r ? { roleId: r.id, roleTitle: r.title, projects: r.projects } : null;
  },

  /**
   * Submit student's skill assessment
   */
  async submitAssessment(assessmentData) {
    try {
      const res = await apiClient.post('/career/assessments', assessmentData);
      if (res.data?.success) {
        return res.data;
      }
    } catch (err) {
      console.warn('[careerService] Assessment save error:', err.message);
    }
    return { success: true, saved: false };
  },

  /**
   * Retrieve student's skill assessments
   */
  async getAssessments() {
    try {
      const res = await apiClient.get('/career/assessments');
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
    } catch (err) {
      console.warn('[careerService] Assessment fetch error:', err.message);
    }
    return [];
  },

  /**
   * Get available tags
   */
  async getTags() {
    try {
      const res = await apiClient.get('/career/tags');
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
    } catch (err) {}
    return ROLE_TAGS;
  },

  // -------------------------------------------------------------
  // Location-Based IT Company Explorer Methods
  // -------------------------------------------------------------

  /**
   * Search IT companies by location with comprehensive multi-criteria filters
   */
  async searchCompaniesByLocation(params = {}) {
    try {
      const res = await apiClient.get('/career/companies/location', { params });
      if (res.data?.success && res.data?.data) {
        return res.data.data;
      }
    } catch (err) {
      console.error('[careerService] Error searching companies by location:', err);
      throw err;
    }
    return {
      companies: [],
      pagination: { total: 0, page: 1, limit: 12, totalPages: 0 },
      targetCoords: null,
      providerInfo: { isLive: false }
    };
  },

  /**
   * Fetch company location metadata (cities with counts, domains, types, stats)
   */
  async getCompanyLocationMetadata() {
    try {
      const res = await apiClient.get('/career/companies/locations/meta');
      if (res.data?.success && res.data?.data) {
        return res.data.data;
      }
    } catch (err) {
      console.warn('[careerService] Metadata fetch error:', err.message);
    }
    return {
      cities: [],
      domains: [],
      companyTypes: [],
      experienceLevels: [],
      workModes: [],
      stats: {},
      popularLocations: []
    };
  },

  /**
   * Fetch complete company details with all verified offices, tech stacks, and career openings
   */
  async getCompanyLocationDetails(id, coords = null) {
    if (!id) return null;
    try {
      const params = {};
      if (coords?.lat && coords?.lng) {
        params.lat = coords.lat;
        params.lng = coords.lng;
      }
      const res = await apiClient.get(`/career/companies/${id}`, { params });
      if (res.data?.success && res.data?.data) {
        return res.data.data;
      }
    } catch (err) {
      console.error(`[careerService] Error fetching company details for ${id}:`, err);
      throw err;
    }
    return null;
  },

  /**
   * Admin: Add new office location
   */
  async adminAddOffice(companyId, officeData) {
    const res = await apiClient.post(`/career/companies/admin/${companyId}/offices`, officeData);
    return res.data;
  },

  /**
   * Admin: Update company metadata & tech domains
   */
  async adminUpdateCompany(companyId, companyData) {
    const res = await apiClient.put(`/career/companies/admin/${companyId}`, companyData);
    return res.data;
  },

  /**
   * Admin: Toggle company/office verification or hiring status
   */
  async adminToggleOfficeStatus(target, id, field = 'verify') {
    const res = await apiClient.patch(`/career/companies/admin/${target}/${id}/status`, { field });
    return res.data;
  },
};

export default careerService;
