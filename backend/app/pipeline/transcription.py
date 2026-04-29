"""
Transcription pipeline step.

Handles both text uploads (parse directly) and audio uploads (Gemini multimodal).
"""
import re
import logging
import google.generativeai as genai
from app.core.config import settings
from app.core.database import get_supabase_client

logger = logging.getLogger(__name__)


async def transcribe_meeting(meeting: dict) -> list[dict]:
    """
    Transcribe/parse a meeting file into speaker-labeled segments.

    For text files: Parse plain text, SRT, or VTT format.
    For audio files: Use Gemini's multimodal audio input.

    Returns:
        List of segment dicts: {speaker_label, text, start_time, end_time}
    """
    source_type = meeting["source_type"]
    file_path = meeting["file_path"]

    if source_type == "upload_text":
        return await _parse_text_file(file_path)
    elif source_type == "upload_audio":
        return await _transcribe_audio(file_path)
    else:
        raise ValueError(f"Unsupported source type: {source_type}")


async def _parse_text_file(file_path: str) -> list[dict]:
    """
    Parse a text transcript file into segments.

    Supports formats:
    - Plain text with "Speaker: text" pattern
    - SRT subtitle format
    - VTT subtitle format
    """
    db = get_supabase_client()

    # Download file from Supabase Storage
    file_bytes = db.storage.from_(settings.STORAGE_BUCKET).download(file_path)
    text = file_bytes.decode("utf-8")

    # Detect format and parse
    if file_path.endswith(".srt"):
        return _parse_srt(text)
    elif file_path.endswith(".vtt"):
        return _parse_vtt(text)
    else:
        return _parse_plain_text(text)


def _parse_plain_text(text: str) -> list[dict]:
    """
    Parse plain text transcript.
    Expected format: "Speaker Name: What they said"
    Falls back to treating each line as a separate segment if no speaker pattern found.
    """
    segments = []
    # Pattern: "Speaker Name: text" or "SPEAKER_00: text"
    speaker_pattern = re.compile(r"^([A-Za-z_\s]+\d*)\s*:\s*(.+)$")

    lines = text.strip().split("\n")
    current_speaker = "Unknown"

    for line in lines:
        line = line.strip()
        if not line:
            continue

        match = speaker_pattern.match(line)
        if match:
            current_speaker = match.group(1).strip()
            spoken_text = match.group(2).strip()
        else:
            spoken_text = line

        segments.append({
            "speaker_label": current_speaker,
            "text": spoken_text,
            "start_time": None,
            "end_time": None,
        })

    return segments


def _parse_srt(text: str) -> list[dict]:
    """Parse SRT subtitle format into segments."""
    segments = []
    blocks = re.split(r"\n\n+", text.strip())

    for block in blocks:
        lines = block.strip().split("\n")
        if len(lines) >= 3:
            # Line 1: index, Line 2: timestamps, Line 3+: text
            time_match = re.match(
                r"(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})",
                lines[1],
            )
            if time_match:
                start = _time_to_seconds(*[int(x) for x in time_match.groups()[:4]])
                end = _time_to_seconds(*[int(x) for x in time_match.groups()[4:]])
                content = " ".join(lines[2:])
                segments.append({
                    "speaker_label": "Speaker",
                    "text": content,
                    "start_time": start,
                    "end_time": end,
                })

    return segments


def _parse_vtt(text: str) -> list[dict]:
    """Parse WebVTT format into segments."""
    segments = []
    # Remove WEBVTT header
    text = re.sub(r"^WEBVTT.*?\n\n", "", text, flags=re.DOTALL)
    blocks = re.split(r"\n\n+", text.strip())

    for block in blocks:
        lines = block.strip().split("\n")
        for i, line in enumerate(lines):
            time_match = re.match(
                r"(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})\.(\d{3})",
                line,
            )
            if time_match:
                start = _time_to_seconds(*[int(x) for x in time_match.groups()[:4]])
                end = _time_to_seconds(*[int(x) for x in time_match.groups()[4:]])
                content = " ".join(lines[i + 1:])
                segments.append({
                    "speaker_label": "Speaker",
                    "text": content,
                    "start_time": start,
                    "end_time": end,
                })
                break

    return segments


def _time_to_seconds(h: int, m: int, s: int, ms: int) -> float:
    """Convert hours, minutes, seconds, milliseconds to total seconds."""
    return h * 3600 + m * 60 + s + ms / 1000


async def _transcribe_audio(file_path: str) -> list[dict]:
    """
    Transcribe audio using Gemini's multimodal API.

    Sends the audio file to Gemini and asks for a speaker-diarized transcript.
    """
    db = get_supabase_client()

    # Download audio from Supabase Storage
    audio_bytes = db.storage.from_(settings.STORAGE_BUCKET).download(file_path)

    # Configure Gemini
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.5-flash")

    # Determine MIME type
    mime_type = "audio/mpeg"
    if file_path.endswith(".wav"):
        mime_type = "audio/wav"
    elif file_path.endswith(".m4a"):
        mime_type = "audio/mp4"

    prompt = """Transcribe this audio recording of a meeting. 
    
For each segment of speech, identify the speaker and provide the text they said.
Output ONLY a valid JSON array with objects in this exact format:
[
  {"speaker_label": "Speaker 1", "text": "What they said", "start_time": 0.0, "end_time": 5.2},
  ...
]

Rules:
- Identify different speakers and label them consistently (Speaker 1, Speaker 2, etc.)
- Include approximate timestamps in seconds
- Capture all spoken content accurately
- Return ONLY the JSON array, no other text"""

    response = model.generate_content([
        prompt,
        {"mime_type": mime_type, "data": audio_bytes},
    ])

    # Parse JSON response
    import json
    response_text = response.text.strip()
    # Remove markdown code fences if present
    if response_text.startswith("```"):
        response_text = re.sub(r"```json?\n?", "", response_text)
        response_text = response_text.rstrip("`").strip()

    segments = json.loads(response_text)
    return segments
