import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_TEST_URL;
const publishableKey = process.env.SUPABASE_TEST_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error("Set SUPABASE_TEST_URL and SUPABASE_TEST_PUBLISHABLE_KEY.");
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

const reviewResult = await owner.client.rpc("review_item", {
  p_item_id: itemResult.data.id,
  p_decision: "MAYBE",
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
    .select("decision,previous_status")
    .eq("item_id", itemResult.data.id)
    .single(),
]);
assert.ifError(updatedItem.error);
assert.ifError(history.error);
assert.equal(updatedItem.data.status, "MAYBE");
assert.equal(updatedItem.data.review_requested, false);
assert.equal(history.data.previous_status, "KEEP");
assert.equal(history.data.decision, "MAYBE");

console.log(
  "Local Supabase integration passed: ownership RLS and review transaction verified.",
);
