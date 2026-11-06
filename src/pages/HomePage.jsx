import React from 'react';
import SEOHead from '../components/SEOHead';
import AnimatedPageWrapper from '../components/AnimatedPageWrapper';
import HeroSection from '../components/HeroSection';
import InstitutionalPlatformSection from '../components/InstitutionalPlatformSection';
import TechnicalCapabilitiesSection from '../components/TechnicalCapabilitiesSection';
import ConnectedEcosystemFlow from '../components/ConnectedEcosystemFlow';
import CompanyCareerDiscovery from '../components/CompanyCareerDiscovery';
import WhyCampusCorpo from '../components/WhyCampusCorpo';
import CallToAction from '../components/CallToAction';
import { routesSEO } from '../data/seoData';

export default function HomePage({ onOpenDemo }) {
  const seo = routesSEO.home;

  return (
    <AnimatedPageWrapper>
      <SEOHead
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        path={seo.path}
        breadcrumbs={seo.breadcrumbs}
        faqs={seo.faqs}
      />

      {/* Section 1: Hero */}
      <HeroSection onOpenDemo={onOpenDemo} />

      {/* Section 2: Institutional Platform (5 Core Modules) */}
      <InstitutionalPlatformSection />

      {/* Section 3: Advanced Technical Capabilities (Programming & Mock Interviews) */}
      <TechnicalCapabilitiesSection />

      {/* Section 4: Connected Campus Ecosystem (8-Step Lifecycle) */}
      <ConnectedEcosystemFlow />

      {/* Section 5: Career & Company Discovery (Hokaido-Style Horizontal Experience) */}
      <CompanyCareerDiscovery onOpenDemo={onOpenDemo} />

      {/* Section 6: Why CampusCorpo? (6 Verified Benefits) */}
      <WhyCampusCorpo onOpenDemo={onOpenDemo} />

      {/* Section 7: Final CTA ("Smarter Placements Start Here") */}
      <CallToAction onOpenDemo={onOpenDemo} />
    </AnimatedPageWrapper>
  );
}
