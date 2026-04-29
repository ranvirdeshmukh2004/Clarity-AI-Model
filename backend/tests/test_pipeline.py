"""
Tests for the NLP pipeline modules.
"""
import pytest
from app.pipeline.clarity_scorer import compute_clarity_score


class TestClarityScorer:
    """Tests for the clarity score computation."""

    def test_perfect_score(self):
        """All action items have owners and deadlines, no flags."""
        segments = [{"text": f"Segment {i}", "speaker_label": "A"} for i in range(10)]
        vague_flags = []
        contradiction_flags = []
        action_items = [
            {"owner": "Alice", "deadline": "2026-05-01"},
            {"owner": "Bob", "deadline": "2026-05-15"},
        ]
        result = compute_clarity_score(segments, vague_flags, contradiction_flags, action_items)
        assert result["clarity_score"] >= 50
        assert result["unresolved_count"] == 0

    def test_low_score_all_vague(self):
        """Many vague flags should reduce the score."""
        segments = [{"text": f"Segment {i}", "speaker_label": "A"} for i in range(10)]
        vague_flags = [{"flag_type": "vague"} for _ in range(8)]
        contradiction_flags = [{"flag_type": "contradiction"} for _ in range(3)]
        action_items = [{"owner": "Unassigned", "deadline": None}]
        result = compute_clarity_score(segments, vague_flags, contradiction_flags, action_items)
        assert result["clarity_score"] < 50
        assert result["unresolved_count"] == 1

    def test_empty_meeting(self):
        """Empty meeting should return valid scores."""
        result = compute_clarity_score([], [], [], [])
        assert 0 <= result["clarity_score"] <= 100
        assert result["commitment_score"] == 0
        assert result["unresolved_count"] == 0

    def test_score_range(self):
        """Score should always be between 0 and 100."""
        segments = [{"text": "hello", "speaker_label": "A"}]
        for n_vague in range(0, 20, 5):
            vague = [{"flag_type": "vague"}] * n_vague
            result = compute_clarity_score(segments, vague, [], [])
            assert 0 <= result["clarity_score"] <= 100

    def test_unresolved_count(self):
        """Items without owner or deadline should be unresolved."""
        action_items = [
            {"owner": "Alice", "deadline": "2026-05-01"},
            {"owner": "Unassigned", "deadline": "2026-05-01"},
            {"owner": "Bob", "deadline": None},
            {"owner": "Unassigned", "deadline": None},
        ]
        result = compute_clarity_score([], [], [], action_items)
        assert result["unresolved_count"] == 3


class TestTranscriptionParser:
    """Tests for text transcript parsing."""

    def test_parse_speaker_format(self):
        from app.pipeline.transcription import _parse_plain_text

        text = "Alice: Hello everyone.\nBob: Hi Alice.\nAlice: Let's begin."
        segments = _parse_plain_text(text)
        assert len(segments) == 3
        assert segments[0]["speaker_label"] == "Alice"
        assert segments[1]["speaker_label"] == "Bob"
        assert segments[0]["text"] == "Hello everyone."

    def test_parse_no_speaker(self):
        from app.pipeline.transcription import _parse_plain_text

        text = "Just a line without speaker format.\nAnother line."
        segments = _parse_plain_text(text)
        assert len(segments) == 2
        assert segments[0]["speaker_label"] == "Unknown"

    def test_parse_empty(self):
        from app.pipeline.transcription import _parse_plain_text

        segments = _parse_plain_text("")
        assert len(segments) == 0

    def test_parse_srt(self):
        from app.pipeline.transcription import _parse_srt

        srt_text = """1
00:00:01,000 --> 00:00:05,000
Hello everyone, welcome.

2
00:00:06,000 --> 00:00:10,000
Let's get started."""
        segments = _parse_srt(srt_text)
        assert len(segments) == 2
        assert segments[0]["start_time"] == 1.0
        assert segments[0]["end_time"] == 5.0


class TestVaguenessLexicon:
    """Tests for the vagueness lexicon pre-filter."""

    def test_detects_vague_phrases(self):
        from app.pipeline.vagueness import _lexicon_prefilter

        segments = [
            {"text": "We'll see how it goes."},
            {"text": "The deadline is Friday at 5pm."},
            {"text": "Maybe we should do that."},
            {"text": "I'll have the report ready by tomorrow."},
        ]
        flagged = _lexicon_prefilter(segments)
        assert 0 in flagged  # "We'll see"
        assert 2 in flagged  # "Maybe"
        assert 1 not in flagged  # Clear statement
        assert 3 not in flagged  # Clear commitment

    def test_empty_segments(self):
        from app.pipeline.vagueness import _lexicon_prefilter

        assert _lexicon_prefilter([]) == []
