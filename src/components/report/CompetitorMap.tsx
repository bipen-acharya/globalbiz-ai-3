import dynamic from 'next/dynamic'

export const CompetitorMap = dynamic(
  () => import('./CompetitorMapInner').then(mod => mod.CompetitorMapInner),
  { ssr: false }
)
