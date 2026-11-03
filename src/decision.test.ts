import { strict as assert } from "node:assert";
import { decideNearDuplicate } from "./decision.ts";

const duplicate = decideNearDuplicate(0.94, "SHP-101");
assert.deepEqual(duplicate, { decision: "duplicate", matchedShipmentId: "SHP-101", score: 0.94 });
assert.deepEqual(decideNearDuplicate(0.89, "SHP-101"), { decision: "new_record", score: 0.89 });
console.log("decision test passed");
