/**
 * CampusCorp Domain Knowledge Hub - Unified Educational Content Store
 * Delegates directly to the comprehensive masterDomainKnowledgeEngine.
 * 100% backward compatible with all existing controllers, services, and tests.
 */

const { CAREER_FAMILIES } = require('./masterCareerDomains');
const {
  MASTER_DOMAIN_KNOWLEDGE_STORE,
  getAllKnowledgeDomains,
  getKnowledgeDomainById,
  getKnowledgeModule
} = require('./masterDomainKnowledgeEngine');

const DOMAIN_KNOWLEDGE_STORE = MASTER_DOMAIN_KNOWLEDGE_STORE;

module.exports = {
  DOMAIN_KNOWLEDGE_STORE,
  getAllKnowledgeDomains,
  getKnowledgeDomainById,
  getKnowledgeModule,
  CAREER_FAMILIES
};
