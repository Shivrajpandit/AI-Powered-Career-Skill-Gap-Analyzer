import json
import os
from typing import Dict, Any, List, Optional, Tuple


class SkillTaxonomyManager:
    _instance = None

    def __init__(self, taxonomy_path: Optional[str] = None):
        if taxonomy_path is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            taxonomy_path = os.path.join(base_dir, "skills_taxonomy.json")

        self.taxonomy_path = taxonomy_path
        self.categories: Dict[str, List[Dict[str, Any]]] = {}
        self.alias_map: Dict[str, Dict[str, Any]] = {}
        self.canonical_map: Dict[str, Dict[str, Any]] = {}
        self._load_taxonomy()

    def _load_taxonomy(self) -> None:
        """Load and index the taxonomy."""
        if not os.path.exists(self.taxonomy_path):
            raise FileNotFoundError(f"Taxonomy file not found at: {self.taxonomy_path}")

        with open(self.taxonomy_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        self.categories = data.get("categories", {})

        for category, skills in self.categories.items():
            for item in skills:
                name = item["name"]
                canonical = item["canonical"].lower()
                aliases = [a.lower() for a in item.get("aliases", [])]

                meta = {
                    "name": name,
                    "canonical": canonical,
                    "category": category,
                    "aliases": aliases,
                }

                self.canonical_map[canonical] = meta
                self.alias_map[name.lower()] = meta
                self.alias_map[canonical] = meta

                for alias in aliases:
                    self.alias_map[alias] = meta

    def get_canonical_skill(self, term: str) -> Optional[Dict[str, Any]]:
        """Normalize a skill term or alias to its canonical representation."""
        clean_term = term.strip().lower()
        return self.alias_map.get(clean_term)

    def get_all_skills(self) -> List[Dict[str, Any]]:
        """Get list of all primary skills."""
        return list(self.canonical_map.values())

    def get_categories(self) -> List[str]:
        """Get list of categories."""
        return list(self.categories.keys())

    def get_skills_by_category(self, category: str) -> List[Dict[str, Any]]:
        """Get all skills belonging to a category."""
        return self.categories.get(category, [])


# Global singleton instance
taxonomy_manager = SkillTaxonomyManager()
