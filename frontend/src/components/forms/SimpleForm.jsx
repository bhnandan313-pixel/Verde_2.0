import { useEffect, useState } from 'react';
import useEngineStore from '../../store/useEngineStore';
import { fetchProducts } from '../../services/api';

// Phase state emoji map
const PHASE_ICON = {
  liquid:      '💧',
  solid:       '🧀',
  'semi-solid':'🥛',
};

/**
 * SimpleForm — scrollable product card picker.
 * Replaces the dropdown with a horizontal scroll row of clickable cards.
 */
export function SimpleForm() {
  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const { form, setFormField }        = useEngineStore();

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="shrink-0 w-36 h-28 bg-gray-800 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      <p className="label mb-3">Select a Dairy Product</p>

      {/* Horizontally scrollable card row */}
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
        {products.map((product) => {
          const selected = form.product_id === product.id;
          return (
            <button
              key={product.id}
              type="button"
              onClick={() => setFormField('product_id', product.id)}
              className={`
                snap-start shrink-0 w-40 text-left p-4 rounded-xl border
                transition-all duration-200 focus:outline-none
                ${selected
                  ? 'border-emerald-500 bg-emerald-950/40 shadow-lg shadow-emerald-900/30 scale-[1.03]'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-500 hover:bg-gray-750'
                }
              `}
              id={`product-card-${product.id}`}
            >
              {/* Icon + phase */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">
                  {PHASE_ICON[product.phase_state] ?? '📦'}
                </span>
                {selected && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>

              {/* Product name */}
              <p className={`text-sm font-semibold leading-tight mb-2 ${selected ? 'text-emerald-300' : 'text-gray-200'}`}>
                {product.name}
              </p>

              {/* Key stats */}
              <div className="space-y-0.5">
                <p className="text-[10px] text-gray-500">
                  pH {product.pH} · {product.phase_state}
                </p>
                <p className="text-[10px] text-gray-500">
                  {product.shelf_life_days}d shelf life
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selection confirmation */}
      {form.product_id && (
        <p className="mt-3 text-xs text-emerald-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
          {products.find(p => p.id === form.product_id)?.name} selected
        </p>
      )}
    </div>
  );
}
