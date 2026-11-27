/**
 * CampusCorp Domain Knowledge Hub - Client Educational Content Store
 * Delegates directly to the comprehensive masterDomainKnowledgeEngine.
 * 100% backward compatible with all existing components and services.
 */

import { CAREER_FAMILIES } from './masterCareerDomains.js';
import {
  MASTER_DOMAIN_KNOWLEDGE_STORE,
  getAllKnowledgeDomains,
  getKnowledgeDomainById,
  getKnowledgeModule
} from './masterDomainKnowledgeEngine.js';

export const DOMAIN_KNOWLEDGE_STORE = MASTER_DOMAIN_KNOWLEDGE_STORE;

export {
  getAllKnowledgeDomains,
  getKnowledgeDomainById,
  getKnowledgeModule,
  CAREER_FAMILIES
};

export default {
  DOMAIN_KNOWLEDGE_STORE,
  getAllKnowledgeDomains,
  getKnowledgeDomainById,
  getKnowledgeModule,
  CAREER_FAMILIES
};
