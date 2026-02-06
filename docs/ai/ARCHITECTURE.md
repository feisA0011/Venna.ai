# Venna Architecture (MVP)

## Products
- Model 1: Venna for Venues (B2B) — trust-first receptionist.
- Model 2: Venna Connoisseur (B2C) — future, separate app + data boundaries.

## Monorepo
- Turborepo + pnpm workspaces
- apps/web: Next.js 16 dashboard + landing
- apps/widget: embeddable widget (boot.js + ui.js)
- apps/mobile: Expo app (iOS/Android)

## Data model (conceptual)
- venues
- users (roles)
- documents (scraped/approved)
- conversations
- messages
- escalations
- outcomes (verified answers)
- metrics (aggregated, anonymized)

## Widget constraints
- boot.js tiny loader, delayed injection on intent
- ui bundle minimal
- Shadow DOM for CSS isolation
- No API keys in widget

## Decision pipeline
1) Check verified memory cache for similar Q
2) Retrieve relevant venue docs
3) LLM drafts answer + confidence + citations
4) If confidence < threshold => escalation
5) Human resolution becomes verified outcome
