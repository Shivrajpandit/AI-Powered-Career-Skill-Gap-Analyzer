import re
import unicodedata


def clean_text(raw_text: str) -> str:
    """Normalize unicode, cleanup extra whitespaces, standardize bullets and linebreaks."""
    if not raw_text:
        return ""

    # Normalize unicode (NFKD)
    normalized = unicodedata.normalize("NFKD", raw_text)

    # Replace fancy quotes and hyphens
    normalized = (
        normalized.replace("“", '"')
        .replace("”", '"')
        .replace("‘", "'")
        .replace("’", "'")
        .replace("–", "-")
        .replace("—", "-")
        .replace("•", "\n* ")
        .replace("·", "\n* ")
        .replace("▪", "\n* ")
        .replace("►", "\n* ")
        .replace("", "\n* ")
    )

    # Normalize carriage returns and newlines
    normalized = normalized.replace("\r\n", "\n").replace("\r", "\n")

    # Remove non-printable control characters except tabs and newlines
    normalized = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]", "", normalized)

    # Compress multiple consecutive horizontal spaces to a single space
    lines = []
    for line in normalized.split("\n"):
        cleaned_line = re.sub(r"[ \t]+", " ", line).strip()
        lines.append(cleaned_line)

    # Compress more than two consecutive empty lines to two
    cleaned_text = "\n".join(lines)
    cleaned_text = re.sub(r"\n{3,}", "\n\n", cleaned_text)

    return cleaned_text.strip()
