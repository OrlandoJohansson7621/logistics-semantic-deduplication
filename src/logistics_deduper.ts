import { decideNearDuplicate } from "./decision.ts";
import { shipmentEventSchema, type DedupDecision, type ShipmentEvent } from "./logistics_types.ts";
import { InfraiClient } from "./infrai_client.ts";

export async function classifyShipmentEvent(client: InfraiClient, event: unknown, collection: string): Promise<DedupDecision> {
  const parsed: ShipmentEvent = shipmentEventSchema.parse(event);
  const text = [parsed.shipmentId, parsed.eventType, parsed.occurredAt, parsed.location, parsed.details,
    ...parsed.proofOfDelivery.map((file) => `${file.kind}:${file.name}`)].join(" | ");
  const embedding = await client.embed(text);
  const match = await client.query(collection, embedding);
  const decision = decideNearDuplicate(match?.score ?? 0, match?.metadata?.shipmentId);
  if (decision.decision === "new_record") {
    await client.upsert(collection, [{ id: parsed.shipmentId, values: embedding, metadata: { shipmentId: parsed.shipmentId, eventType: parsed.eventType } }]);
  }
  return decision;
}
