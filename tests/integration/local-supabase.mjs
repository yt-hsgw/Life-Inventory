import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

function readLocalValue(output, key) {
  return output.match(new RegExp(`^${key}="([^"]+)"$`, "m"))?.[1];
}

function executeLocalSql(sql) {
  return execFileSync("npx", ["supabase", "db", "query", "--local", sql], {
    encoding: "utf8",
  });
}

let url = process.env.SUPABASE_TEST_URL;
let publishableKey = process.env.SUPABASE_TEST_PUBLISHABLE_KEY;
let serviceRoleKey = process.env.SUPABASE_TEST_SERVICE_ROLE_KEY;

if (!url || !publishableKey || !serviceRoleKey) {
  try {
    const output = execFileSync("npx", ["supabase", "status", "-o", "env"], {
      encoding: "utf8",
    });
    url ??= readLocalValue(output, "API_URL");
    publishableKey ??= readLocalValue(output, "PUBLISHABLE_KEY");
    serviceRoleKey ??= readLocalValue(output, "SERVICE_ROLE_KEY");
  } catch {
    // The actionable error below is clearer than the CLI's container details.
  }
}

if (!url || !publishableKey || !serviceRoleKey) {
  throw new Error(
    "Run `npm run supabase:start` or set the SUPABASE_TEST_URL, SUPABASE_TEST_PUBLISHABLE_KEY, and SUPABASE_TEST_SERVICE_ROLE_KEY variables.",
  );
}

const admin = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

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
const quotaOwner = await createTestUser("quota-owner");

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

const photoDraftIds = [randomUUID(), randomUUID()];
const photoPaths = photoDraftIds.map(
  (draftId) => `${owner.userId}/drafts/${draftId}.png`,
);
for (const photoPath of photoPaths) {
  const deniedUpload = await owner.client.storage
    .from("item-photos")
    .upload(
      `${owner.userId}/drafts/${randomUUID()}.png`,
      new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      { contentType: "image/png", upsert: false },
    );
  assert.ok(deniedUpload.error);

  const upload = await admin.storage
    .from("item-photos")
    .upload(
      photoPath,
      new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      { contentType: "image/png", upsert: false },
    );
  assert.ifError(upload.error);
}

const deniedPhotoDraftInsert = await owner.client
  .from("item_photo_drafts")
  .insert(
    photoDraftIds.map((draftId, index) => ({
      id: draftId,
      user_id: owner.userId,
      storage_path: photoPaths[index],
      content_type: "image/png",
      size_bytes: 8,
    })),
  );
assert.ok(deniedPhotoDraftInsert.error);

for (let index = 0; index < photoDraftIds.length; index += 1) {
  const createdDraft = await owner.client.rpc("create_item_photo_draft", {
    p_storage_path: photoPaths[index],
    p_content_type: "image/png",
    p_size_bytes: 8,
  });
  assert.ifError(createdDraft.error);
  photoDraftIds[index] = createdDraft.data.id;
}

const analysisClaim = await owner.client.rpc(
  "claim_item_photo_draft_analysis",
  { p_draft_id: photoDraftIds[0] },
);
assert.ifError(analysisClaim.error);
assert.equal(analysisClaim.data[0].analysis_status, "processing");
assert.equal(analysisClaim.data[0].attempt_no, 1);
assert.ok(analysisClaim.data[0].claim_token);

const duplicateAnalysisClaim = await owner.client.rpc(
  "claim_item_photo_draft_analysis",
  { p_draft_id: photoDraftIds[0] },
);
assert.ifError(duplicateAnalysisClaim.error);
assert.equal(duplicateAnalysisClaim.data[0].analysis_status, "processing");
assert.equal(duplicateAnalysisClaim.data[0].claim_token, null);
assert.equal(duplicateAnalysisClaim.data[0].attempt_no, 1);

const processingPhotoItem = await owner.client.rpc(
  "create_item_with_photo_drafts",
  {
    p_name: "Must reject processing photo",
    p_category_id: categoryResult.data.id,
    p_quantity: 1,
    p_photo_draft_ids: [photoDraftIds[0]],
  },
);
assert.ok(processingPhotoItem.error);

const forgedAnalysis = await owner.client.rpc(
  "complete_item_photo_draft_analysis",
  {
    p_draft_id: photoDraftIds[0],
    p_claim_token: analysisClaim.data[0].claim_token,
    p_analysis: { itemName: "forged" },
  },
);
assert.ok(forgedAnalysis.error);

const completedAnalysis = await admin.rpc(
  "complete_item_photo_draft_analysis",
  {
    p_draft_id: photoDraftIds[0],
    p_claim_token: analysisClaim.data[0].claim_token,
    p_analysis: { itemName: "Photo item" },
  },
);
assert.ifError(completedAnalysis.error);
assert.equal(completedAnalysis.data.analysis_status, "completed");

const deniedDraftUpdate = await owner.client
  .from("item_photo_drafts")
  .update({ analysis: { itemName: "forged" } })
  .eq("id", photoDraftIds[0]);
assert.ok(deniedDraftUpdate.error);

const photoItem = await owner.client.rpc("create_item_with_photo_drafts", {
  p_name: "Photo item",
  p_category_id: categoryResult.data.id,
  p_quantity: 1,
  p_photo_draft_ids: [photoDraftIds[1], photoDraftIds[0]],
});
assert.ifError(photoItem.error);

const photoRows = await owner.client
  .from("item_photos")
  .select("storage_path,display_order")
  .eq("item_id", photoItem.data.id)
  .order("display_order");
assert.ifError(photoRows.error);
assert.deepEqual(photoRows.data, [
  { storage_path: photoPaths[1], display_order: 0 },
  { storage_path: photoPaths[0], display_order: 1 },
]);

const consumedDrafts = await owner.client
  .from("item_photo_drafts")
  .select("consumed_item_id")
  .in("id", photoDraftIds);
assert.ifError(consumedDrafts.error);
assert.equal(
  consumedDrafts.data.every(
    (draft) => draft.consumed_item_id === photoItem.data.id,
  ),
  true,
);

const strangerPhotoRead = await stranger.client
  .from("item_photos")
  .select("id")
  .eq("item_id", photoItem.data.id);
assert.ifError(strangerPhotoRead.error);
assert.equal(strangerPhotoRead.data.length, 0);

const deniedPhotoDelete = await owner.client
  .from("item_photos")
  .delete()
  .eq("item_id", photoItem.data.id);
assert.ok(deniedPhotoDelete.error);

const deniedStorageDelete = await owner.client.storage
  .from("item-photos")
  .remove([photoPaths[0]]);
assert.ifError(deniedStorageDelete.error);
assert.deepEqual(deniedStorageDelete.data, []);
const photoStillExists = await admin.storage
  .from("item-photos")
  .download(photoPaths[0]);
assert.ifError(photoStillExists.error);

const strangerSignedUrl = await stranger.client.storage
  .from("item-photos")
  .createSignedUrl(photoPaths[0], 60);
assert.ok(strangerSignedUrl.error);

const retryObjectPath = `${owner.userId}/drafts/${randomUUID()}.png`;
const retryUpload = await admin.storage
  .from("item-photos")
  .upload(
    retryObjectPath,
    new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    { contentType: "image/png", upsert: false },
  );
assert.ifError(retryUpload.error);
const retryDraft = await owner.client.rpc("create_item_photo_draft", {
  p_storage_path: retryObjectPath,
  p_content_type: "image/png",
  p_size_bytes: 8,
});
assert.ifError(retryDraft.error);
const firstRetryClaim = await owner.client.rpc(
  "claim_item_photo_draft_analysis",
  { p_draft_id: retryDraft.data.id },
);
assert.ifError(firstRetryClaim.error);
const firstFailure = await admin.rpc("fail_item_photo_draft_analysis", {
  p_draft_id: retryDraft.data.id,
  p_claim_token: firstRetryClaim.data[0].claim_token,
});
assert.ifError(firstFailure.error);
assert.equal(firstFailure.data.analysis_status, "pending");
const secondRetryClaim = await owner.client.rpc(
  "claim_item_photo_draft_analysis",
  { p_draft_id: retryDraft.data.id },
);
assert.ifError(secondRetryClaim.error);
assert.equal(secondRetryClaim.data[0].attempt_no, 2);
const secondFailure = await admin.rpc("fail_item_photo_draft_analysis", {
  p_draft_id: retryDraft.data.id,
  p_claim_token: secondRetryClaim.data[0].claim_token,
});
assert.ifError(secondFailure.error);
assert.equal(secondFailure.data.analysis_status, "failed");
const exhaustedClaim = await owner.client.rpc(
  "claim_item_photo_draft_analysis",
  { p_draft_id: retryDraft.data.id },
);
assert.ifError(exhaustedClaim.error);
assert.equal(exhaustedClaim.data[0].analysis_status, "failed");
assert.equal(exhaustedClaim.data[0].claim_token, null);

const staleObjectPath = `${owner.userId}/drafts/${randomUUID()}.png`;
const staleUpload = await admin.storage
  .from("item-photos")
  .upload(
    staleObjectPath,
    new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    { contentType: "image/png", upsert: false },
  );
assert.ifError(staleUpload.error);
const staleDraft = await owner.client.rpc("create_item_photo_draft", {
  p_storage_path: staleObjectPath,
  p_content_type: "image/png",
  p_size_bytes: 8,
});
assert.ifError(staleDraft.error);
const staleClaim = await owner.client.rpc("claim_item_photo_draft_analysis", {
  p_draft_id: staleDraft.data.id,
});
assert.ifError(staleClaim.error);
const processingDeletion = await owner.client.rpc(
  "queue_item_photo_draft_deletion",
  { p_draft_id: staleDraft.data.id },
);
assert.ok(processingDeletion.error);
assert.match(processingDeletion.error.message, /still processing/i);
const ageStaleClaim = await admin
  .from("item_photo_drafts")
  .update({ analysis_claimed_at: "2000-01-01T00:00:00.000Z" })
  .eq("id", staleDraft.data.id);
assert.ifError(ageStaleClaim.error);
const recoveredClaim = await owner.client.rpc(
  "claim_item_photo_draft_analysis",
  { p_draft_id: staleDraft.data.id },
);
assert.ifError(recoveredClaim.error);
assert.equal(recoveredClaim.data[0].attempt_no, 2);
assert.notEqual(
  recoveredClaim.data[0].claim_token,
  staleClaim.data[0].claim_token,
);

// Five attempts were recorded above. Fifteen further claims reach the
// rolling-hour limit; the next one must fail without incrementing a draft.
for (let index = 0; index < 16; index += 1) {
  const quotaPath = `${owner.userId}/drafts/${randomUUID()}.png`;
  const quotaUpload = await admin.storage
    .from("item-photos")
    .upload(
      quotaPath,
      new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      { contentType: "image/png", upsert: false },
    );
  assert.ifError(quotaUpload.error);
  const quotaDraft = await owner.client.rpc("create_item_photo_draft", {
    p_storage_path: quotaPath,
    p_content_type: "image/png",
    p_size_bytes: 8,
  });
  assert.ifError(quotaDraft.error);
  const quotaClaim = await owner.client.rpc("claim_item_photo_draft_analysis", {
    p_draft_id: quotaDraft.data.id,
  });
  if (index < 15) {
    assert.ifError(quotaClaim.error);
    assert.equal(quotaClaim.data[0].attempt_no, 1);
  } else {
    assert.ok(quotaClaim.error);
    assert.match(quotaClaim.error.message, /hourly limit/i);
  }
}

const expiredObjectPath = `${stranger.userId}/drafts/${randomUUID()}.png`;
const expiredUpload = await admin.storage
  .from("item-photos")
  .upload(
    expiredObjectPath,
    new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    { contentType: "image/png", upsert: false },
  );
assert.ifError(expiredUpload.error);
const expiredDraft = await stranger.client.rpc("create_item_photo_draft", {
  p_storage_path: expiredObjectPath,
  p_content_type: "image/png",
  p_size_bytes: 8,
});
assert.ifError(expiredDraft.error);
const ageExpiredDraft = await admin
  .from("item_photo_drafts")
  .update({ created_at: "2000-01-01T00:00:00.000Z" })
  .eq("id", expiredDraft.data.id);
assert.ifError(ageExpiredDraft.error);
const deniedCleanup = await owner.client.rpc(
  "queue_expired_item_photo_drafts",
  { p_limit: 50 },
);
assert.ok(deniedCleanup.error);
const expiredQueue = await admin.rpc("queue_expired_item_photo_drafts", {
  p_limit: 50,
});
assert.ifError(expiredQueue.error);
assert.equal(
  expiredQueue.data.some((entry) => entry.storage_path === expiredObjectPath),
  true,
);
const removeExpiredObject = await admin.storage
  .from("item-photos")
  .remove([expiredObjectPath]);
assert.ifError(removeExpiredObject.error);
const completeExpiredDeletion = await admin.rpc(
  "complete_item_photo_deletion",
  { p_storage_path: expiredObjectPath },
);
assert.ifError(completeExpiredDeletion.error);
assert.equal(completeExpiredDeletion.data, true);

const queuedDeletion = await owner.client.rpc(
  "queue_item_photo_draft_deletion",
  { p_draft_id: retryDraft.data.id },
);
assert.ifError(queuedDeletion.error);
assert.deepEqual(queuedDeletion.data, [{ storage_path: retryObjectPath }]);
const removedQueuedObject = await admin.storage
  .from("item-photos")
  .remove([retryObjectPath]);
assert.ifError(removedQueuedObject.error);
const completedDeletion = await admin.rpc("complete_item_photo_deletion", {
  p_storage_path: retryObjectPath,
});
assert.ifError(completedDeletion.error);
assert.equal(completedDeletion.data, true);

const quotaCategory = await quotaOwner.client
  .from("categories")
  .insert({ user_id: quotaOwner.userId, name: "Quota category", sort_order: 0 })
  .select("id")
  .single();
assert.ifError(quotaCategory.error);

// Build the quota boundary as a direct postgres fixture. Runtime clients still
// cannot perform these writes; the tests above verify those grants separately.
executeLocalSql(`
  insert into public.items (user_id, category_id, name, quantity)
  select
    '${quotaOwner.userId}'::uuid,
    '${quotaCategory.data.id}'::uuid,
    'Quota item ' || series.item_no,
    1
  from generate_series(1, 50) as series(item_no);
`);
executeLocalSql(`
  insert into storage.objects (bucket_id, name, owner, metadata)
  select
    'item-photos',
    '${quotaOwner.userId}/quota/' || series.photo_no || '.png',
    '${quotaOwner.userId}'::uuid,
    jsonb_build_object('mimetype', 'image/png', 'size', 8)
  from generate_series(1, 500) as series(photo_no);
`);
executeLocalSql(`
  with numbered_items as (
    select id, row_number() over (order by id) as item_no
    from public.items
    where user_id = '${quotaOwner.userId}'::uuid
      and name like 'Quota item %'
  )
  insert into public.item_photos (
    user_id,
    item_id,
    storage_path,
    content_type,
    size_bytes,
    display_order
  )
  select
    '${quotaOwner.userId}'::uuid,
    numbered_items.id,
    '${quotaOwner.userId}/quota/' ||
      (((numbered_items.item_no - 1) * 10) + positions.display_order + 1) ||
      '.png',
    'image/png',
    8,
    positions.display_order
  from numbered_items
  cross join generate_series(0, 9) as positions(display_order);
`);

const overQuotaPath = `${quotaOwner.userId}/drafts/${randomUUID()}.png`;
const overQuotaUpload = await admin.storage
  .from("item-photos")
  .upload(
    overQuotaPath,
    new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    { contentType: "image/png", upsert: false },
  );
assert.ifError(overQuotaUpload.error);
const overQuotaDraft = await quotaOwner.client.rpc("create_item_photo_draft", {
  p_storage_path: overQuotaPath,
  p_content_type: "image/png",
  p_size_bytes: 8,
});
assert.ok(overQuotaDraft.error);
assert.match(overQuotaDraft.error.message, /storage limit/i);

console.log(
  "Local Supabase integration passed: ownership RLS, review invariants, Ideal uniqueness, private item photos, RPC-only mutations, analysis claims, and deletion queue verified.",
);
