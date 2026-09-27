"""
supabase_db.py — Supabase-backed Data Access Layer
====================================================
Replaces the flat-file JsonDB with a live Supabase (PostgreSQL) backend.
Tables expected in the Supabase project:
  • dairy_products
  • materials
  • manufacturers
All three tables must exist before the Flask server is started.
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    msg = (
        "[FATAL] Missing Supabase environment variables! "
        "Ensure SUPABASE_URL and SUPABASE_KEY are added in the Railway Variables tab."
    )
    print(msg, flush=True)
    raise RuntimeError(msg)

_supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


class SupabaseDB:
    """Data Access Layer — queries the Supabase (PostgreSQL) database."""

    # ------------------------------------------------------------------
    # Dairy products queries
    # ------------------------------------------------------------------

    @staticmethod
    def _normalise_product(row: dict) -> dict:
        """
        Supabase stores OTR/WVTR as lowercase (required_otr, required_wvtr)
        because PostgreSQL folds unquoted identifiers to lowercase.
        The engine and the JSON files use the original mixed-case keys
        (required_OTR, required_WVTR, pH).  Remap here so nothing
        else in the codebase needs to change.
        """
        if row is None:
            return row
        row = dict(row)
        # required_OTR / required_WVTR
        if "required_otr" in row and "required_OTR" not in row:
            row["required_OTR"] = row.pop("required_otr")
        if "required_wvtr" in row and "required_WVTR" not in row:
            row["required_WVTR"] = row.pop("required_wvtr")
        return row

    def get_all_dairy_products(self) -> list[dict]:
        """Return every dairy product record."""
        response = (
            _supabase
            .table("dairy_products")
            .select("*")
            .execute()
        )
        return [self._normalise_product(r) for r in response.data]

    def get_dairy_product_by_id(self, product_id: str) -> dict | None:
        """Return a single dairy product by its id, or None if not found."""
        response = (
            _supabase
            .table("dairy_products")
            .select("*")
            .eq("id", product_id)
            .limit(1)
            .execute()
        )
        return self._normalise_product(response.data[0]) if response.data else None

    def get_dairy_product_ids(self) -> list[str]:
        """Return a list of all dairy product IDs."""
        response = (
            _supabase
            .table("dairy_products")
            .select("id")
            .execute()
        )
        return [row["id"] for row in response.data]

    # ------------------------------------------------------------------
    # Packaging materials queries
    # ------------------------------------------------------------------

    def get_all_packaging_materials(self) -> list[dict]:
        """Return every packaging material record."""
        response = (
            _supabase
            .table("materials")
            .select("*")
            .execute()
        )
        return response.data

    def get_packaging_material_by_id(self, material_id: str) -> dict | None:
        """Return a single packaging material by its id or material_id, or None."""
        response = (
            _supabase
            .table("materials")
            .select("*")
            .or_(f"id.eq.{material_id},material_id.eq.{material_id}")
            .limit(1)
            .execute()
        )
        return response.data[0] if response.data else None

    def get_materials_for_phase(self, phase_state: str) -> list[dict]:
        """Return all materials compatible with a given phase state."""
        response = (
            _supabase
            .table("materials")
            .select("*")
            .contains("compatible_phase_states", [phase_state])
            .execute()
        )
        return response.data

    # ------------------------------------------------------------------
    # Manufacturers queries
    # ------------------------------------------------------------------

    def get_all_manufacturers(self) -> list[dict]:
        """Return every manufacturer record."""
        response = (
            _supabase
            .table("manufacturers")
            .select("*")
            .execute()
        )
        return response.data

    def get_manufacturer_by_id(self, manufacturer_id: str) -> dict | None:
        """Return a single manufacturer by its id, or None if not found."""
        response = (
            _supabase
            .table("manufacturers")
            .select("*")
            .eq("id", manufacturer_id)
            .limit(1)
            .execute()
        )
        return response.data[0] if response.data else None

    def get_manufacturers_for_material(self, material_id: str) -> list[dict]:
        """Return all manufacturers that supply a given material ID."""
        response = (
            _supabase
            .table("manufacturers")
            .select("*")
            .contains("compatible_material_ids", [material_id])
            .execute()
        )
        return response.data
