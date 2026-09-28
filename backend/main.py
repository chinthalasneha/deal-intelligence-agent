import json
import os
import threading
import urllib.parse
import sys
from pathlib import Path
from typing import Optional

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


# Path setup to reliably locate files whether script is run from project root
# or backend directory
BASE_DIR = Path(__file__).resolve().parent  # backend directory
PROJECT_ROOT = BASE_DIR.parent  # deal-intelligence-agent directory

if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from services.hindsight_service import (
    recall_memory,
    retain_memory,
    close_hindsight,
)


# Load .env from backend directory, project root, or parent workspace root
for env_loc in [
    BASE_DIR / ".env",
    PROJECT_ROOT / ".env",
    PROJECT_ROOT.parent / ".env",
]:
    if env_loc.exists():
        load_dotenv(env_loc, override=True)

load_dotenv()


GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY is missing. Add it to your .env file.")

print("GROQ KEY AVAILABLE:", bool(GROQ_API_KEY))
print("GROQ MODEL:", os.getenv("GROQ_MODEL"))

GROQ_MODEL = os.getenv(
    "GROQ_MODEL",
    "openai/gpt-oss-120b"
)


DATA_FILE_PATH = (
    PROJECT_ROOT / "data" / "mock_calls.json"
    if (PROJECT_ROOT / "data" / "mock_calls.json").exists()
    else BASE_DIR / "data" / "mock_calls.json"
)


app = FastAPI(title="Deal Intelligence Agent API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# In-memory brief cache for instant 0ms responses on cached calls
BRIEF_CACHE = {}


def get_customer_history(customer_name: str) -> list:
    """Reads data/mock_calls.json and returns all call records
    for customer_name, sorted by call_number.
    """

    data_path = (
        DATA_FILE_PATH
        if DATA_FILE_PATH.exists()
        else Path("data/mock_calls.json")
    )

    if not data_path.exists():
        raise FileNotFoundError(
            f"Mock calls file not found at {data_path}"
        )

    with open(data_path, "r", encoding="utf-8") as f:
        records = json.load(f)

    customer_records = [
        r
        for r in records
        if r.get("customer_name", "").strip().lower()
        == customer_name.strip().lower()
    ]

    # Sort records by call_number
    customer_records.sort(
        key=lambda x: x.get("call_number", 0)
    )

    return customer_records


def generate_brief(
    customer_name: str,
    up_to_call_number: int = None,
    force_refresh: bool = False,
) -> str:
    """Gets customer call history, builds LLM prompt, calls Groq API
    (with caching for speed), and returns pre-call brief as plain text.
    """

    history = get_customer_history(customer_name)

    if up_to_call_number is not None:
        history = [
            call
            for call in history
            if call.get("call_number", 0)
            <= up_to_call_number
        ]

    if not history:
        return (
            f"No call history found for customer: "
            f"{customer_name}"
        )

    max_call_num = history[-1].get(
        "call_number",
        up_to_call_number or 0,
    )

    cache_key = (
        f"{customer_name.strip().lower()}_call_"
        f"{max_call_num}_{len(history)}"
    )

    # Check cache first for instant 0ms response
    if not force_refresh and cache_key in BRIEF_CACHE:
        return BRIEF_CACHE[cache_key]

    company_name = history[0].get(
        "company_name",
        "Unknown Company",
    )

    # Format call history details into prompt context
    history_summary = []

    for call in history:
        history_summary.append(
            f"Call #{call.get('call_number')} "
            f"({call.get('date')}):\n"
            f"  - Stage: {call.get('deal_stage')}\n"
            f"  - Sentiment: {call.get('sentiment')}\n"
            f"  - Objection Raised: "
            f"{call.get('objection_raised')}\n"
            f"  - Competitor Mentioned: "
            f"{call.get('competitor_mentioned') or 'None'}\n"
            f"  - Key Quote: "
            f"\"{call.get('key_quote')}\"\n"
            f"  - Next Step Promised: "
            f"{call.get('next_step_promised')}"
        )

    full_history_text = "\n\n".join(history_summary)

    # Query Hindsight memory service for long-term customer context
    hindsight_text = ""

    try:
        query = (
            f"What key preferences, objections, competitors, "
            f"or details are known about {customer_name} "
            f"from {company_name}?"
        )

        # Retrieve memories using customer + company tags
        recalled = recall_memory(
            query,
            tags=[customer_name, company_name],
        )

        if recalled:
            items = (
                getattr(recalled, "results", recalled)
                if not isinstance(recalled, list)
                else recalled
            )

            hindsight_facts = []

            for item in items:
                text = (
                    getattr(item, "text", None)
                    if not isinstance(item, dict)
                    else item.get("text")
                )

                if text:
                    hindsight_facts.append(
                        f"- {text.strip()}"
                    )

            if hindsight_facts:
                hindsight_text = "\n".join(
                    hindsight_facts
                )

    except Exception as e:
        print(
            f"[BACKEND WARNING] Hindsight recall failed: {e}"
        )

    hindsight_section = (
        f"\n\n--- HINDSIGHT MEMORY CONTEXT ---\n"
        f"{hindsight_text}\n"
        f"--------------------------------"
        if hindsight_text
        else ""
    )

    prompt = f"""You are an AI Deal Intelligence Assistant. Analyze the following sales call history for customer "{customer_name}" from {company_name}:

--- CALL HISTORY ---

{full_history_text}

--------------------{hindsight_section}

Write a short, punchy pre-call briefing for a sales rep preparing for their next call with {customer_name}.

Highlight the following key points:

- Customer's Biggest Objection
- Any Competitor Mentioned
- Current Sentiment
- A Suggested Talking Point for the next call

Keep the brief concise, structured, actionable, and formatted in clear plain text.
"""

    api_key = GROQ_API_KEY or os.getenv(
        "GROQ_API_KEY"
    )

    if not api_key:
        return (
            "Error: GROQ_API_KEY environment variable "
            "is not set."
        )

    url = (
        "https://api.groq.com/openai/v1/"
        "chat/completions"
    )

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    # High-speed model priority list on Groq LPUs
    # with 20s timeout per call
    env_model = (
        os.getenv("GROQ_MODEL")
        or GROQ_MODEL
    )

    models_to_try = (
        [env_model]
        if env_model
        else []
    )

    for m in [
        "openai/gpt-oss-120b",
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
    ]:
        if m not in models_to_try:
            models_to_try.append(m)

    for model_name in models_to_try:

        payload = {
            "model": model_name,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are a professional AI "
                        "Deal Intelligence Assistant."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            "temperature": 0.6,
            "max_tokens": 500,
        }

        try:
            response = requests.post(
                url,
                headers=headers,
                json=payload,
                timeout=20,
            )

            if response.status_code == 200:
                result_json = response.json()

                brief_text = (
                    result_json["choices"][0]
                    ["message"]["content"]
                )

                BRIEF_CACHE[cache_key] = brief_text

                return brief_text

            else:
                print(
                    f"[BACKEND WARNING] Model "
                    f"{model_name} returned status "
                    f"{response.status_code}"
                )

        except Exception as e:
            print(
                f"[BACKEND WARNING] Model "
                f"{model_name} failed or timed out: {e}"
            )
            continue

    return (
        "Error generating brief: Groq API attempt "
        "timed out or failed."
    )


def save_call(call_data: dict) -> None:
    """Appends a new call record dictionary to
    data/mock_calls.json and saves the updated list.
    """

    global BRIEF_CACHE

    BRIEF_CACHE.clear()

    data_path = (
        DATA_FILE_PATH
        if DATA_FILE_PATH.exists()
        else Path("data/mock_calls.json")
    )

    records = []

    if data_path.exists():
        with open(data_path, "r", encoding="utf-8") as f:
            records = json.load(f)

    # Update if call record with same customer_name
    # & call_number exists, otherwise append
    existing_index = None

    for idx, r in enumerate(records):

        if (
            r.get("customer_name", "").strip().lower()
            == call_data.get(
                "customer_name", ""
            ).strip().lower()
            and r.get("call_number")
            == call_data.get("call_number")
        ):
            existing_index = idx
            break

    if existing_index is not None:
        records[existing_index] = call_data
    else:
        records.append(call_data)

    with open(data_path, "w", encoding="utf-8") as f:
        json.dump(
            records,
            f,
            indent=2,
            ensure_ascii=False,
        )

    # Safely retain call insights memory statement in Hindsight
    try:

        c_name = call_data.get(
            "customer_name",
            "Unknown Customer",
        )

        c_company = call_data.get(
            "company_name",
            "Unknown Company",
        )

        c_objection = call_data.get(
            "objection_raised",
            "None",
        )

        c_competitor = (
            call_data.get(
                "competitor_mentioned"
            )
            or "None"
        )

        c_sentiment = call_data.get(
            "sentiment",
            "neutral",
        )

        c_stage = call_data.get(
            "deal_stage",
            "negotiation",
        )

        c_quote = call_data.get(
            "key_quote",
            "",
        )

        c_next = call_data.get(
            "next_step_promised",
            "",
        )

        memory_statement = (
            f"Customer {c_name} from {c_company} "
            f"(Stage: {c_stage}, "
            f"Sentiment: {c_sentiment}). "
            f"Objection raised: {c_objection}. "
            f"Competitor mentioned: {c_competitor}. "
            f"Key quote: \"{c_quote}\". "
            f"Next step: {c_next}."
        )

        # Store the memory using customer + company tags
        retain_memory(
            memory_statement,
            tags=[c_name, c_company],
        )

    except Exception as e:
        print(
            f"[BACKEND WARNING] Hindsight retain failed: {e}"
        )


def prewarm_cache_bg():
    """Asynchronously pre-populates brief cache in background
    so UI loads instantly.
    """

    try:

        customers = [
            "Rahul Sharma",
            "Priya Nair",
            "Arjun Mehta",
            "Sneha Kulkarni",
        ]

        for cust in customers:

            try:

                history = get_customer_history(cust)

                for call in history:

                    c_num = call.get(
                        "call_number",
                        1,
                    )

                    generate_brief(
                        cust,
                        c_num,
                    )

            except Exception:
                pass

    except Exception:
        pass


@app.on_event("startup")
def startup_event():
    """Triggers background cache prewarming when FastAPI starts."""

    threading.Thread(
        target=prewarm_cache_bg,
        daemon=True,
    ).start()


@app.on_event("shutdown")
def shutdown_event():
    """Closes the Hindsight client when FastAPI shuts down."""

    close_hindsight()


# --- FASTAPI ENDPOINTS ---

@app.get("/customers")
def list_customers():
    """Returns list of unique customers with details."""

    data_path = (
        DATA_FILE_PATH
        if DATA_FILE_PATH.exists()
        else Path("data/mock_calls.json")
    )

    if not data_path.exists():
        return []

    with open(data_path, "r", encoding="utf-8") as f:
        records = json.load(f)

    customers_dict = {}

    for r in records:

        name = r.get("customer_name")

        if name and name not in customers_dict:

            customers_dict[name] = {
                "customer_name": name,
                "company_name": r.get(
                    "company_name",
                    "",
                ),
                "total_calls": 0,
                "latest_sentiment": r.get(
                    "sentiment",
                    "neutral",
                ),
                "latest_stage": r.get(
                    "deal_stage",
                    "",
                ),
            }

        if name in customers_dict:

            customers_dict[name]["total_calls"] += 1

            customers_dict[name]["latest_sentiment"] = r.get(
                "sentiment",
                customers_dict[name][
                    "latest_sentiment"
                ],
            )

            customers_dict[name]["latest_stage"] = r.get(
                "deal_stage",
                customers_dict[name][
                    "latest_stage"
                ],
            )

    return list(customers_dict.values())


@app.get("/calls/{customer_name}")
def get_customer_calls(customer_name: str):
    """Returns call history records for specified customer."""

    decoded_name = urllib.parse.unquote(
        customer_name
    ).strip()

    try:

        return get_customer_history(
            decoded_name
        )

    except FileNotFoundError:

        raise HTTPException(
            status_code=404,
            detail="Mock calls database not found.",
        )


@app.get(
    "/brief/{customer_name}/{up_to_call_number}"
)
def get_brief_endpoint(
    customer_name: str,
    up_to_call_number: int,
    refresh: bool = False,
):
    """Returns AI generated brief for customer up to
    call number along with call history.
    """

    decoded_customer_name = urllib.parse.unquote(
        customer_name
    ).strip()

    print(
        f"[BACKEND] Received /brief request for "
        f"'{decoded_customer_name}' up to "
        f"call #{up_to_call_number}"
    )

    try:

        history = get_customer_history(
            decoded_customer_name
        )

    except FileNotFoundError as e:

        print(
            f"[BACKEND ERROR] FileNotFoundError for "
            f"'{decoded_customer_name}': {e}"
        )

        raise HTTPException(
            status_code=404,
            detail=(
                f"Mock calls database not found for "
                f"'{decoded_customer_name}'."
            ),
        )

    except Exception as e:

        print(
            f"[BACKEND ERROR] Error fetching history: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch history: {str(e)}",
        )

    calls_up_to = [
        c
        for c in history
        if c.get("call_number", 0)
        <= up_to_call_number
    ]

    if not calls_up_to:

        print(
            f"[BACKEND ERROR] No calls up to "
            f"#{up_to_call_number} found for "
            f"'{decoded_customer_name}'"
        )

        raise HTTPException(
            status_code=404,
            detail=(
                f"No call history up to "
                f"call #{up_to_call_number} "
                f"for customer "
                f"{decoded_customer_name}"
            ),
        )

    try:

        brief_text = generate_brief(
            decoded_customer_name,
            up_to_call_number,
            force_refresh=refresh,
        )

        if brief_text.startswith(
            "Error generating brief"
        ):

            print(
                f"[BACKEND ERROR] Brief generation error: "
                f"{brief_text}"
            )

            raise HTTPException(
                status_code=500,
                detail=brief_text,
            )

        print(
            f"[BACKEND] Successfully generated brief for "
            f"'{decoded_customer_name}' "
            f"call #{up_to_call_number}"
        )

        return {
            "customer_name": decoded_customer_name,
            "up_to_call_number": up_to_call_number,
            "brief": brief_text,
            "history": history,
            "current_call": (
                calls_up_to[-1]
                if calls_up_to
                else None
            ),
            "total_calls_available": len(history),
        }

    except HTTPException:
        raise

    except Exception as e:

        print(
            f"[BACKEND ERROR] Unhandled exception in "
            f"generate_brief: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                f"Failed to generate brief: "
                f"{str(e)}"
            ),
        )


class CallRecordInput(BaseModel):
    customer_name: str
    company_name: str
    call_number: int
    date: str
    objection_raised: str
    competitor_mentioned: Optional[str] = None
    sentiment: str
    deal_stage: str
    key_quote: str
    next_step_promised: str


@app.post("/calls")
def create_call(call: CallRecordInput):
    """Saves a new call record."""

    save_call(
        call.model_dump()
    )

    return {
        "status": "success",
        "message": (
            f"Call #{call.call_number} "
            f"saved for {call.customer_name}"
        ),
    }


class SaveCallPayload(BaseModel):
    customer_name: str
    company_name: Optional[str] = None
    call_number: Optional[int] = None
    date: Optional[str] = None
    objection_raised: str
    competitor_mentioned: Optional[str] = None
    sentiment: str
    deal_stage: Optional[str] = "negotiation"
    key_quote: str
    next_step_promised: str


@app.post("/save-call")
def save_call_endpoint(
    payload: SaveCallPayload,
):
    """POST endpoint /save-call to append a new sales
    call record using save_call().
    """

    history = []

    try:

        history = get_customer_history(
            payload.customer_name
        )

    except FileNotFoundError:
        pass

    company_name = (
        payload.company_name
        or (
            history[0].get("company_name")
            if history
            else "Unknown Company"
        )
    )

    call_number = (
        payload.call_number
        or (
            len(history) + 1
            if history
            else 1
        )
    )

    call_date = (
        payload.date
        or "2026-09-27"
    )

    call_dict = {
        "customer_name": payload.customer_name,
        "company_name": company_name,
        "call_number": int(call_number),
        "date": call_date,
        "objection_raised": payload.objection_raised,
        "competitor_mentioned": (
            payload.competitor_mentioned
            if payload.competitor_mentioned
            else None
        ),
        "sentiment": payload.sentiment,
        "deal_stage": (
            payload.deal_stage
            or "negotiation"
        ),
        "key_quote": payload.key_quote,
        "next_step_promised": payload.next_step_promised,
    }

    save_call(call_dict)

    print(
        f"[BACKEND] Call #{call_number} saved for "
        f"'{payload.customer_name}'"
    )

    return {
        "status": "success",
        "message": (
            f"Call #{call_number} saved for "
            f"{payload.customer_name}"
        ),
        "call": call_dict,
    }


if __name__ == "__main__":

    import uvicorn

    # Ensure backend folder is in Python path
    backend_dir = Path(__file__).resolve().parent

    if str(backend_dir) not in sys.path:
        sys.path.insert(0, str(backend_dir))

    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(
            encoding="utf-8"
        )

    print(
        "Starting FastAPI server on "
        "http://localhost:8001 ..."
    )

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,
    )