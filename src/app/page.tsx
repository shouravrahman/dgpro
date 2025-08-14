import { Navbar } from '@/components/layout/navbar';
import { Hero } from '@/components/sections/hero';
import { Features } from '@/components/sections/features';
import { TopProducts } from '@/components/sections/top-products';
import { Testimonials } from '@/components/sections/testimonials';
import { Pricing } from '@/components/sections/pricing';
import { CTA } from '@/components/sections/cta';
import { Footer } from '@/components/layout/footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <TopProducts />
        <Testimonials />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
