import apiClient from '../api/client';
import {
  IT_ROLES,
  DOMAIN_CATEGORIES,
  ROLE_TAGS,
  filterRoles as localFilterRoles,
  getRoleById as localGetRoleById,
} from '../data/itRoles';

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
      if (err.response?.status === 404) {
        return { notFound: true, message: `Domain '${slug}' not found.` };
      }
      console.warn('[careerService] Fallback to local dataset for domain by slug:', err.message);
    }

    // Local fallback
    const matchedCategory = DOMAIN_CATEGORIES.find(
      (c) => c !== 'All Domains' && (
        c.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug.toLowerCase() ||
        c.toLowerCase() === slug.toLowerCase()
      )
    );

    if (!matchedCategory) {
      return { notFound: true, message: `Domain '${slug}' not found.` };
    }

    const domainRoles = IT_ROLES.filter((r) => r.category === matchedCategory);
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
      (r.tools || []).forEach((t) => toolsSet.add(t));
    });

    return {
      domain: {
        id: matchedCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: matchedCategory,
        description: `Explore specialized career roles, competency benchmarks, and learning pathways in ${matchedCategory}.`,
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

    return localGetRoleById(roleId);
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
    const localRole = localGetRoleById(roleSlug);
    if (localRole) {
      const domainName = localRole.category;
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
};

export default careerService;
