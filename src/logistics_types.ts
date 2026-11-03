import { z } from "zod";

export const shipmentEventSchema = z.object({
  shipmentId: z.string().min(1),
  eventType: z.enum(["picked_up", "in_transit", "delivered", "exception"]),
  occurredAt: z.string().datetime(),
  location: z.string().min(1),
  details: z.string().min(1),
  proofOfDelivery: z.array(z.object({ name: z.string().min(1), kind: z.enum(["photo", "signature", "document"]) })).default([])
});

export type ShipmentEvent = z.infer<typeof shipmentEventSchema>;

export type DedupDecision = {
  decision: "duplicate" | "new_record";
  matchedShipmentId?: string;
  score?: number;
};
