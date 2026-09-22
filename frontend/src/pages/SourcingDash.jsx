import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useMotionTemplate } from 'framer-motion';
import useEngineStore from '../store/useEngineStore';
import { Button } from '../components/ui/Button';

const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const ChevronDownIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const PackageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m7.5 4.27 9 5.15"/>
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
    <path d="m3.3 7 8.7 5 8.7-5"/>
    <path d="M12 22V12"/>
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

function SupplierMapCard({ supplier }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // A stylized dark-mode map placeholder
  const mapImageUrl = "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop&grayscale=true";

  return (
    <motion.div 
      layout
      className={`bg-gray-900 border rounded-2xl overflow-hidden transition-colors duration-300 ${
        isExpanded ? 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'border-gray-800 hover:border-gray-700'
      }`}
    >
      {/* ── Always Visible Header (Clickable) ── */}
      <motion.div 
        layout="position"
        className="p-5 cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-white leading-tight group-hover:text-emerald-400 transition-colors">
              {supplier.name}
            </h3>
            <span className="inline-block px-2 py-0.5 bg-gray-800 text-[10px] uppercase tracking-wider rounded text-gray-400 mt-2">
              {supplier.tier}
            </span>
          </div>
          <button className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-gray-700 group-hover:text-white transition-colors shrink-0">
            <ChevronDownIcon className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-3">
          <MapPinIcon />
          <span>{supplier.location}</span>
        </div>
      </motion.div>

      {/* ── Collapsible Map & Details Section ── */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              <hr className="border-gray-800 mb-5" />

              {/* Simulated Map View */}
              <div className="relative w-full h-40 rounded-xl overflow-hidden mb-5 bg-gray-950 border border-gray-800">
                <img 
                  src={mapImageUrl} 
                  alt={`Map of ${supplier.location}`} 
                  className="object-cover w-full h-full opacity-40 mix-blend-luminosity pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent pointer-events-none" />
                
                {/* Pulsing Location Pin */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500 border-2 border-gray-900 shadow-lg"></span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-gray-950 border border-gray-800 rounded-lg p-3 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                    <PackageIcon /> Min. Order
                  </div>
                  <div className="text-white font-mono text-sm">
                    {supplier.moq_kg?.toLocaleString()} kg
                  </div>
                </div>
                <div className="bg-gray-950 border border-gray-800 rounded-lg p-3 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                    <ClockIcon /> Lead Time
                  </div>
                  <div className="text-white font-mono text-sm">
                    {supplier.lead_time_days} days
                  </div>
                </div>
              </div>

              {supplier.certifications?.length > 0 && (
                <div className="mb-5 text-xs text-gray-400 flex flex-wrap gap-2">
                  <span className="text-gray-500">Certifications:</span>
                  {supplier.certifications.map((cert, i) => (
                    <span key={i} className="text-emerald-400/80 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                      {cert}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Button */}
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 text-sm py-2 rounded-xl transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  if (supplier.contact_email) window.open(`mailto:${supplier.contact_email}`);
                }}
              >
                Request Quote
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SourcingDash() {
  const navigate = useNavigate();
  const { form, result, resetForm } = useEngineStore();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // ✅ useMotionTemplate must be called at the top level, not inside JSX
  const mouseGradient = useMotionTemplate`radial-gradient(650px circle at ${mouseX}px ${mouseY}px, rgba(16, 185, 129, 0.12), transparent 80%)`;

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // Guard: must come from a completed recommendation
  if (!result || !result.recommended_material) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
        <p className="mb-4 text-gray-400">No recommendation found. Please run the engine first.</p>
        <Button
          onClick={() => navigate('/')}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-md"
        >
          Go to Engine
        </Button>
      </div>
    );
  }

  const mat       = result.recommended_material;
  const suppliers = result.suppliers || [];
  const userMoq   = Number(form.max_moq) || 0;
  const isStartup = userMoq > 0 && userMoq < 300;

  const handleStartOver = () => {
    resetForm();
    navigate('/');
  };

  return (
    <main 
      className="relative min-h-screen bg-gray-950 px-4 py-12 font-sans text-gray-200 overflow-x-hidden group"
      onMouseMove={handleMouseMove}
    >
      {/* ── Static Dot Pattern Background ── */}
      <div
        className="absolute inset-0 -z-20 h-full w-full"
        style={{
          backgroundSize: '24px 24px',
          backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)',
        }}
      />
      {/* ── Mouse-follow Emerald Glow ── */}
      <motion.div
        className="pointer-events-none absolute -inset-px -z-10 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        style={{ background: mouseGradient }}
      />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">

        {/* ── Header ── */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-800 pb-6 gap-4">
          <div>
            <span className="text-emerald-500 font-bold tracking-wider text-sm uppercase mb-1 block">
              Direct Sourcing
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Find Suppliers
            </h1>
            <p className="text-gray-400 mt-2 text-sm md:text-base max-w-xl">
              Based on your estimated volume of{' '}
              <strong className="text-white">{userMoq || 'unspecified'} units/month</strong>,
              here are the optimal suppliers for{' '}
              <strong className="text-emerald-400">{mat.name}</strong>.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              onClick={() => navigate('/results')}
              className="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 px-4 py-2 rounded-md"
              id="back-to-results-btn"
            >
              ← Back
            </Button>
            <Button
              onClick={handleStartOver}
              className="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 px-4 py-2 rounded-md"
              id="start-over-btn"
            >
              ⌂ Start Over
            </Button>
          </div>
        </header>

        {/* ── Scale Strategy Banner ── */}
        {isStartup ? (
          <div className="bg-blue-900/10 border border-blue-800/30 rounded-xl p-4">
            <h3 className="text-blue-400 text-sm font-semibold mb-1 flex items-center gap-2">
              <span>ℹ️</span> Startup Scale Detected
            </h3>
            <p className="text-xs text-blue-200/70">
              Primary manufacturers require high minimum orders. We have filtered your results to show{' '}
              <span className="text-white font-medium">Regional Distributors</span>{' '}
              who break bulk and sell unprinted versions of this material suitable for your scale.
            </p>
          </div>
        ) : userMoq > 0 ? (
          <div className="bg-emerald-900/10 border border-emerald-800/30 rounded-xl p-4">
            <h3 className="text-emerald-400 text-sm font-semibold mb-1 flex items-center gap-2">
              <span>🏭</span> Enterprise Scale Detected
            </h3>
            <p className="text-xs text-emerald-200/70">
              Your volume qualifies for direct-to-manufacturer pricing. We have routed you to{' '}
              <span className="text-white font-medium">Primary Converters</span>{' '}
              capable of custom printing and bulk production for this material.
            </p>
          </div>
        ) : null}

        {/* ── Supplier Grid with Animated Map Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          {suppliers.length > 0 ? (
            suppliers.map((supplier) => (
              <SupplierMapCard key={supplier.id} supplier={supplier} />
            ))
          ) : (
            <div className="col-span-full py-16 text-center border border-dashed border-gray-800 rounded-xl">
              <p className="text-gray-500 text-sm">
                No compatible suppliers found for this material at your specified scale.
              </p>
              <p className="text-gray-600 text-xs mt-2">
                Try running the engine again without an MOQ constraint.
              </p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}