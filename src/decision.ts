import type { DedupDecision } from "./logistics_types.ts";

export function decideNearDuplicate(score: number, matchedShipmentId: string | undefined): DedupDecision {
  if (matchedShipmentId && score >= 0.9) {
    return { decision: "duplicate", matchedShipmentId, score };
  }
  return { decision: "new_record", score };
}
