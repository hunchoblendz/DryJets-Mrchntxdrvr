import { Hero } from '@/components/home/Hero';
import { HowItWorks } from '@/components/home/HowItWorks';
import { ServicesShowcase } from '@/components/home/ServicesShowcase';
import { ProcessGallery } from '@/components/home/ProcessGallery';
import { TrustBadges } from '@/components/home/TrustBadges';
import { Testimonials } from '@/components/home/Testimonials';
import { PricingPreview } from '@/components/home/PricingPreview';
import { FinalCTA } from '@/components/home/FinalCTA';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <HowItWorks />
      <ServicesShowcase />
      <ProcessGallery />
      <TrustBadges />
      <Testimonials />
      <PricingPreview />
      <FinalCTA />
    </main>
  );
}
