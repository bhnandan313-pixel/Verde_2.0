import useEngineStore from '../../store/useEngineStore';

/**
 * AdvancedForm — extended filters: MOQ ceiling, cost ceiling, recyclable toggle.
 * Rendered below SimpleForm when the user enables Advanced Mode.
 */
export function AdvancedForm() {
  const { form, setFormField } = useEngineStore();

  return (
    <div className="space-y-4 pt-4 border-t border-gray-800">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">
        Advanced Filters
      </p>

      {/* MOQ ceiling */}
      <div>
        <label htmlFor="adv-max-moq" className="label">
          Maximum MOQ (units)
        </label>
        <input
          id="adv-max-moq"
          type="number"
          min={0}
          className="input-field"
          placeholder="e.g. 10000"
          value={form.max_moq}
          onChange={(e) => setFormField('max_moq', e.target.value)}
        />
      </div>

      {/* Cost ceiling */}
      <div>
        <label htmlFor="adv-max-cost" className="label">
          Maximum Cost per Unit (USD)
        </label>
        <input
          id="adv-max-cost"
          type="number"
          min={0}
          step={0.01}
          className="input-field"
          placeholder="e.g. 0.50"
          value={form.max_cost}
          onChange={(e) => setFormField('max_cost', e.target.value)}
        />
      </div>

      {/* Recyclable only */}
      <div className="flex items-center gap-3">
        <input
          id="adv-recyclable"
          type="checkbox"
          className="h-4 w-4 rounded border-gray-600 bg-gray-800
                     text-verde-500 focus:ring-verde-500 cursor-pointer"
          checked={form.recyclable_only}
          onChange={(e) => setFormField('recyclable_only', e.target.checked)}
        />
        <label htmlFor="adv-recyclable" className="text-sm text-gray-300 cursor-pointer">
          Recyclable materials only
        </label>
      </div>
    </div>
  );
}
