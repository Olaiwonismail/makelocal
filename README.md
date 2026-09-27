# MakeLocal

**Tell MakeLocal what you want to make, or show it something you currently import. It works out how to make it locally, what it will cost against importing, and who nearby can help you make it.**

Try it: **https://makelocal-liart.vercel.app** (type "tomato paste")

---

## The problem

African countries import goods they could make themselves, and the reason is rarely a lack of demand or raw materials. It's that nobody can easily answer the questions that come before a factory:

- What is this product actually made of, and how is it made?
- What machines do I need, and what do they cost?
- Would making it here be cheaper than importing it, and when?
- Who nearby can supply the materials, run the machines, or finish and ship it?

That knowledge is scattered across consultants, trade associations, market traders and supplier catalogues. Getting it takes months and money most entrepreneurs don't have. So they keep importing.

## The solution

MakeLocal is a **Local Manufacturing Copilot**: an AI agent that turns a product into an actionable local manufacturing plan. You give it a product by typing its name, pasting a product link, or uploading a photo. It asks a few questions (how many, where you'll sell, how close to the original it must be), then works through six steps you can inspect one by one:

1. **Product analysis.** Materials, manufacturing process and required equipment.
2. **Feasibility and cost.** Per-unit cost of making it locally against the landed cost of importing, with every figure labelled as sourced or estimated.
3. **An honest verdict.** When local production makes sense, when it doesn't, and the risks that could flip the answer.
4. **Local supply chain.** Real businesses near you: material suppliers, workshops and services, with distance and contact details.
5. **Production plan.** The workflow, batch size, timing, machines and step-by-step actions.
6. **Quotes.** A request for quotation drafted for you to send to the businesses you choose.

## An example: tomato paste in Kano

Nigeria is Africa's second-largest tomato producer and grows about 65% of West Africa's tomatoes. Yet it imports around 150,000 tonnes of tomato paste a year, worth about $170 million and mostly from China, while roughly 900,000 tonnes of fresh tomatoes rot for lack of storage and processing.

A user types **"tomato paste sachets"**, says they want 20,000 sachets and want them made in Kano. MakeLocal asks one product-specific question, *"Sachet or tin?"*, because the filling machine and shelf life differ completely. Then:

- **Analysis.** It breaks the product down: fresh tomatoes (0.39 kg per 70g sachet, 7.8 tonnes a batch), salt and citric acid, laminate film, cartons. The process is wash, hot break, pulp, evaporate to 28 Brix, sterilise, fill, pasteurise. It lists nine machines with price ranges, a line costing $20,000 to $100,000.
- **Cost.** Made locally: **₦117 per sachet**. Imported and landed: **₦130 per sachet**, once the 50% tariff and clearing are added. That's **₦13 saved per sachet**, 10% cheaper, about ₦260,000 on one batch.
- **Verdict.** Viable only during the February to May harvest, with contracted farm supply. Off season, tomatoes reach ₦3,000/kg and local paste costs three times the import. On a ₦145m line, break-even is about 11 million sachets: years, not months. Erisco's 2016 plant closed within the year, which is the risk this plan has to manage.
- **Suppliers.** NATPAN (the tomato growers' association) for contract farming, growers at the Kadawa irrigation scheme, FIIRO in Lagos for toll processing and training, Lagos converters for sachet film, and turnkey line suppliers.
- **Plan.** 20,000 sachets in two shifts at 500 kg/h, first batch in 14 weeks (equipment is the long pole), NAFDAC registration in parallel, a 60 to 90 day campaign.
- **Quotes.** A ready brief to send to NATPAN, FIIRO and line suppliers asking for price, minimum order and lead time.

In minutes, an entrepreneur knows whether to build, when, what to watch out for, and who to call first.

## How we help

- **Entrepreneurs and SMEs** get a first feasibility study and a production plan without paying for a consultant.
- **Merchants who import** see exactly what it would take to make their best sellers locally, and what they'd save.
- **Workshops and manufacturers** get found by people who need their machines and skills.
- **Local economies** keep more value at home: crops processed instead of wasted, jobs in workshops instead of shipping lanes.

We're careful with numbers people will act on:

- **Every cost shows where it came from.** Each line is tagged Sourced or Estimate, with the evidence behind it. A guess is never presented as a quote.
- **Suppliers are real businesses.** In live mode they come from Google Maps listings. Names, addresses, phone numbers and distances come straight from the listing, never from the AI.
- **Nothing is sent without you.** Quote requests are drafts: you copy them or open them in WhatsApp and send them yourself.
- **Local from the start.** Every lookup is scoped to your city, country and currency.

## Built with

- **AI:** Gemma 4 31B through the Gemini API, with every answer checked against a strict schema.
- **Data:** Serper (Google Maps businesses), Tavily (prices, wages, power costs and duties), Firecrawl (product links and supplier websites), ExchangeRate-API, API Ninjas (commodity prices), OpenStreetMap (locations).
- **Backend:** Python, FastAPI, Pydantic and SQLite, hosted on Render.
- **Frontend:** Next.js 16, React 19, TypeScript and Tailwind CSS, hosted on Vercel.

## Run it yourself

You need Node 20+ and [uv](https://docs.astral.sh/uv/).

```bash
./scripts/dev.sh
```

This starts the API on http://localhost:8000 and the web app on http://localhost:3000. The tomato paste demo needs no API keys. For any other product, copy `backend/.env.example` to `backend/.env` and add your keys: `GEMINI_API_KEY` is required, the rest each switch on one data source.

Tests: `cd backend && uv run pytest`, and `cd frontend && npm run lint && npm run build`.

To deploy your own copy, see [DEPLOY.md](DEPLOY.md). How the code is organised is in [AGENTS.md](AGENTS.md).

---

Built by **Team MakeLocal**, 2026.
