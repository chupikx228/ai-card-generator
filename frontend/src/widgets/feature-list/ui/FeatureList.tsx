import type { ComponentType, SVGProps } from 'react'
import {
  CloudOffIcon,
  DevicesIcon,
  FlameIcon,
  RepeatIcon,
  SparklesIcon,
} from '@/shared/ui/icon'
import { FeatureCard } from '@/shared/ui/feature-card'

type Feature = {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: SparklesIcon,
    title: 'ШІ-генерація колод',
    description: 'Введи тему — і отримай готовий набір карток замість того, щоб писати їх вручну.',
  },
  {
    icon: RepeatIcon,
    title: 'Планування за FSRS',
    description: 'Кожна картка повертається саме тоді, коли ти майже забув відповідь.',
  },
  {
    icon: CloudOffIcon,
    title: 'Працює офлайн',
    description: 'Повторюй будь-де; синхронізація відбувається, щойно зʼявляється мережа.',
  },
  {
    icon: DevicesIcon,
    title: 'Один інтерфейс усюди',
    description: 'Однаково зручно на телефоні, планшеті й компʼютері — без переписування коду.',
  },
  {
    icon: FlameIcon,
    title: 'Серії та прогрес',
    description: 'Щоденний стрік і чесні цифри замість декоративних досягнень.',
  },
]

export const FeatureList = () => (
  <section id="features" className="px-gutter py-section">
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.04em] text-muted">Можливості</p>
      <h2 className="mt-2 font-serif text-3xl font-semibold text-foreground sm:text-4xl">
        Усе для повторення, що адаптується до тебе
      </h2>
    </div>

    <ul className="mx-auto mt-8 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map(({ icon, title, description }) => (
        <li key={title}>
          <FeatureCard icon={icon} title={title} description={description} className="h-full" />
        </li>
      ))}
    </ul>
  </section>
)
