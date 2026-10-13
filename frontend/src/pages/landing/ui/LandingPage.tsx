import { SiteHeader } from '@/widgets/site-header'
import { Hero } from '@/widgets/hero'
import { FeatureList } from '@/widgets/feature-list'
import { ReviewDemo } from '@/widgets/review-demo'
import { SiteFooter } from '@/widgets/site-footer'

export const LandingPage = () => (
  <div id="top" className="min-h-dvh">
    <SiteHeader />
    <main>
      <Hero />
      <FeatureList />
      <ReviewDemo />
    </main>
    <SiteFooter />
  </div>
)
