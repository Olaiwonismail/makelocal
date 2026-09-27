# AGENTS.md — MakeLocal

## Product

MakeLocal is a **Local Manufacturing Copilot**: an AI agent that takes a product (name, description, photo, or an imported product a user wants to stop importing) and turns it into an actionable local manufacturing plan.

Pitch: *"Tell our AI what you want to make—or show it something you currently import—and it figures out how to make it locally, what it will cost, and who can help you make it."*

Target users: entrepreneurs, merchants, SMEs, manufacturers, workshop owners.

### Core pipeline

Given a product input, the agent must:

1. **Identify** the product and break it into materials/components (BOM).
2. **Determine manufacturing process** — steps, machines/tools required, skills needed.
3. **Estimate costs** — materials, labour, equipment/tooling, production overhead, logistics, and import/landed cost (for comparison).
4. **Find local suppliers/manufacturers** with the required capabilities.
5. **Compare local production vs. importing** (cost, time, quality trade-offs).
6. **Produce a production plan** and optionally draft/send quote requests to suppliers.

Each stage should be a distinct, inspectable step (not one opaque LLM call) so a user can see *why* a cost or supplier was suggested, and so individual steps can be improved/swapped independently.

## Stack

- **Backend**: FastAPI (Python) — owns the agent pipeline (identify → BOM → process → cost → suppliers → compare → plan).
- **Frontend**: Next.js (TypeScript) — product input (text/photo), plan display, supplier comparison UI.
- **AI provider**: Gemini, via the `google-genai` Python SDK (`google.genai`), from the backend. Keep all `genai.Client()` calls behind one module in the pipeline so prompts/model names aren't scattered across pipeline stages.
- **Web search/research**: Tavily — for the "find local suppliers/manufacturers" pipeline stage and any live web lookups (comparable costs, import data, supplier info) the LLM can't answer from its own knowledge. Not installed yet — when wiring it in, follow the setup instructions at https://tavily.com/agent-setup/SKILL.md rather than guessing the integration steps.

Layout: `frontend/` is the Next.js app (Next 16, Tailwind v4 — read its own `frontend/AGENTS.md` before editing). No backend yet. Add DB and hosting here once chosen.

## Architecture principles

- **Pipeline, not monolith**: identify → BOM → process → cost → suppliers → compare → plan should be separable functions/modules, each independently testable with fixture inputs, so a bad supplier match doesn't require re-running product identification.
- **Local-first data**: "local" is meaningless without a locale. Every supplier/cost lookup should be scoped by region/country from the start — don't hardcode a single country's suppliers or currency.
- **Costs need provenance**: every estimated number (materials, labour, logistics) should carry along *why* — source, assumption, or comparable — since these are the numbers a user will act on financially. Never present a guessed cost as if it were sourced.
- **Suppliers are real businesses**: when the product later contacts/quotes real suppliers, treat that as an action with consequences (see below) — draft, don't auto-send, until explicitly wired up and confirmed.

## Working conventions

- Keep the agent pipeline's LLM prompts and provider calls isolated in one module so the provider can be swapped without touching pipeline logic.
- This is a hackathon project — prioritize a working end-to-end demo (one product, one region, a small seed supplier list) over completeness across every category. Breadth can come after the vertical slice works.
- Since supplier "contact/quote" actions touch real businesses, always draft first and require explicit user confirmation before actually sending anything — don't wire up auto-send silently.
- Once a stack is chosen, set up its standard test/build tooling rather than skipping it because "it's a hackathon."

## Open decisions (fill in as they're made)

- [ ] DB and hosting.
- [ ] Target region(s)/locale for the initial supplier directory and cost data.
- [ ] Source of supplier data (manual seed list, scraping, partner API).
- [ ] Whether "contact supplier" ships in the hackathon demo or stays a stretch goal.
