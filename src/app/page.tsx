import { Navbar } from '@/components/layout/navbar';
import { Hero } from '@/components/sections/hero';
import { Features } from '@/components/sections/features';
import { ProductShowcase } from '@/components/sections/ProductShowcase';
import { TopProducts } from '@/components/sections/top-products';
import { Testimonials } from '@/components/sections/testimonials';
import { Pricing } from '@/components/sections/pricing';
import { CTA } from '@/components/sections/cta';
import { Footer } from '@/components/layout/footer';
import { ScrollAnimations } from '@/components/effects/ScrollAnimations';

export default function Home() {
  return (
    <div className="min-h-screen">
      <ScrollAnimations />
      <Navbar />
      <main>
        <Hero />
        <Features />
        <ProductShowcase />
        <TopProducts />
        <Testimonials />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
