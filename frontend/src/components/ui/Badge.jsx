// Reusable Badge component
export function Badge({ color = 'verde', children, className = '' }) {
  const colorMap = {
    verde: 'bg-verde-900/60 text-verde-300 border border-verde-700/50',
    red:   'bg-red-900/60 text-red-300 border border-red-700/50',
    yellow:'bg-yellow-900/60 text-yellow-300 border border-yellow-700/50',
    gray:  'bg-gray-800 text-gray-300 border border-gray-700',
    blue:  'bg-blue-900/60 text-blue-300 border border-blue-700/50',
  };
  return (
    <span className={`badge ${colorMap[color] ?? colorMap.gray} ${className}`}>
      {children}
    </span>
  );
}
