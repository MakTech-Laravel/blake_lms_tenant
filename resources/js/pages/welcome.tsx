import { Head } from '@inertiajs/react';
import { AnalyticsSection } from '@/components/landing/analytics-section';
import { ComparisonSection } from '@/components/landing/comparison-section';
import { DemoCtaSection } from '@/components/landing/demo-cta-section';
import { FaqSection } from '@/components/landing/faq-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { HeroSection } from '@/components/landing/hero-section';
import { LandingFooter } from '@/components/landing/landing-footer';
import { LandingNav } from '@/components/landing/landing-nav';
import { MultiLocationSection } from '@/components/landing/multi-location-section';
import { PricingSection } from '@/components/landing/pricing-section';
import { RoadmapSection } from '@/components/landing/roadmap-section';
import { TestimonialSection } from '@/components/landing/testimonial-section';

export default function Welcome() {
    return (
        <>
            <Head title="AquaCert — Swim School Staff Performance" />
            <div id="top" className="min-h-screen bg-white text-navy-500">
                <LandingNav />
                <main>
                    <HeroSection />
                    <ComparisonSection />
                    <FeaturesSection />
                    <RoadmapSection />
                    <AnalyticsSection />
                    <MultiLocationSection />
                    <PricingSection />
                    <TestimonialSection />
                    <FaqSection />
                    <DemoCtaSection />
                </main>
                <LandingFooter />
            </div>
        </>
    );
}
