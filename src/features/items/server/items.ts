import "server-only";

import { notFound } from "next/navigation";
import { getCategories } from "@/features/categories/server/categories";
import { itemListQuerySchema } from "@/features/items/schemas/item-schema";
import type { ItemPhotoView, ItemView } from "@/features/items/types";
import { requireUserId } from "@/lib/auth";
import type { ItemRow } from "@/types/database.generated";
import { ITEM_PHOTO_BUCKET } from "@/features/items/domain/item-photo";

type AuthContext = Awaited<ReturnType<typeof requireUserId>>;

async function getPhotoMap(
  { supabase, userId }: AuthContext,
  itemIds: string[],
  onlyCover = false,
): Promise<Map<string, ItemPhotoView[]>> {
  if (itemIds.length === 0) return new Map();

  let query = supabase
    .from("item_photos")
    .select(
      "id, item_id, storage_path, display_order, content_type, size_bytes",
    )
    .eq("user_id", userId)
    .in("item_id", itemIds)
    .order("display_order", { ascending: true });
  if (onlyCover) query = query.eq("display_order", 0);
  const { data: photos, error } = await query;
  if (error) throw new Error("持ち物の写真を読み込めませんでした。");
  if (photos.length === 0) return new Map();

  const { data: signedPhotos, error: signedError } = await supabase.storage
    .from(ITEM_PHOTO_BUCKET)
    .createSignedUrls(
      photos.map((photo) => photo.storage_path),
      60 * 60,
    );
  if (signedError || !signedPhotos) {
    throw new Error("持ち物の写真を表示できませんでした。");
  }

  const signedUrlMap = new Map(
    signedPhotos.flatMap((photo) =>
      photo.path && photo.signedUrl ? [[photo.path, photo.signedUrl]] : [],
    ),
  );
  const result = new Map<string, ItemPhotoView[]>();
  photos.forEach((photo) => {
    const url = signedUrlMap.get(photo.storage_path);
    if (!url) return;
    const list = result.get(photo.item_id) ?? [];
    list.push({
      id: photo.id,
      item_id: photo.item_id,
      display_order: photo.display_order,
      content_type: photo.content_type,
      size_bytes: photo.size_bytes,
      url,
    });
    result.set(photo.item_id, list);
  });
  return result;
}

export function attachCategories(
  items: ItemRow[],
  categories: Awaited<ReturnType<typeof getCategories>>,
  photoMap: Map<string, ItemPhotoView[]> = new Map(),
): ItemView[] {
  const categoryMap = new Map(
    categories.map((category) => [category.id, category]),
  );
  const subMap = new Map(
    categories
      .flatMap((category) => category.subCategories)
      .map((sub) => [sub.id, sub]),
  );
  return items.flatMap((item) => {
    const category = categoryMap.get(item.category_id);
    if (!category) return [];
    const subCategory = item.sub_category_id
      ? (subMap.get(item.sub_category_id) ?? null)
      : null;
    const photos = photoMap.get(item.id) ?? [];
    return [
      {
        ...item,
        category: { id: category.id, name: category.name },
        subCategory: subCategory
          ? { id: subCategory.id, name: subCategory.name }
          : null,
        photos,
        coverPhoto: photos[0] ?? null,
      },
    ];
  });
}

export async function getItems(
  input: { q?: string; category?: string; status?: string } = {},
) {
  const filters = itemListQuerySchema.parse(input);
  const authContext = await requireUserId();
  const { supabase, userId } = authContext;
  const categoriesPromise = getCategories(authContext);
  let query = supabase
    .from("items")
    .select("*")
    .eq("user_id", userId)
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(500);
  if (filters.category) query = query.eq("category_id", filters.category);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.q) {
    const safe = filters.q
      .replace(/[(),.:%"'\\]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (safe)
      query = query.or(
        `name.ilike.%${safe}%,memo.ilike.%${safe}%,purpose.ilike.%${safe}%`,
      );
  }
  const [{ data, error }, categories] = await Promise.all([
    query,
    categoriesPromise,
  ]);
  if (error) throw new Error("持ち物を読み込めませんでした。");
  const photoMap = await getPhotoMap(
    authContext,
    data.map((item) => item.id),
    true,
  );
  return {
    items: attachCategories(data, categories, photoMap),
    categories,
    filters,
  };
}

export async function getItem(itemId: string) {
  const authContext = await requireUserId();
  const { supabase, userId } = authContext;
  const [{ data, error }, categories] = await Promise.all([
    supabase
      .from("items")
      .select("*")
      .eq("id", itemId)
      .eq("user_id", userId)
      .is("archived_at", null)
      .maybeSingle(),
    getCategories(authContext),
  ]);
  if (error) throw new Error("持ち物を読み込めませんでした。");
  if (!data) notFound();
  const photoMap = await getPhotoMap(authContext, [data.id]);
  const [item] = attachCategories([data], categories, photoMap);
  if (!item) notFound();
  return { item, categories };
}

export async function getArchivedItems() {
  const authContext = await requireUserId();
  const { supabase, userId } = authContext;
  const [{ data, error }, categories] = await Promise.all([
    supabase
      .from("items")
      .select("*")
      .eq("user_id", userId)
      .not("archived_at", "is", null)
      .order("archived_at", { ascending: false })
      .limit(500),
    getCategories(authContext),
  ]);
  if (error) throw new Error("アーカイブを読み込めませんでした。");
  const photoMap = await getPhotoMap(
    authContext,
    data.map((item) => item.id),
    true,
  );
  return attachCategories(data, categories, photoMap);
}
