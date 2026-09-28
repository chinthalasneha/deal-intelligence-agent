import os
from pathlib import Path

from dotenv import load_dotenv
from hindsight_client import Hindsight


# Load .env from the project root
PROJECT_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(PROJECT_ROOT / ".env")

api_key = os.getenv("HINDSIGHT_API_KEY")

base_url = os.getenv(
    "HINDSIGHT_BASE_URL",
    "https://api.hindsight.vectorize.io"
)

bank_id = os.getenv(
    "HINDSIGHT_BANK_ID",
    "dealsense-sales"
)

client = None

if api_key:
    client = Hindsight(
        base_url=base_url,
        api_key=api_key
    )


def retain_memory(content: str, tags: list[str] | None = None):
    """Store a memory in Hindsight."""
    if client is None:
        return None

    try:
        return client.retain(
            bank_id=bank_id,
            content=content,
            tags=tags
        )
    except Exception:
        return None


def recall_memory(
    query: str,
    tags: list[str] | None = None
):
    """Retrieve relevant memories from Hindsight."""
    if client is None:
        return []

    try:
        response = client.recall(
            bank_id=bank_id,
            query=query,
            tags=tags,
            tags_match="all_strict"
        )

        if hasattr(response, "results"):
            return response.results

        return []

    except Exception:
        return []
def close_hindsight():
    """Close the Hindsight client."""
    if client is not None:
        client.close()