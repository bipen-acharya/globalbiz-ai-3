'use client'

import type { NearbyCompetitorData, CompetitorThreat } from '@/types'
import { priceLevelLabel } from '@/lib/utils'

function DensityBadge({ density }: { density: NearbyCompetitorData['competitor_density'] }) {
  const styles = {
    low:       { background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', color: '#00FF88' },
    medium:    { background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: 'rgba(251,191,36,0.9)' },
    high:      { background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00D4FF' },
    saturated: { background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: 'rgba(248,113,113,0.9)' },
  }
  return (
    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full capitalize" style={styles[density]}>
      {density}
    </span>
  )
}

function StarRating({ rating }: { rating: number | null }) {
  if (rating === null) return <span className="text-xs" style={{ color: 'var(--text-muted)' }}>No rating</span>
  const full = Math.floor(rating)
  return (
    <span className="flex items-center gap-1 text-xs font-medium" style={{ color: 'rgba(251,191,36,0.9)' }}>
      {'★'.repeat(full)}{'☆'.repeat(5 - full)} {rating.toFixed(1)}
    </span>
  )
}

interface Props {
  nearby: NearbyCompetitorData
  threats: CompetitorThreat[]
}

export function NearbyCompetitors({ nearby, threats }: Props) {
  const sourceLabel = nearby.source === 'google' ? 'Google Maps' : nearby.source === 'osm' ? 'OpenStreetMap' : 'Estimated'

  return (
    <div className="space-y-5">
      {/* Summary stats */}
      <div className="ui-card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <span className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Nearby competitor intelligence
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>via {sourceLabel}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Total found</div>
            <div className="font-display text-2xl font-bold" style={{ color: nearby.total_found === 0 ? '#00FF88' : 'var(--text-primary)' }}>{nearby.total_found}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>within {nearby.search_radius_km}km</div>
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Avg. rating</div>
            <div className="font-display text-2xl font-bold" style={{ color: 'rgba(251,191,36,0.9)' }}>
              {nearby.avg_rating !== null ? nearby.avg_rating.toFixed(1) : '—'}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>out of 5.0</div>
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Avg. price</div>
            <div className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {nearby.avg_price_level !== null ? priceLevelLabel(Math.round(nearby.avg_price_level)) : '—'}
            </div>
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Density</div>
            <div className="mt-1"><DensityBadge density={nearby.competitor_density} /></div>
          </div>
        </div>
        {(nearby.shopping_center_anchors?.length || nearby.food_hotspots?.length || nearby.local_retail_clusters?.length) ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {(['Shopping centre anchors', 'Food hotspots', 'Retail clusters'] as const).map((title, idx) => {
              const data = [nearby.shopping_center_anchors, nearby.food_hotspots, nearby.local_retail_clusters][idx]
              const empty = ['No major shopping-centre anchor detected.', 'No food hotspot cluster detected.', 'No strong retail cluster detected.'][idx]
              return (
                <div key={title} className="rounded-xl p-3 text-xs" style={{ border: '1px solid var(--border-soft)', background: 'rgba(255,255,255,0.03)' }}>
                  <div className="mb-1 font-medium" style={{ color: 'var(--text-primary)' }}>{title}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{data?.length ? data.slice(0, 3).join(', ') : empty}</div>
                </div>
              )
            })}
          </div>
        ) : null}
      </div>

      {/* Empty competitor state */}
      {nearby.competitors.length === 0 && (
        <div
          className="ui-card p-6 text-center"
          style={{ border: '1px solid rgba(0,255,136,0.2)', background: 'rgba(0,255,136,0.04)' }}
        >
          <div className="mb-2 text-2xl">🌿</div>
          <div className="font-display font-semibold mb-1" style={{ color: '#00FF88' }}>
            No direct competitors found — this could be an opportunity!
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            The scan did not find any direct competitors in your area. This may indicate an underserved market or a new niche worth exploring.
          </p>
        </div>
      )}

      {/* Top threats */}
      {threats.length > 0 && (
        <div className="ui-card p-5">
          <div className="font-display font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
            Strong local players and opportunity gaps
          </div>
          <div className="space-y-3">
            {threats.map((t, i) => {
              const threatStyle = t.threat_level === 'strong'
                ? { background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.25)', label: 'rgba(251,191,36,0.9)' }
                : t.threat_level === 'established'
                ? { background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)', label: '#00D4FF' }
                : t.threat_level === 'opportunity'
                ? { background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.2)', label: '#00FF88' }
                : { background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-soft)', label: 'var(--text-muted)' }
              return (
                <div
                  key={i}
                  className="rounded-xl p-4 transition-all"
                  style={{ background: threatStyle.background, border: threatStyle.border }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '' }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{t.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t.address}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full capitalize" style={{ color: threatStyle.label, border: `1px solid ${threatStyle.label}33`, background: `${threatStyle.label}12` }}>
                        {t.threat_level === 'strong' ? 'Strong competitor' :
                          t.threat_level === 'established' ? 'Established local player' :
                          t.threat_level === 'opportunity' ? 'Opportunity gap' :
                          'Needs differentiation'}
                      </span>
                      <StarRating rating={t.rating} />
                      {t.review_count !== null && (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.review_count} reviews</span>
                      )}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="rounded-lg p-3 text-xs" style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)' }}>
                      <div className="font-medium mb-1" style={{ color: '#00D4FF' }}>What this tells you</div>
                      <div style={{ color: 'var(--text-secondary)' }}>{t.why_threat}</div>
                    </div>
                    <div className="rounded-lg p-3 text-xs" style={{ background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.15)' }}>
                      <div className="font-medium mb-1" style={{ color: '#00FF88' }}>How to differentiate</div>
                      <div style={{ color: 'var(--text-secondary)' }}>{t.how_to_beat}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Full competitor list */}
      {nearby.competitors.length > 0 && (
        <div className="ui-card p-5">
          <div className="font-display font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
            All {nearby.competitors.length} nearby businesses
          </div>
          <div className="space-y-0">
            {nearby.competitors.map((c, i) => (
              <div
                key={c.place_id}
                className="flex items-center justify-between gap-3 py-2.5 transition-colors"
                style={{ borderBottom: i < nearby.competitors.length - 1 ? '1px solid var(--border-soft)' : 'none' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs w-5 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
                  <div className="min-w-0">
                    <div className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{c.name}</div>
                    <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{c.address}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 text-xs">
                  {c.rating !== null && (
                    <span className="font-medium" style={{ color: 'rgba(251,191,36,0.9)' }}>{c.rating.toFixed(1)}★</span>
                  )}
                  {c.distance_km !== null && (
                    <span style={{ color: 'var(--text-muted)' }}>{c.distance_km}km</span>
                  )}
                  {c.open_now !== null && (
                    <span style={{ color: c.open_now ? '#00FF88' : 'var(--text-muted)' }}>
                      {c.open_now ? 'Open' : 'Closed'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
