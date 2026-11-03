import { InfraiClient } from "./infrai_client.ts";
import { classifyShipmentEvent } from "./logistics_deduper.ts";

const key = process.env.INFRAI_API_KEY;
if (!key) throw new Error("Set INFRAI_API_KEY before running the demo");

const event = {
  shipmentId: "SHP-2048",
  eventType: "delivered",
  occurredAt: "2026-10-31T15:20:00.000Z",
  location: "Shanghai",
  details: "Signed at receiving desk; carton count 12",
  proofOfDelivery: [{ name: "signed-delivery.pdf", kind: "signature" }]
};

const result = await classifyShipmentEvent(new InfraiClient(key), event, "shipment-events");
console.log(JSON.stringify(result, null, 2));
