import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * useEngineStore — Global persisted state for the Verde recommendation engine.
 *
 * Slices:
 *   form   — current input form values
 *   result — last API response from /api/recommend
 *   ui     — transient UI state (loading, error, advanced mode toggle)
 */
const useEngineStore = create(
  persist(
    (set) => ({
      // -------------------------------------------------------
      // Form state
      // -------------------------------------------------------
      form: {
        product_id: '',
        product_name: '',
        storage_type: '',
        temperature_condition: '',
        moisture_content: '',
        fat_content: '',
        ph_level: '',
        desired_shelf_life: '',
        relative_humidity: '',
        respiration_rate: '',
        transportation_conditions: '',
        max_moq: '',
        max_cost: '',
        recyclable_only: false,
      },

      setFormField: (field, value) =>
        set((state) => ({
          form: { ...state.form, [field]: value },
        })),

      resetForm: () =>
        set({
          form: {
            product_id: '',
            product_name: '',
            storage_type: '',
            temperature_condition: '',
            moisture_content: '',
            fat_content: '',
            ph_level: '',
            desired_shelf_life: '',
            relative_humidity: '',
            respiration_rate: '',
            transportation_conditions: '',
            max_moq: '',
            max_cost: '',
            recyclable_only: false,
          },
        }),

      // -------------------------------------------------------
      // Result state
      // -------------------------------------------------------
      result: null,      // { product, matches, failures }

      setResult: (result) => set({ result }),

      clearResult: () => set({ result: null }),

      // -------------------------------------------------------
      // UI state
      // -------------------------------------------------------
      ui: {
        loading: false,
        error: null,
        advancedMode: false,
      },

      setLoading: (loading) =>
        set((state) => ({ ui: { ...state.ui, loading } })),

      setError: (error) =>
        set((state) => ({ ui: { ...state.ui, error } })),

      toggleAdvancedMode: () =>
        set((state) => ({
          ui: { ...state.ui, advancedMode: !state.ui.advancedMode },
        })),
    }),
    {
      name: 'verde-engine-store',   // localStorage key
      partialize: (state) => ({
        form: state.form,
        result: state.result,
      }),
    }
  )
);

export default useEngineStore;
