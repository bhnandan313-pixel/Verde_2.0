import json
import os

_DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')


class JsonDB:
    """Data Access Layer — loads and queries the flat-file JSON database."""

    def __init__(self):
        self._dairy_products = self._load('dairy_products.json')
        self._packaging_materials = self._load('packaging_materials.json')
        self._manufacturers = self._load('manufacturers.json')

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _load(self, filename: str) -> list[dict]:
        """Load a JSON file from the data directory and return a list of records."""
        path = os.path.normpath(os.path.join(_DATA_DIR, filename))
        with open(path, 'r', encoding='utf-8') as fh:
            return json.load(fh)

    # ------------------------------------------------------------------
    # Dairy products queries
    # ------------------------------------------------------------------

    def get_all_dairy_products(self) -> list[dict]:
        """Return every dairy product record."""
        return self._dairy_products

    def get_dairy_product_by_id(self, product_id: str) -> dict | None:
        """Return a single dairy product by its id, or None if not found."""
        return next(
            (p for p in self._dairy_products if p['id'] == product_id), None
        )

    def get_dairy_product_ids(self) -> list[str]:
        """Return a list of all dairy product IDs."""
        return [p['id'] for p in self._dairy_products]

    # ------------------------------------------------------------------
    # Packaging materials queries
    # ------------------------------------------------------------------

    def get_all_packaging_materials(self) -> list[dict]:
        """Return every packaging material record."""
        return self._packaging_materials

    def get_packaging_material_by_id(self, material_id: str) -> dict | None:
        """Return a single packaging material by its id, or None if not found."""
        return next(
            (m for m in self._packaging_materials if m['id'] == material_id or m.get('material_id') == material_id), None
        )

    def get_materials_for_phase(self, phase_state: str) -> list[dict]:
        """Return all materials compatible with a given phase state."""
        return [
            m for m in self._packaging_materials
            if phase_state in m.get('compatible_phase_states', [])
        ]

    # ------------------------------------------------------------------
    # Manufacturers queries
    # ------------------------------------------------------------------

    def get_all_manufacturers(self) -> list[dict]:
        """Return every manufacturer record."""
        return self._manufacturers

    def get_manufacturer_by_id(self, manufacturer_id: str) -> dict | None:
        """Return a single manufacturer by its id, or None if not found."""
        return next(
            (m for m in self._manufacturers if m['id'] == manufacturer_id), None
        )

    def get_manufacturers_for_material(self, material_id: str) -> list[dict]:
        """Return all manufacturers that supply a given material ID."""
        return [
            m for m in self._manufacturers
            if material_id in m.get('compatible_material_ids', [])
        ]
