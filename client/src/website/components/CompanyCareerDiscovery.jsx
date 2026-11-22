import React from 'react';
import HorizontalIntelligence from './horizontal/HorizontalIntelligence';

/**
 * CompanyCareerDiscovery
 * Wraps the scroll-driven, pinned 5-chapter Horizontal Intelligence experience.
 */
export default function CompanyCareerDiscovery({ onOpenDemo }) {
  return <HorizontalIntelligence onOpenDemo={onOpenDemo} />;
}
