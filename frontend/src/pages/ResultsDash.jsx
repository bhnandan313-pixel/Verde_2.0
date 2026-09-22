import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useEngineStore from '../store/useEngineStore';
import { Button } from '../components/ui/Button';

/**
 * ResultsDash — Route: /results
 * Page 2: Shows three packaging recommendations (Best, Budget, Premium)
 * with colour-coded badges, material images, specs, score bars, and an animated gradient border.
 */

// ── Badge colour config ──────────────────────────────────────────────────────
const BADGE_CONFIG = {
  'Best Pick': {
    icon: '🏆',
    pill: 'bg-emerald-500/90 text-white border border-emerald-400/50',
    border: 'border-emerald-500/40',
    glow: 'shadow-[0_0_30px_rgba(16,185,129,0.12)]',
    accent: 'text-emerald-400',
    bar: 'bg-emerald-500',
    ring: 'ring-emerald-500/30',
    label: 'text-emerald-300',
    sub: 'Balanced · Cost-effective · Eco-friendly',
    gradient: 'bg-[conic-gradient(from_90deg_at_50%_50%,#a7f3d0_0%,#059669_50%,#a7f3d0_100%)]',
  },
  'Budget Choice': {
    icon: '💸',
    pill: 'bg-sky-500/90 text-white border border-sky-400/50',
    border: 'border-sky-500/40',
    glow: 'shadow-[0_0_30px_rgba(14,165,233,0.12)]',
    accent: 'text-sky-400',
    bar: 'bg-sky-500',
    ring: 'ring-sky-500/30',
    label: 'text-sky-300',
    sub: 'Lowest cost per unit',
    gradient: 'bg-[conic-gradient(from_90deg_at_50%_50%,#bae6fd_0%,#0284c7_50%,#bae6fd_100%)]',
  },
  'Premium Choice': {
    icon: '💎',
    pill: 'bg-amber-500/90 text-white border border-amber-400/50',
    border: 'border-amber-400/40',
    glow: 'shadow-[0_0_30px_rgba(251,191,36,0.12)]',
    accent: 'text-amber-400',
    bar: 'bg-amber-400',
    ring: 'ring-amber-400/30',
    label: 'text-amber-300',
    sub: 'Highest barrier protection',
    gradient: 'bg-[conic-gradient(from_90deg_at_50%_50%,#fde68a_0%,#d97706_50%,#fde68a_100%)]',
  },
};

// Assigns a contextual packaging placeholder image based on the category
function getMaterialImage(category) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('edible') || cat.includes('coating')) {
    // Organic/Eco texture
    return 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=600&auto=format&fit=crop';
  }
  if (cat.includes('mono') || cat.includes('pe') || cat.includes('recyclable')) {
    // Clean, clear plastic film roll
    return 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?q=80&w=600&auto=format&fit=crop';
  }
  if (cat.includes('conventional') || cat.includes('pet')) {
    // Standard plastic/bubble texture
    return 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=600&auto=format&fit=crop';
  }
  // Generic high-tech film/foil fallback
  return 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?q=80&w=600&auto=format&fit=crop';
}

function ScoreBar({ score, barClass }) {
  const pct = Math.round((score ?? 0) * 100);
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Match score</span>
        <span className="font-mono text-gray-300">{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function SpecRow({ label, value, unit, highlight }) {
  return (
    <li className="flex justify-between items-baseline border-b border-gray-800/70 pb-2 last:border-0">
      <span className="text-gray-500 text-xs">{label}</span>
      <span className={`font-mono text-sm ${highlight ?? 'text-gray-200'}`}>
        {value}
        {unit && <span className="text-xs text-gray-600 ml-1">{unit}</span>}
      </span>
    </li>
  );
}

function RecommendationCard({ mat, isMain }) {
  const cfg = BADGE_CONFIG[mat.badge] ?? BADGE_CONFIG['Best Pick'];
  const matImage = mat.image_url || getMaterialImage(mat.category);

  return (
    <div
      className={`
        group relative overflow-hidden rounded-[16px] p-[1px]
        transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl
        ${isMain ? 'lg:col-span-1' : 'lg:col-span-1'}
      `}
    >
      {/* Animated Gradient Background Border Layer */}
      <div className={`absolute inset-[-100%] animate-[spin_3s_linear_infinite] ${cfg.gradient} opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
      
      {/* Inner Card Content */}
      <div className={`relative flex flex-col h-full bg-gray-900 rounded-[15px] p-5 z-10 ${cfg.glow}`}>
        
        {/* Top Image Banner (~1/4 of card height) */}
        <div className="relative w-full h-36 md:h-40 shrink-0 mb-5 rounded-xl overflow-hidden bg-gray-950 border border-gray-800/50">
          <img 
            src={matImage} 
            alt={mat.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-80 group-hover:opacity-100" 
          />
          
          {/* Floating Badges */}
          <div className="absolute top-2 left-2 z-20">
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md shadow-lg ${cfg.pill}`}>
              <span>{cfg.icon}</span> {mat.badge}
            </span>
          </div>
          
          {mat.is_recyclable && (
            <div className="absolute top-2 right-2 z-20">
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 shadow-lg px-2 py-0.5 rounded-full uppercase tracking-widest">
                ♻ Eco
              </span>
            </div>
          )}

          {/* Bottom Fade Overlay for readable text beneath */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />
        </div>

        {/* Name & sub-label */}
        <h2 className={`text-xl font-extrabold text-white leading-tight line-clamp-2`}>{mat.name}</h2>
        <p className={`text-xs mt-1 mb-2 font-medium ${cfg.label}`}>{cfg.sub}</p>
        <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-2">
          {mat.description}
        </p>

        {/* Score bar */}
        {mat.score != null && <ScoreBar score={mat.score} barClass={cfg.bar} />}

        <hr className="border-gray-800 my-4" />

        {/* Specs */}
        <ul className="space-y-2 text-sm flex-1">
          <SpecRow label="Cost / unit" value={`$${mat.cost_per_kg?.toFixed(2) ?? '—'}`} />
          <SpecRow label="OTR limit" value={mat.otr ?? '—'} unit="cc/m²/day" />
          <SpecRow label="WVTR limit" value={mat.wvtr ?? '—'} unit="g/m²/day" />
          <SpecRow
            label="Recyclable"
            value={mat.is_recyclable ? 'Yes' : 'No'}
            highlight={mat.is_recyclable ? 'text-emerald-400' : 'text-amber-400'}
          />
          <SpecRow label="Material type" value={mat.material_type?.replace('_', ' ') ?? '—'} />
          {mat.supported_temperature_conditions?.length > 0 && (
            <SpecRow
              label="Temperature"
              value={mat.supported_temperature_conditions.join(', ')}
              highlight="text-sky-300 text-xs truncate max-w-[150px] inline-block text-right"
            />
          )}
          {mat.supported_storage_types?.length > 0 && (
            <SpecRow
              label="Rated storage"
              value={mat.supported_storage_types.slice(0, 2).join(', ')}
              highlight="text-emerald-300 text-xs truncate max-w-[150px] inline-block text-right"
            />
          )}
        </ul>
      </div>
    </div>
  );
}

export default function ResultsDash() {
  const navigate = useNavigate();
  const { result, resetForm } = useEngineStore();
  const [showScreeningMatrix, setShowScreeningMatrix] = useState(false);

  // Guard: result has never been fetched
  if (!result || !result.product) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white gap-4 px-4">
        <p className="text-5xl mb-2">🔬</p>
        <h2 className="text-xl font-bold text-white">No Analysis Run Yet</h2>
        <p className="text-gray-400 text-sm text-center max-w-sm">Select a dairy product and run the engine to get packaging recommendations.</p>
        <Button
          onClick={() => navigate('/')}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-md mt-2"
        >
          Go to Engine
        </Button>
      </div>
    );
  }

  // Guard: result ran but NO materials matched the filters
  const hasMatches = !!(result.best_pick || result.recommended_material);
  if (!hasMatches) {
    const failures = result.failure_matrix || [];
    const isLiquid = result.product?.phase_state === 'liquid';

    return (
      <main className="min-h-screen bg-gray-950 px-4 py-12 font-sans text-gray-200">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Card */}
          <div className="bg-gradient-to-br from-amber-950/30 via-gray-900 to-gray-950 border border-amber-500/30 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                Active Material R&D Notice
              </span>
              {result.selected_storage_type && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
                  Purpose: {result.selected_storage_type}
                </span>
              )}
              {result.selected_temperature_condition && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
                  Temp: {result.selected_temperature_condition}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              We are researching on more materials / The materials cannot be found
            </h1>

            <p className="text-gray-300 mt-3 text-base leading-relaxed max-w-2xl">
              No certified eco-friendly packaging material in our catalog currently satisfies the containment, barrier, and physical transport requirements for <strong className="text-emerald-400 font-semibold">{result.product?.name ?? 'this dairy product'}</strong>.
            </p>

            {/* Scientific Logic Explanation Banner */}
            <div className="mt-6 p-4 rounded-xl bg-gray-950/70 border border-amber-500/20 text-sm text-gray-300 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
                <span>🔬</span> Physical & Containment Science
              </div>
              {isLiquid ? (
                <p className="text-xs text-gray-400 leading-relaxed">
                  Liquid milk requires aseptic hermetic fluid containment (e.g. multi-layer barrier liquid cartons or leakproof blow-moulded bottles). Porous paper wraps (like Kraft paper), moulded fibre trays, or bioplastic wraps cannot safely hold or transport liquid milk without rapid barrier collapse, leakage, and microbial spoilage. Our team is actively researching commercial-grade biopolymer liquid cartons for this application.
                </p>
              ) : (
                <p className="text-xs text-gray-400 leading-relaxed">
                  The physical characteristics of this commodity (moisture {result.product?.moisture_content}%, pH {result.product?.pH}) combined with your selected storage purpose or temperature conditions exceed the safety limits of all {failures.length} currently indexed bio-materials.
                </p>
              )}
            </div>
          </div>

          {/* Collapsible Material Screening Matrix */}
          {failures.length > 0 && (
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden shadow-lg transition-all">
              <button
                type="button"
                onClick={() => setShowScreeningMatrix(!showScreeningMatrix)}
                className="w-full flex items-center justify-between p-5 bg-gray-900/90 hover:bg-gray-850 transition-colors text-left group cursor-pointer"
                id="toggle-screening-matrix-btn"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-sm shrink-0">
                    🛡️
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                      Material Screening Matrix
                      <span className="text-xs text-gray-400 font-normal">({failures.length} Evaluated)</span>
                    </h3>
                    <p className="text-xs text-gray-400">
                      {showScreeningMatrix ? 'Click to collapse failure breakdown' : 'Click to see why each candidate was rejected'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 group-hover:text-white shrink-0">
                  <span className="font-mono text-xs">{showScreeningMatrix ? 'Collapse' : 'Expand Matrix'}</span>
                  <span className={`text-sm transition-transform duration-200 ${showScreeningMatrix ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
              </button>

              {showScreeningMatrix && (
                <div className="p-6 pt-2 border-t border-gray-800/80">
                  <div className="flex items-center justify-between py-2 mb-2 text-xs text-gray-400">
                    <span>Candidate materials filtered by physical, phase & temperature tolerances:</span>
                    <span className="text-amber-400/80 font-mono">Strict safety filter</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-gray-300">
                      <thead className="text-gray-500 uppercase tracking-wider text-[11px] bg-gray-950/40">
                        <tr>
                          <th className="py-2.5 px-4 font-semibold rounded-l-lg">Material</th>
                          <th className="py-2.5 px-4 font-semibold">Category</th>
                          <th className="py-2.5 px-4 font-semibold rounded-r-lg">Scientific Rejection Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/60">
                        {failures.map((fm, i) => (
                          <tr key={i} className="hover:bg-gray-800/30 transition-colors">
                            <td className="py-3 px-4 font-medium text-white whitespace-nowrap">
                              {fm.name}
                            </td>
                            <td className="py-3 px-4 text-gray-400 whitespace-nowrap">
                              {fm.category || 'Eco-Friendly'}
                            </td>
                            <td className="py-3 px-4">
                              <ul className="space-y-1">
                                {(fm.failure_reasons ?? []).map((r, j) => (
                                  <li key={j} className="text-red-400/90 flex items-start gap-1.5">
                                    <span className="text-red-500 font-bold shrink-0">✕</span>
                                    <span>{r}</span>
                                  </li>
                                ))}
                              </ul>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button
              onClick={() => navigate('/')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-xl shadow-lg transition-all"
            >
              ← Choose Another Dairy Commodity
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="border-gray-700 hover:bg-gray-800 text-gray-300 font-medium px-6 py-2.5 rounded-xl"
            >
              Adjust Storage / Temp Parameters
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // Support both new (best_pick) and old (recommended_material) response shape
  const best    = result.best_pick    ?? result.recommended_material;
  const budget  = result.budget_pick  ?? result.recommended_material;
  const premium = result.premium_pick ?? result.recommended_material;

  // Collect all unique picks so duplicates (when only 1 match exists) are deduplicated
  const picks = [];
  const seen = new Set();
  for (const pick of [best, budget, premium]) {
    if (pick && !seen.has(pick.id)) {
      seen.add(pick.id);
      picks.push(pick);
    }
  }

  const handleStartOver = () => {
    resetForm();
    navigate('/');
  };

  // Failure risks — always from the best pick
  const failureRisks = best?.failure_risks ?? [];

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-12 font-sans text-gray-200 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* ── Header ── */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-800 pb-6 gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-emerald-500 font-bold tracking-wider text-sm uppercase">
                Packaging Recommendations
              </span>
              {result.selected_temperature_condition && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-950/80 text-sky-400 border border-sky-500/40">
                  <span>🌡️</span> {result.selected_temperature_condition}
                </span>
              )}
              {result.selected_storage_type && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                  <span>📦</span> {result.selected_storage_type}
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              {result.product?.name ?? 'Your Product'}
            </h1>
            <p className="text-gray-400 mt-2 text-sm md:text-base max-w-2xl">
              We found <span className="text-white font-semibold">{picks.length}</span> packaging
              {picks.length !== 1 ? ' options' : ' option'} that meet your requirements — ranked
              by fit, cost, and barrier performance.
            </p>
          </div>
          <Button
            onClick={handleStartOver}
            className="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 px-4 py-2 rounded-md whitespace-nowrap z-20 relative"
          >
            ← Start Over
          </Button>
        </header>

        {/* ── Three recommendation cards ── */}
        <section>
          <div className={`grid gap-6 ${
            picks.length === 1 ? 'grid-cols-1 max-w-sm' :
            picks.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {picks.map((mat) => (
              <RecommendationCard key={mat.id + mat.badge} mat={mat} />
            ))}
          </div>

          {picks.length < 3 && (
            <p className="text-xs text-gray-600 mt-5 text-center">
              Only {picks.length} unique material{picks.length !== 1 ? 's' : ''} matched your filters.
              Relax constraints to see more options.
            </p>
          )}
        </section>

        {/* ── Failure Matrix ── */}
        {failureRisks.length > 0 && (
          <section className="bg-red-950/20 border border-red-900/30 rounded-2xl p-6">
            <h3 className="text-red-400 font-semibold text-lg mb-1 flex items-center gap-2">
              <span>⚠️</span> Failure Mode Prediction
              <span className="text-xs font-normal text-gray-500 ml-2">(for Best Pick)</span>
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              If supply-chain instructions are not followed, the Best Pick material is susceptible
              to the following spoilage risks:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {failureRisks.map((risk, idx) => (
                <div key={idx} className="bg-gray-900/50 border border-red-900/20 p-4 rounded-xl">
                  <h4 className="text-red-300 text-sm font-bold mb-1">{risk.type}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{risk.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}



        {/* ── CTA ── */}
        <div className="pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-semibold">Ready to source the Best Pick?</p>
            <p className="text-sm text-gray-400 mt-0.5">
              Find verified manufacturers ranked by volume, tier, and lead time.
            </p>
          </div>
          <Button
            onClick={() => navigate('/sourcing')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold whitespace-nowrap shadow-lg shadow-emerald-900/30 flex items-center gap-2 relative z-20"
            id="go-to-sourcing-btn"
          >
            Find Suppliers →
          </Button>
        </div>

      </div>
    </main>
  );
}