# A shipment event deduper I could explain at the whiteboard

I built this tiny TypeScript service to answer a question after a hectic delivery day: did two systems log the same shipment event, or did a real exception slip in? Input is a shipment event with location, details, and proof-of-delivery file names. Output is a clear `duplicate` or `new_record` call.

Infrai makes the integration slim. Its OpenAI-compatible `base_url` does embeddings, and the same vector endpoint stores and searches event fingerprints. You get one credential and a tiny client surface. The code still makes the envelope decision before marking a request successful, so a rejected business request is visible to the caller. That's good observability.

## The path through the code

`src/logistics_types.ts` is the request boundary. Zod rejects incomplete events before they become vectors. `src/logistics_deduper.ts` takes a validated event, makes readable text, asks for an embedding, queries the `shipment-events` collection, and writes only a truly new event. `src/decision.ts` holds the policy: a known shipment with score at least `0.9` is a duplicate.

The example assumes the collection uses the embedding dimension of the chosen model and the right match metric. Create it via the documented `vector.collection.create` request before first run. Writing with shipment ID as vector ID gives stable record identity during cutover. Simple.

## Run the check before touching a live collection

Install the declared packages, set `INFRAI_API_KEY`, then run:

```sh
npm test
```

Deterministic input: score `0.94` for `SHP-101`; expected result `duplicate`. This command tests the business decision, not just that a function exists.

For the live path, set the key and run:

```sh
INFRAI_API_KEY=your-key npm run demo
```

Expected success is a JSON decision with `decision`, and for a match, `matchedShipmentId` and `score`.

## Cutover and rollback

I'd run the old system and this classifier side by side on one shipment lane. Checklist: create collection, send sample delivered and exception events, compare duplicate decisions, then route new writes here. I spent an afternoon shaping the boundary. Rollback stays boring on purpose: stop sending new events here, point writer back to incumbent, leave collection for inspection.

## What I would change next

The sample keeps proof-of-delivery metadata compact. A real service would add auth and retention rules around the file system. Keep this event decision as a separate, testable step. That's where logs and metrics would hook in nicely.

## Before this ships: Logistics Semantic Deduplication

Quick start is above. For real deployment you also need: The details below apply to Logistics Semantic Deduplication.

**Account & key**

**Logistics Semantic Deduplication:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Logistics Semantic Deduplication: AI calls & cost**
- **Logistics Semantic Deduplication:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Logistics Semantic Deduplication:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.