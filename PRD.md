Product Requirements Document
Project Name: Meeting Clarity AI
Working Title: Transcript Intelligence for Clarity, Commitment, and Accountability
1. Product Overview
Meeting Clarity AI is a transcript-based AI product that analyzes meeting conversations and identifies vague statements, contradictions, non-committal responses, excessive filler language, missing ownership, and unresolved decisions. The product outputs a clarity score and supporting insights so teams can understand whether a meeting produced real alignment or just discussion. The core idea is to improve communication quality and follow-through, not to claim that someone is lying.

2. Problem Statement
Most meeting tools today focus on transcription and summarization, but they do not tell users whether the conversation was clear, actionable, and internally consistent. Teams often leave meetings with uncertainty such as “Who owns this?”, “Did we actually decide anything?”, or “Are we contradicting earlier decisions?” This creates delays, missed deadlines, and repeated discussions. Existing meeting intelligence products commonly emphasize speaker attribution, action items, and summaries, but not a structured evaluation of communication quality itself.

3. Product Vision
The vision is to turn every meeting transcript into a structured intelligence report that measures clarity, commitment, consistency, and accountability. The product should help managers, founders, teams, and salespeople quickly see whether the meeting produced a decision, a plan, or just ambiguity. Over time, the system should learn team communication patterns and surface recurring issues such as vague commitments or repeated topic loops.

4. Goals
The product should achieve the following goals:

Detect vague or hedged language in meetings.

Detect contradictions within the same meeting and across previous meetings.

Extract action items with owners and deadlines.

Score meeting clarity in a simple and understandable way.

Give users an evidence-based view of where communication broke down.

Make meetings more accountable and easier to follow up on.

These goals align with modern PRD best practices: define the purpose, measurable outcomes, and user value clearly before development begins.

5. Non-Goals
The product will not:

Claim to determine whether a person is lying.

Make legal, disciplinary, or psychological judgments.

Replace human judgment in conflict resolution.

Perform emotion reading beyond basic tone or sentiment indicators.

Guarantee factual truth from conversation alone.

This boundary is important because the system should be framed as a decision-support and communication-quality tool, not a surveillance or deception detector.

6. Target Users
Primary users:

Founders and startup teams.

Project managers.

Sales and customer success teams.

Team leads and department managers.

Consultants and client-facing teams.

Secondary users:

Individual contributors who want feedback on communication.

Operations teams tracking action items.

Coaches and trainers improving speaking clarity.

7. Core Use Cases
A manager uploads a meeting transcript and sees which commitments were vague or incomplete.

A project team checks whether all action items have an owner and due date.

A sales team reviews whether the prospect gave real commitment or only polite interest.

A founder checks whether a leadership meeting ended with clear decisions.

A team compares a new transcript against past meetings to see whether the same issue keeps resurfacing.

8. Product Scope
MVP Scope
The first version should include:

Transcript upload or integration from meeting platforms.

Speaker diarization or speaker labeling.

Sentence-level transcript analysis.

Vague language detection.

Contradiction detection.

Action item extraction.

Clarity score.

Meeting summary with structured sections.

Dashboard showing flagged moments.

Exportable report.

Post-MVP Scope
Later versions can include:

Live meeting analysis in real time.

Cross-meeting memory and trend analysis.

Role-based team analytics.

Coaching suggestions for speakers.

CRM and project management integrations.

Slack/email follow-up reminders.

Team benchmark dashboards.

9. Key Features
9.1 Transcript Ingestion
The system should accept:

Zoom recordings

Google Meet transcripts

Uploaded audio files

Uploaded text transcripts

API-based meeting data from third-party tools

9.2 Speech-to-Text
If audio is provided, the product should:

Convert audio to text.

Preserve timestamps.

Support multiple speakers.

Handle noisy meeting audio reasonably well.

9.3 Speaker Diarization
The system should identify different speakers and label utterances by speaker. This matters because action items, contradictions, and commitments need to be tied to the right person.

9.4 Vagueness Detection
The product should flag phrases such as:

“We’ll see.”

“Maybe.”

“Probably.”

“Let’s revisit later.”

“Kind of.”

“I think so.”

“At some point.”

It should classify these as low-confidence or non-committal language based on context.

9.5 Contradiction Detection
The system should detect when a speaker:

Makes one claim and later reverses it.

Conflicts with another speaker in the same meeting.

Conflicts with a prior meeting transcript.

Uses mutually inconsistent dates, owners, or decisions.

9.6 Action Item Extraction
The product should identify:

Task description

Owner

Deadline

Dependency

Priority

Status if inferable

9.7 Clarity Score
The system should generate a score from 0 to 100 using signals such as:

specificity of commitments

ownership clarity

number of unresolved statements

contradiction count

filler density

decision completion rate

9.8 Meeting Report
The final output should include:

Meeting summary

Decisions made

Action items

Vague statements

Contradictions

Missing owners

Missing deadlines

Suggested follow-ups

9.9 Search and Replay
The user should be able to click a flagged point and jump to:

the exact transcript line

the timestamp

the speaker

surrounding context

10. User Experience
The interface should feel like a professional analytics product, not a chatbot-only interface. The main workflow should be:

Upload or import meeting.

Wait for processing.

Review a summary dashboard.

Open flagged moments.

Export or share report.

The main dashboard should show:

clarity score

commitment score

contradiction count

unresolved items

speaker participation

timeline of issues

11. Output Design
The report should be easy to read and structured as follows:

Overview

Key decisions

Action items

Risk flags

Vague statements

Contradictions

Speaker analysis

Suggested follow-up email

Example output line:

“This statement is low-commitment because the speaker used hedging language and did not assign an owner or deadline.”

12. AI and NLP Logic
The system should use multiple NLP layers rather than one single model:

ASR for transcription.

Diarization for speaker separation.

Sentence segmentation.

Embedding-based similarity for matching related claims.

NLI/contradiction models for inconsistency detection.

Sequence classification for vagueness and commitment strength.

LLM-based reasoning for explanation and report generation.

The system should also support human review, so users can confirm or reject flagged items and improve the model over time.

13. Suggested Tech Stack
Backend
Python

FastAPI

Celery

Redis

PostgreSQL

AI / NLP
Whisper or another speech-to-text engine

pyannote.audio for diarization

HuggingFace Transformers

Sentence-Transformers

spaCy

DeBERTa or RoBERTa for contradiction detection

LLM API for structured report generation

Frontend
React

Next.js

Tailwind CSS

Charting with Plotly or Recharts

Storage and Infrastructure
AWS S3 for audio and files

PostgreSQL for metadata

pgvector, Pinecone, or Weaviate for semantic search

Docker

Kubernetes later if scaling requires it

Integrations
Zoom API

Google Meet exports

Slack

Email

Notion / Jira / Asana / Trello

Google Drive

14. Data Requirements
The product needs:

meeting transcript text

speaker labels

timestamps

action-item annotations

contradiction labels

vagueness labels

user feedback on flagged items

The system should store both raw transcript data and structured analysis results.

15. Success Metrics
Product Metrics
Percentage of meetings with usable transcripts

Percentage of action items correctly extracted

Precision of vagueness detection

Precision of contradiction detection

User acceptance rate of flagged items

Number of reports shared or exported

Business Metrics
Weekly active teams

Meeting reports generated per team

Retention after 30 days

Conversion from free to paid

Integration adoption rate

Quality Metrics
False positive rate for contradiction flags

False negative rate for missed commitments

Latency per transcript

Report generation time

16. MVP Acceptance Criteria
The MVP is successful if:

A user can upload a transcript and receive analysis in under a few minutes.

The system identifies at least three categories: vague statements, action items, and contradictions.

The output clearly links each flag to a transcript excerpt and timestamp.

The clarity score is understandable without explanation.

The product produces a readable report that teams can use immediately.

17. Risks and Constraints
Key risks:

False accusation risk if the product is positioned as lie detection.

Contradiction detection may generate false positives.

Transcript quality may be poor in noisy meetings.

Diarization errors may affect attribution.

Users may distrust automated judgments without evidence.

Mitigation:

Use cautious language.

Always show source transcript evidence.

Let users review and edit flags.

Avoid using the word “lie detector” in the product UI.

18. Privacy and Compliance
The product should include:

consent-based recording policies

transcript encryption at rest and in transit

role-based access control

audit logs

data retention controls

deletion requests

workspace-level permissions

This is especially important because meeting content is sensitive and often confidential.

19. Roadmap
Phase 1: MVP
Transcript upload

Speaker diarization

Vague language detection

Action item extraction

Clarity score

Basic dashboard

Phase 2: Intelligence Layer
Contradiction detection

Cross-meeting memory

Trend analysis

Better summarization

Follow-up suggestions

Phase 3: Team Product
Slack and Jira integrations

Real-time meeting analysis

Manager dashboards

Team benchmarks

Coaching insights

20. Final Product Definition
Meeting Clarity AI is an AI system that reads meeting transcripts and tells teams whether the conversation was clear, consistent, and actionable. It helps users detect weak commitments, contradictions, missing ownership, and communication breakdowns so meetings become more productive and accountable. The product should feel like a meeting intelligence layer that reveals what summaries miss.