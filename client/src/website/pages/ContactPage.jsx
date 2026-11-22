import React from 'react';
import SEOHead from '../components/SEOHead';
import Breadcrumb from '../components/Breadcrumb';
import FAQSection from '../components/FAQSection';
import Contact from '../components/Contact';
import AnimatedPageWrapper from '../components/AnimatedPageWrapper';
import { routesSEO } from '../data/seoData';

export default function ContactPage() {
  const seo = routesSEO.contact;

  return (
    <AnimatedPageWrapper className="pt-24 pb-20 bg-white">
      <SEOHead
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        path={seo.path}
        breadcrumbs={seo.breadcrumbs}
        faqs={seo.faqs}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <Breadcrumb items={[
          { name: 'Contact CampusCorpo', href: '/contact' }
        ]} />
      </div>

      <Contact />

      <FAQSection 
        faqs={seo.faqs}
        title="Frequently Asked Questions: Contact &amp; Onboarding"
        subtitle="Direct answers on institutional scheduling, consultations, and deployment timelines."
      />
    </AnimatedPageWrapper>
  );
}

