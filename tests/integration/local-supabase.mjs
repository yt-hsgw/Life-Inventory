import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

function readLocalValue(output, key) {
  return output.match(new RegExp(`^${key}="([^"]+)"$`, "m"))?.[1];
}

let url = process.env.SUPABASE_TEST_URL;
let publishableKey = process.env.SUPABASE_TEST_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  try {
    const output = execFileSync("npx", ["supabase", "status", "-o", "env"], {
      encoding: "utf8",
    });
    url ??= readLocalValue(output, "API_URL");
    publishableKey ??= readLocalValue(output, "PUBLISHABLE_KEY");
  } catch {
    // The actionable error below is clearer than the CLI's container details.
  }
}

if (!url || !publishableKey) {
  throw new Error(
    "Run `npm run supabase:start` or set SUPABASE_TEST_URL and SUPABASE_TEST_PUBLISHABLE_KEY.",
  );
}

async function createTestUser(label) {
  const client = createClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const password = `Test-${randomUUID()}-9!`;
  const { data, error } = await client.auth.signUp({
    email: `${label}-${randomUUID()}@example.com`,
    password,
  });
  assert.ifError(error);
  assert.ok(data.user);
  assert.ok(data.session);
  return { client, userId: data.user.id };
}

const owner = await createTestUser("owner");
const stranger = await createTestUser("stranger");

const categoryResult = await owner.client
  .from("categories")
  .insert({ user_id: owner.userId, name: "Test category", sort_order: 0 })
  .select("id")
  .single();
assert.ifError(categoryResult.error);

const itemResult = await owner.client
  .from("items")
  .insert({
    user_id: owner.userId,
    category_id: categoryResult.data.id,
    name: "RLS test item",
    quantity: 2,
    review_requested: true,
  })
  .select("id")
  .single();
assert.ifError(itemResult.error);

const strangerRead = await stranger.client
  .from("items")
  .select("id")
  .eq("id", itemResult.data.id);
assert.ifError(strangerRead.error);
assert.equal(strangerRead.data.length, 0);

const strangerUpdate = await stranger.client
  .from("items")
  .update({ status: "RELEASE" })
  .eq("id", itemResult.data.id)
  .select("id");
assert.ifError(strangerUpdate.error);
assert.equal(strangerUpdate.data.length, 0);

const ownershipAttack = await stranger.client.from("categories").insert({
  user_id: owner.userId,
  name: "Cross-user category",
  sort_order: 0,
});
assert.ok(ownershipAttack.error);

const sessionId = randomUUID();
const reviewResult = await owner.client.rpc("review_item", {
  p_item_id: itemResult.data.id,
  p_decision: "MAYBE",
  p_session_id: sessionId,
  p_memo: "transaction check",
});
assert.ifError(reviewResult.error);

const [updatedItem, history] = await Promise.all([
  owner.client
    .from("items")
    .select("status,review_requested")
    .eq("id", itemResult.data.id)
    .single(),
  owner.client
    .from("item_reviews")
    .select("decision,previous_status,review_session_id")
    .eq("item_id", itemResult.data.id)
    .single(),
]);
assert.ifError(updatedItem.error);
assert.ifError(history.error);
assert.equal(updatedItem.data.status, "MAYBE");
assert.equal(updatedItem.data.review_requested, false);
assert.equal(history.data.previous_status, "KEEP");
assert.equal(history.data.decision, "MAYBE");
assert.equal(history.data.review_session_id, sessionId);

const reviewedQueue = await owner.client.rpc("get_review_queue", {
  p_session_id: sessionId,
});
assert.ifError(reviewedQueue.error);
assert.equal(
  reviewedQueue.data.some((item) => item.id === itemResult.data.id),
  false,
);

const duplicateReview = await owner.client.rpc("review_item", {
  p_item_id: itemResult.data.id,
  p_decision: "MAYBE",
  p_session_id: sessionId,
  p_memo: "duplicate",
});
assert.ifError(duplicateReview.error);
assert.equal(duplicateReview.data.id, reviewResult.data.id);

const historyCount = await owner.client
  .from("item_reviews")
  .select("id", { count: "exact", head: true })
  .eq("item_id", itemResult.data.id);
assert.ifError(historyCount.error);
assert.equal(historyCount.count, 1);

const newSessionQueue = await owner.client.rpc("get_review_queue", {
  p_session_id: randomUUID(),
});
assert.ifError(newSessionQueue.error);
assert.equal(
  newSessionQueue.data.some((item) => item.id === itemResult.data.id),
  true,
);

const forgedReview = await owner.client.from("item_reviews").insert({
  user_id: owner.userId,
  item_id: itemResult.data.id,
  previous_status: "MAYBE",
  decision: "RELEASE",
});
assert.ok(forgedReview.error);

const requestAgain = await owner.client
  .from("items")
  .update({ review_requested: true })
  .eq("id", itemResult.data.id);
assert.ifError(requestAgain.error);

const requestedQueue = await owner.client.rpc("get_review_queue", {
  p_session_id: sessionId,
});
assert.ifError(requestedQueue.error);
assert.equal(
  requestedQueue.data.some((item) => item.id === itemResult.data.id),
  false,
);

const nextSessionId = randomUUID();
const nextRequestedQueue = await owner.client.rpc("get_review_queue", {
  p_session_id: nextSessionId,
});
assert.ifError(nextRequestedQueue.error);
assert.equal(
  nextRequestedQueue.data.some((item) => item.id === itemResult.data.id),
  true,
);

const nextSessionReview = await owner.client.rpc("review_item", {
  p_item_id: itemResult.data.id,
  p_decision: "KEEP",
  p_session_id: nextSessionId,
  p_memo: "next session",
});
assert.ifError(nextSessionReview.error);

const twoSessionHistory = await owner.client
  .from("item_reviews")
  .select("id", { count: "exact", head: true })
  .eq("item_id", itemResult.data.id);
assert.ifError(twoSessionHistory.error);
assert.equal(twoSessionHistory.count, 2);

const ideal = {
  user_id: owner.userId,
  category_id: categoryResult.data.id,
  name: "Chair",
  target_quantity: 1,
};
const firstIdeal = await owner.client.from("ideal_items").insert(ideal);
assert.ifError(firstIdeal.error);
const duplicateIdeal = await owner.client
  .from("ideal_items")
  .insert({ ...ideal, name: " chair " });
assert.ok(duplicateIdeal.error);

console.log(
  "Local Supabase integration passed: ownership RLS, review invariants, and Ideal uniqueness verified.",
);
