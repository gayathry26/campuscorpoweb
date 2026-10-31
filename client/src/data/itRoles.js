/**
 * CampusCorp IT Career Explorer - Master Unified IT Dataset
 * Re-exports the complete 38 IT Domains and comprehensive IT Job Roles Catalogue.
 * Preserves 100% backward compatibility with all existing imports.
 */

import { CAREER_DOMAINS, CAREER_FAMILIES, CAREER_LEVELS } from './masterCareerDomains';
import { MASTER_CAREER_ROLES } from './masterCareerRoles';

export { CAREER_DOMAINS, CAREER_FAMILIES, CAREER_LEVELS };
export { MASTER_CAREER_ROLES };

// Full list of 38 domains categories
export const DOMAIN_CATEGORIES = [
  'All Domains',
  ...CAREER_DOMAINS.map((d) => d.name),
];

export const ROLE_TAGS = [
  'Coding',
  'Non-Coding',
  'Creative',
  'Emerging',
  'Management',
  'Hybrid',
];

// Unified IT_ROLES containing all comprehensive roles across all 38 domains
export const IT_ROLES = MASTER_CAREER_ROLES;

/**
 * Helper utilities for querying dataset
 */
export function getAllRoles() {
  return IT_ROLES;
}

export function getRoleById(id) {
  if (!id) return null;
  const cleanId = String(id).toLowerCase().trim();
  return (
    IT_ROLES.find(
      (r) =>
        r.id === cleanId ||
        r.id.toLowerCase() === cleanId ||
        r.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === cleanId
    ) || null
  );
}

export function getRolesByCategory(category) {
  if (!category || category === 'All Domains') return IT_ROLES;
  return IT_ROLES.filter(
    (r) => r.category.toLowerCase() === category.toLowerCase()
  );
}

export function getRolesByDomain(domainSlug) {
  if (!domainSlug) return [];
  const clean = domainSlug.toLowerCase();
  return IT_ROLES.filter(
    (r) =>
      (r.domainIds && r.domainIds.some((d) => d.toLowerCase() === clean)) ||
      r.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') === clean
  );
}

export function getCategories() {
  return DOMAIN_CATEGORIES;
}

export function getAllTags() {
  return ROLE_TAGS;
}

export function filterRoles({
  query = '',
  searchQuery = '',
  category = 'All Domains',
  family = 'All Families',
  level = 'All Levels',
  tags = [],
  beginnerOnly = false,
  skill = '',
}) {
  const q = (query || searchQuery || '').toLowerCase().trim();
  const targetSkill = (skill || '').toLowerCase().trim();

  return IT_ROLES.filter((role) => {
    // 1. Category match
    if (category && category !== 'All Domains') {
      if (role.category.toLowerCase() !== category.toLowerCase()) {
        return false;
      }
    }

    // 2. Family match (derived from domain)
    if (family && family !== 'All Families') {
      const domainObj = CAREER_DOMAINS.find(
        (d) =>
          d.name.toLowerCase() === role.category.toLowerCase() ||
          (role.domainIds && role.domainIds.includes(d.id))
      );
      if (!domainObj || domainObj.family !== family) {
        return false;
      }
    }

    // 3. Level match
    if (level && level !== 'All Levels') {
      if (role.level !== level) {
        return false;
      }
    }

    // 4. Beginner friendly filter
    if (beginnerOnly && !role.isBeginnerFriendly) {
      return false;
    }

    // 5. Skill specific match
    if (targetSkill) {
      const hasSkill =
        (role.technicalSkills || []).some((s) =>
          s.toLowerCase().includes(targetSkill)
        ) ||
        (role.tools || []).some((t) => t.toLowerCase().includes(targetSkill));
      if (!hasSkill) return false;
    }

    // 6. Tags match (must match all selected tags if any)
    if (tags && tags.length > 0) {
      const roleTagsLower = (role.tags || []).map((t) => t.toLowerCase());
      const hasAllTags = tags.every((t) =>
        roleTagsLower.includes(t.toLowerCase())
      );
      if (!hasAllTags) return false;
    }

    // 7. General search query across title, category, description, technicalSkills, tools, responsibilities
    if (q) {
      const matchTitle = role.title.toLowerCase().includes(q);
      const matchCat = role.category.toLowerCase().includes(q);
      const matchDesc = (role.shortDescription || '').toLowerCase().includes(q);
      const matchSkills = (role.technicalSkills || []).some((s) =>
        s.toLowerCase().includes(q)
      );
      const matchTools = (role.tools || []).some((t) =>
        t.toLowerCase().includes(q)
      );
      const matchTags = (role.tags || []).some((t) =>
        t.toLowerCase().includes(q)
      );
      const matchDeliverables = (role.deliverables || []).some((d) =>
        d.toLowerCase().includes(q)
      );

      if (
        !matchTitle &&
        !matchCat &&
        !matchDesc &&
        !matchSkills &&
        !matchTools &&
        !matchTags &&
        !matchDeliverables
      ) {
        return false;
      }
    }

    return true;
  });
}

export default IT_ROLES;
