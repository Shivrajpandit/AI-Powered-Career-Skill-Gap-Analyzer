import re
from typing import List, Dict, Any, Optional, Tuple
from app.services.taxonomy.manager import taxonomy_manager


class SkillExtractor:
    def __init__(self):
        self.taxonomy = taxonomy_manager

    def _build_regex_patterns(self) -> Dict[str, Tuple[re.Pattern, Dict[str, Any]]]:
        """Build boundary-safe compiled regexes for all taxonomy skills and aliases."""
        patterns = {}
        for alias_key, meta in self.taxonomy.alias_map.items():
            # Handle special symbols like C++, C#, .NET, CI/CD
            escaped = re.escape(alias_key)

            # Use word boundaries or start/end/punctuation boundaries for special symbols
            if alias_key in ("c", "r", "go"):
                pattern = re.compile(rf"(?:^|[\s,;:\(\)\[\]/]){escaped}(?:$|[\s,;:\(\)\[\]/])", re.IGNORECASE)
            elif alias_key in ("c++", "c#", ".net", "ci/cd", "node.js", "next.js", "vue.js"):
                pattern = re.compile(rf"(?:^|[\s,;:\(\)\[\]]){escaped}(?:$|[\s,;:\(\)\[\]])", re.IGNORECASE)
            else:
                pattern = re.compile(rf"\b{escaped}\b", re.IGNORECASE)

            patterns[alias_key] = (pattern, meta)
        return patterns

    def extract_skills(self, text: str, section_name: Optional[str] = None) -> List[Dict[str, Any]]:
        """Extract skills from text with context evidence and confidence scoring."""
        if not text:
            return []

        matched_skills: Dict[str, Dict[str, Any]] = {}
        sentences = re.split(r"[.\n;]+", text)

        patterns = self._build_regex_patterns()

        for term, (pattern, meta) in patterns.items():
            canonical = meta["canonical"]

            # Search in the full text
            match = pattern.search(text)
            if match:
                # Find the sentence containing the match for evidence
                evidence = ""
                for sentence in sentences:
                    if pattern.search(sentence):
                        evidence = sentence.strip()
                        if len(evidence) > 150:
                            evidence = evidence[:147] + "..."
                        break

                if not evidence:
                    evidence = match.group(0)

                # Confidence calculation
                confidence = 0.90
                if section_name and "skill" in section_name.lower():
                    confidence = 1.0
                elif len(pattern.findall(text)) > 1:
                    confidence = 0.95

                if canonical not in matched_skills or confidence > matched_skills[canonical]["confidence_score"]:
                    matched_skills[canonical] = {
                        "skill_name": meta["name"],
                        "canonical_name": canonical,
                        "category": meta["category"],
                        "confidence_score": confidence,
                        "evidence_text": f"Found in {section_name or 'document'}: \"{evidence}\"",
                    }

        return list(matched_skills.values())


skill_extractor = SkillExtractor()
