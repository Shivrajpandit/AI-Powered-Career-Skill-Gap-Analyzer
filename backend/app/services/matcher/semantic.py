import os
from typing import List, Dict, Tuple, Optional
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# Lazy loader for sentence_transformers to keep startup instantaneous
_model = None


def get_sentence_transformer_model():
    """Lazy load sentence-transformers all-MiniLM-L6-v2."""
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            # Fast, lightweight 384-dimensional dense embedding model (~80MB)
            _model = SentenceTransformer("all-MiniLM-L6-v2")
        except Exception:
            _model = None
    return _model


class SemanticMatcher:
    # High confidence semantic match threshold
    SEMANTIC_SIMILARITY_THRESHOLD = 0.72

    # Blacklist of distinct technologies that might have elevated raw vector similarity but are distinct
    DISALLOWED_MATCH_PAIRS = {
        frozenset(["java", "javascript"]),
        frozenset(["c", "c++"]),
        frozenset(["c", "c#"]),
        frozenset(["c++", "c#"]),
        frozenset(["rust", "ruby"]),
        frozenset(["r", "rust"]),
        frozenset(["react", "react native"]),
    }

    @staticmethod
    def compute_similarity(term1: str, term2: str) -> float:
        """Compute similarity between two skill terms using taxonomy aliases + embeddings."""
        t1 = term1.strip().lower()
        t2 = term2.strip().lower()

        if t1 == t2:
            return 1.0

        if frozenset([t1, t2]) in SemanticMatcher.DISALLOWED_MATCH_PAIRS:
            return 0.0

        # Check Taxonomy Canonical Alias
        from app.services.taxonomy.manager import taxonomy_manager
        canon1 = taxonomy_manager.get_canonical_skill(t1)
        canon2 = taxonomy_manager.get_canonical_skill(t2)

        if canon1 and canon2 and canon1["canonical"] == canon2["canonical"]:
            return 1.0

        # If one is canonical and the other is an alias
        if canon1 and canon1["canonical"] == t2:
            return 1.0
        if canon2 and canon2["canonical"] == t1:
            return 1.0

        # Check if skills belong to the same specific taxonomy subfield/category
        category_boost = 0.0
        if canon1 and canon2 and canon1["category"] == canon2["category"]:
            category_boost = 0.25

        model = get_sentence_transformer_model()
        if model is None:
            # Fallback if sentence-transformers not available: token overlap
            set1 = set(t1.split())
            set2 = set(t2.split())
            jaccard = len(set1 & set2) / max(len(set1 | set2), 1)
            return min(1.0, jaccard + category_boost)

        # Context-enriched embedding encoding
        desc1 = f"{canon1['category']} {term1}" if canon1 else term1
        desc2 = f"{canon2['category']} {term2}" if canon2 else term2

        embeddings = model.encode([desc1, desc2])
        sim = float(cosine_similarity([embeddings[0]], [embeddings[1]])[0][0])
        return max(0.0, min(1.0, sim + category_boost))

    @staticmethod
    def find_best_match(
        target_skill: str, candidate_skills: List[str]
    ) -> Tuple[Optional[str], float]:
        """Find the closest matching candidate skill from a list."""
        if not candidate_skills:
            return None, 0.0

        target_clean = target_skill.strip().lower()

        # 1. Exact match check
        for cand in candidate_skills:
            if cand.strip().lower() == target_clean:
                return cand, 1.0

        model = get_sentence_transformer_model()
        if model is None:
            best_cand = None
            best_score = 0.0
            for cand in candidate_skills:
                score = SemanticMatcher.compute_similarity(target_skill, cand)
                if score > best_score:
                    best_score = score
                    best_cand = cand
            return best_cand, best_score

        # Batch compute embeddings
        all_terms = [target_skill] + candidate_skills
        embeddings = model.encode(all_terms)
        target_emb = embeddings[0].reshape(1, -1)
        cand_embs = embeddings[1:]

        sims = cosine_similarity(target_emb, cand_embs)[0]

        best_idx = int(np.argmax(sims))
        best_score = float(sims[best_idx])
        best_cand = candidate_skills[best_idx]

        # Check blacklist
        if frozenset([target_clean, best_cand.strip().lower()]) in SemanticMatcher.DISALLOWED_MATCH_PAIRS:
            return None, 0.0

        return best_cand, max(0.0, min(1.0, best_score))
