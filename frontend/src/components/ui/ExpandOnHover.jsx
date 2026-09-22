import React, { useState } from "react";
import { motion } from "framer-motion";

export function ExpandOnHover({ 
  items, 
  className = "",
  onSelect,
  selectedId
}) {
  // We use ID instead of index to track hover state across two separate arrays safely
  const [hoveredId, setHoveredId] = useState(items[0]?.id);

  // Split the items array in half for our two independent columns
  const mid = Math.ceil(items.length / 2);
  const leftColumn = items.slice(0, mid);
  const rightColumn = items.slice(mid);

  const renderCard = (item) => {
    const isActive = hoveredId === item.id;
    const isSelected = selectedId === item.id;
    
    return (
      <motion.div
        key={item.id}
        className={`relative overflow-hidden rounded-2xl md:rounded-3xl cursor-pointer group border-2 w-full transition-colors duration-300 ${
          isSelected 
            ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] z-30' 
            : 'border-transparent z-10'
        }`}
        onMouseEnter={() => setHoveredId(item.id)}
        onClick={() => onSelect && onSelect(item.id)}
        animate={{
          height: isActive ? 280 : 76, // Expanding vertically
        }}
        transition={{
          type: "spring",
          stiffness: 250,
          damping: 25,
          mass: 0.8
        }}
      >
        {/* Background Image */}
        <img
          src={item.image}
          alt={item.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
        />
        
        {/* Gradient Overlay for Text Readability */}
        <div 
          className={`absolute inset-0 transition-opacity duration-300 ${
            isActive 
              ? 'bg-gradient-to-t from-gray-950 via-gray-900/60 to-transparent opacity-90' 
              : 'bg-gray-950/40 opacity-100'
          }`}
        />

        {/* Selected Badge */}
        {isSelected && (
          <div className="absolute top-1/2 -translate-y-1/2 right-4 md:right-6 bg-emerald-500 text-emerald-950 text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest z-30 shadow-lg">
            Selected
          </div>
        )}
        
        {/* ── COLLAPSED STATE: Glassmorphism Name Tag ── */}
        <motion.div
          initial={false}
          animate={{ 
            opacity: isActive ? 0 : 1, 
            x: isActive ? -20 : 0 
          }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center px-4 md:px-6 z-20 pointer-events-none"
        >
          <div className="flex items-center gap-3 bg-gray-900/60 backdrop-blur-md border border-white/10 px-4 py-2 md:py-2.5 rounded-xl shadow-xl">
            <span className="text-xl md:text-2xl drop-shadow-md shrink-0">{item.icon}</span>
            <span className="text-sm md:text-base font-bold text-white tracking-wider drop-shadow-md truncate">
              {item.title}
            </span>
          </div>
        </motion.div>

        {/* ── EXPANDED STATE: Full Content ── */}
        <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-8 z-10 pointer-events-none">
          <motion.div
            initial={false}
            animate={{
              opacity: isActive ? 1 : 0,
              y: isActive ? 0 : 20,
            }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-4 md:gap-5"
          >
            {/* Emoji Icon Badge */}
            {item.icon && (
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-2xl md:text-3xl transition-colors shadow-xl ${
                isSelected ? 'bg-emerald-500/20 border-emerald-500/50' : ''
              }`}>
                {item.icon}
              </div>
            )}
            
            <div className="flex flex-col overflow-hidden">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-white whitespace-nowrap drop-shadow-lg truncate">
                {item.title}
              </h3>
              
              {/* Expanding Description */}
              <motion.div
                initial={false}
                animate={{ 
                  height: isActive ? "auto" : 0,
                  opacity: isActive ? 1 : 0,
                  marginTop: isActive ? 8 : 0
                }}
                className="overflow-hidden"
              >
                <p className="text-xs md:text-sm text-gray-200 drop-shadow-md leading-relaxed line-clamp-3">
                  {item.description}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`flex flex-col md:flex-row w-full gap-3 md:gap-4 ${className}`}>
      
      {/* Left Column (Items 1-5) */}
      <div className="flex flex-col flex-1 gap-3 md:gap-4">
        {leftColumn.map(item => renderCard(item))}
      </div>

      {/* Right Column (Items 6-10) */}
      <div className="flex flex-col flex-1 gap-3 md:gap-4">
        {rightColumn.map(item => renderCard(item))}
      </div>

    </div>
  );
}