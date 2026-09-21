import React, { useState } from "react";
import { motion } from "framer-motion";

export function ExpandOnHover({ 
  items, 
  height = "h-[500px]", 
  className = "",
  onSelect,
  selectedId
}) {
  const [hoveredIndex, setHoveredIndex] = useState(0);

  return (
    <div className={`flex w-full gap-2 md:gap-4 ${height} ${className}`}>
      {}
      {items.map((item, index) => {
        const isActive = hoveredIndex === index;
        const isSelected = selectedId === item.id;
        
        return (
          <motion.div
            key={item.id || index}
            className={`relative overflow-hidden rounded-3xl cursor-pointer group border-2 transition-colors duration-300 ${
              isSelected 
                ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]' 
                : 'border-transparent'
            }`}
            onMouseEnter={() => setHoveredIndex(index)}
            onClick={() => onSelect && onSelect(item.id)}
            animate={{
              width: isActive ? "100%" : "20%",
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
              className={`absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-transparent transition-opacity duration-300 ${
                isActive ? 'opacity-90' : 'opacity-50'
              }`}
            />

            {/* Selected Badge */}
            {isSelected && (
              <div className="absolute top-4 right-4 bg-emerald-500 text-emerald-950 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest z-20 shadow-lg">
                Selected
              </div>
            )}
            
            {/* Content Container */}
            <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-8 z-10">
              <motion.div
                initial={false}
                animate={{
                  opacity: isActive ? 1 : 0.6,
                  y: isActive ? 0 : 10,
                }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-4"
              >
                {/* Emoji Icon Badge */}
                {item.icon && (
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-2xl transition-colors ${
                    isSelected ? 'bg-emerald-500/20 border-emerald-500/50' : ''
                  }`}>
                    {item.icon}
                  </div>
                )}
                
                <div className="flex flex-col overflow-hidden">
                  <h3 className="text-xl md:text-3xl font-bold text-white whitespace-nowrap">
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
                    <p className="text-sm md:text-base text-gray-300 max-w-md line-clamp-2 md:line-clamp-none">
                      {item.description}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}