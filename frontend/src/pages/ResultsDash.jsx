import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useEngineStore from '../store/useEngineStore';
import { Button } from '../components/ui/Button';

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
    return 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop';
  }
  if (cat.includes('mono') || cat.includes('pe') || cat.includes('recyclable')) {
    return 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?q=80&w=800&auto=format&fit=crop';
  }
  if (cat.includes('conventional') || cat.includes('pet')) {
    return 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800&auto=format&fit=crop';
  }
  return 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?q=80&w=800&auto=format&fit=crop';
}

function ScoreBar({ score, barClass }) {
  const pct = Math.round((score ?? 0) * 100);
  return (
    <div className="mt-3 bg-gray-950/40 p-4 rounded-2xl border border-gray-800">
      <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
        <span>AI Match Score</span>
        <span className="font-mono text-white">{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${barClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function SpecRow({ label, value, unit, highlight }) {
  return (
    <li className="flex justify-between items-baseline border-b border-gray-800/70 pb-3 last:border-0 last:pb-0">
      <span className="text-gray-400 font-medium text-sm">{label}</span>
      <span className={`font-mono text-sm font-semibold ${highlight ?? 'text-gray-200'}`}>
        {value}
        {unit && <span className="text-xs text-gray-500 ml-1.5">{unit}</span>}
      </span>
    </li>
  );
}

// ── Aceternity Focus Card Component ──────────────────────────────────────────
const FocusCard = React.memo(({ card, index, hovered, setHovered, onClick }) => {
  const isHovered = hovered === index;
  const isOtherHovered = hovered !== null && hovered !== index;
  
  const cfg = BADGE_CONFIG[card.badge] ?? BADGE_CONFIG['Best Pick'];
  const matImage = card.image_url || getMaterialImage(card.category);

  return (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      onClick={() => onClick(card)}
      className={`relative bg-gray-900 overflow-hidden rounded-[32px] h-[380px] md:h-[460px] w-full transition-all duration-500 ease-out cursor-pointer shadow-xl border border-white/5 ${
        isOtherHovered ? "blur-[6px] scale-[0.96] opacity-50" : "scale-100 opacity-100 hover:shadow-2xl hover:border-emerald-500/30"
      }`}
    >
      {/* Background Image */}
      <img
        src={matImage}
        alt={card.name}
        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out ${
          isHovered ? "scale-110" : "scale-100"
        }`}
      />
      
      {/* Dark Gradient Overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-transparent transition-opacity duration-500 ${
          isHovered ? "opacity-90" : "opacity-60"
        }`} 
      />

      {/* Floating Badge */}
      <div className="absolute top-5 left-5 z-10 flex gap-2">
        <span className={`inline-flex items-center gap-1.5 text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-md shadow-lg ${cfg.pill}`}>
          <span>{cfg.icon}</span> {card.badge}
        </span>
        {card.is_recyclable && (
          <span className="inline-flex items-center gap-1 text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 backdrop-blur-md shadow-lg">
            ♻ Eco
          </span>
        )}
      </div>

      {/* Title & Action appearing at the bottom */}
      <div
        className={`absolute bottom-0 inset-x-0 px-6 py-8 flex flex-col justify-end transition-all duration-500 ease-out ${
          isHovered ? "translate-y-0 opacity-100" : "translate-y-3 opacity-90"
        }`}
      >
        <h3 className="text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-lg mb-2">
          {card.name}
        </h3>
        <p className={`font-bold text-xs md:text-sm uppercase tracking-wider flex items-center gap-2 transition-all duration-300 ${isHovered ? cfg.accent : 'text-gray-300'}`}>
          View Full Specs
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${isHovered ? 'translate-x-2' : ''}`}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </p>
      </div>
    </div>
  );
});

// Container for the Focus Cards Grid
function FocusCards({ items, onCardClick }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className={`grid gap-6 w-full ${
      items.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
      items.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' :
      'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    }`}>
      {items.map((card, index) => (
        <FocusCard
          key={card.id || index}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
          onClick={onCardClick}
        />
      ))}
    </div>
  );
}

// ── Material Details Modal ───────────────────────────────────────────────────
function MaterialDetailsModal({ material, onClose }) {
  if (!material) return null;
  const cfg = BADGE_CONFIG[material.badge] ?? BADGE_CONFIG['Best Pick'];
  const matImage = material.image_url || getMaterialImage(material.category);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 px-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-gray-950/80 backdrop-blur-md cursor-pointer"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-[32px] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-full transition-colors border border-white/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>

        {/* Modal Header / Banner */}
        <div className="relative h-48 sm:h-64 shrink-0 overflow-hidden">
          <img 
            src={matImage} 
            alt={material.name} 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-transparent" />
          
          <div className="absolute bottom-0 left-0 p-6 sm:p-8 w-full">
            <div className="flex justify-between items-end gap-4">
              <div>
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-3 ${cfg.pill}`}>
                  <span>{cfg.icon}</span> {material.badge}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">{material.name}</h2>
                <p className={`text-sm mt-1 font-medium ${cfg.label}`}>{cfg.sub}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent flex flex-col gap-6">
          
          {/* Description */}
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed bg-gray-800/30 p-4 rounded-2xl border border-gray-800/50">
            {material.description}
          </p>

          {/* Score Bar */}
          {material.score !== undefined && (
            <ScoreBar score={material.score} barClass={cfg.bar} />
          )}

          {/* Specs Grid */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-3 mb-4">
              Technical Specifications
            </h3>
            <ul className="space-y-3">
              <SpecRow label="Cost / Unit" value={`$${material.cost_per_kg?.toFixed(2) ?? '—'}`} />
              <SpecRow label="Oxygen Transmission (OTR)" value={material.otr ?? '—'} unit="cc/m²/day" />
              <SpecRow label="Water Vapor (WVTR)" value={material.wvtr ?? '—'} unit="g/m²/day" />
              <SpecRow
                label="Recyclability"
                value={material.is_recyclable ? 'Fully Recyclable' : 'Not Recyclable'}
                highlight={material.is_recyclable ? 'text-emerald-400' : 'text-amber-400'}
              />
              <SpecRow label="Material Class" value={material.material_type?.replace('_', ' ') ?? material.category ?? '—'} />
              
              {material.supported_temperature_conditions?.length > 0 && (
                <SpecRow
                  label="Temperature Rating"
                  value={material.supported_temperature_conditions.join(', ')}
                  highlight="text-sky-300 text-sm"
                />
              )}
              {material.supported_storage_types?.length > 0 && (
                <SpecRow
                  label="Storage Purpose"
                  value={material.supported_storage_types.slice(0, 2).join(', ')}
                  highlight="text-emerald-300 text-sm"
                />
              )}
            </ul>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page Layout ─────────────────────────────────────────────────────────
export default function ResultsDash() {
  const navigate = useNavigate();
  const { result, resetForm } = useEngineStore();
  const [showScreeningMatrix, setShowScreeningMatrix] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

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
          <div className="bg-gradient-to-br from-amber-950/30 via-gray-900 to-gray-950 border border-amber-500/30 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                Active Material R&D Notice
              </span>
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

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button
              onClick={() => navigate('/')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-xl shadow-lg transition-all"
            >
              ← Choose Another Dairy Commodity
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

        {/* ── Focus Cards Gallery ── */}
        <section>
          <FocusCards items={picks} onCardClick={setSelectedMaterial} />

          {picks.length < 3 && (
            <p className="text-xs text-gray-600 mt-6 text-center">
              Only {picks.length} unique material{picks.length !== 1 ? 's' : ''} matched your exact filters.
            </p>
          )}
        </section>

        {/* ── Details Modal Overlay ── */}
        <AnimatePresence>
          {selectedMaterial && (
            <MaterialDetailsModal 
              material={selectedMaterial} 
              onClose={() => setSelectedMaterial(null)} 
            />
          )}
        </AnimatePresence>

        {/* ── Failure Matrix ── */}
        {failureRisks.length > 0 && (
          <section className="bg-red-950/20 border border-red-900/30 rounded-2xl p-6 mt-10">
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
        <div className="pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
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