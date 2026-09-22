// Generated contract for the committed migrations. Regenerate with Supabase CLI after schema changes.
// DO NOT EDIT MANUALLY.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ItemStatus = "KEEP" | "MAYBE" | "RELEASE";
export type ExpenseCategory =
  "HOUSING" | "UTILITIES" | "COMMUNICATION" | "SUBSCRIPTION" | "DEBT" | "OTHER";
export type BillingCycle = "MONTHLY" | "YEARLY";
export type IdealPriority = "LOW" | "MEDIUM" | "HIGH";
export type ItemPhotoAnalysisStatus =
  "pending" | "processing" | "completed" | "failed";

type CategoryRow = {
  id: string;
  user_id: string;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};
type SubCategoryRow = {
  id: string;
  user_id: string;
  category_id: string;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};
export type ItemRow = {
  id: string;
  user_id: string;
  category_id: string;
  sub_category_id: string | null;
  name: string;
  quantity: number;
  color: string | null;
  size: string | null;
  purpose: string | null;
  product_url: string | null;
  purchase_price: number | null;
  purchased_at: string | null;
  last_used_at: string | null;
  status: ItemStatus;
  review_requested: boolean;
  memo: string | null;
  archived_at: string | null;
  release_reason: string | null;
  created_at: string;
  updated_at: string;
};
type ItemReviewRow = {
  id: string;
  user_id: string;
  item_id: string;
  previous_status: ItemStatus;
  decision: ItemStatus;
  review_session_id: string | null;
  reviewed_at: string;
  memo: string | null;
};
export type ItemPhotoDraftRow = {
  id: string;
  user_id: string;
  storage_path: string;
  content_type: "image/jpeg" | "image/png" | "image/webp";
  size_bytes: number;
  analysis: Json | null;
  analysis_status: ItemPhotoAnalysisStatus;
  analysis_attempts: number;
  analysis_claim_token: string | null;
  analysis_claimed_at: string | null;
  consumed_item_id: string | null;
  created_at: string;
};
export type ItemPhotoRow = {
  id: string;
  user_id: string;
  item_id: string;
  storage_path: string;
  content_type: "image/jpeg" | "image/png" | "image/webp";
  size_bytes: number;
  analysis: Json | null;
  display_order: number;
  created_at: string;
};
export type IdealItemRow = {
  id: string;
  user_id: string;
  category_id: string;
  sub_category_id: string | null;
  name: string;
  target_quantity: number;
  estimated_price: number | null;
  priority: IdealPriority | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
};
export type ExpenseRow = {
  id: string;
  user_id: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  billing_cycle: BillingCycle;
  billing_month: number | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
};

type Insert<T> = Partial<T> & { user_id: string };
type Update<T> = Partial<Omit<T, "id" | "user_id" | "created_at">>;

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: CategoryRow;
        Insert: Insert<CategoryRow> & { name: string };
        Update: Update<CategoryRow>;
        Relationships: [];
      };
      sub_categories: {
        Row: SubCategoryRow;
        Insert: Insert<SubCategoryRow> & { category_id: string; name: string };
        Update: Update<SubCategoryRow>;
        Relationships: [];
      };
      items: {
        Row: ItemRow;
        Insert: Insert<ItemRow> & {
          category_id: string;
          name: string;
          quantity: number;
        };
        Update: Update<ItemRow>;
        Relationships: [];
      };
      item_reviews: {
        Row: ItemReviewRow;
        Insert: Insert<ItemReviewRow> & {
          item_id: string;
          previous_status: ItemStatus;
          decision: ItemStatus;
        };
        Update: never;
        Relationships: [];
      };
      item_photo_drafts: {
        Row: ItemPhotoDraftRow;
        Insert: never;
        Update: never;
        Relationships: [];
      };
      item_photos: {
        Row: ItemPhotoRow;
        Insert: never;
        Update: never;
        Relationships: [];
      };
      ideal_items: {
        Row: IdealItemRow;
        Insert: Insert<IdealItemRow> & {
          category_id: string;
          name: string;
          target_quantity: number;
        };
        Update: Update<IdealItemRow>;
        Relationships: [];
      };
      expenses: {
        Row: ExpenseRow;
        Insert: Insert<ExpenseRow> & {
          name: string;
          category: ExpenseCategory;
          amount: number;
          billing_cycle: BillingCycle;
        };
        Update: Update<ExpenseRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      claim_item_photo_deletion_queue: {
        Args: { p_limit?: number };
        Returns: Array<{ storage_path: string }>;
      };
      claim_item_photo_draft_analysis: {
        Args: { p_draft_id: string };
        Returns: Array<{
          draft_id: string;
          storage_path: string;
          content_type: ItemPhotoDraftRow["content_type"];
          size_bytes: number;
          analysis: Json | null;
          analysis_status: ItemPhotoAnalysisStatus;
          claim_token: string | null;
          attempt_no: number;
        }>;
      };
      complete_item_photo_deletion: {
        Args: { p_storage_path: string };
        Returns: boolean;
      };
      complete_item_photo_draft_analysis: {
        Args: {
          p_draft_id: string;
          p_claim_token: string;
          p_analysis: Json;
        };
        Returns: ItemPhotoDraftRow;
      };
      create_item_photo_draft: {
        Args: {
          p_storage_path: string;
          p_content_type: string;
          p_size_bytes: number;
        };
        Returns: ItemPhotoDraftRow;
      };
      fail_item_photo_draft_analysis: {
        Args: { p_draft_id: string; p_claim_token: string };
        Returns: ItemPhotoDraftRow;
      };
      queue_expired_item_photo_drafts: {
        Args: { p_limit?: number; p_expired_before?: string };
        Returns: Array<{ storage_path: string }>;
      };
      queue_item_photo_draft_deletion: {
        Args: { p_draft_id: string };
        Returns: Array<{ storage_path: string }>;
      };
      attach_item_photo_drafts: {
        Args: { p_item_id: string; p_photo_draft_ids: string[] };
        Returns: ItemPhotoRow[];
      };
      create_item_with_photo_drafts: {
        Args: {
          p_name: string;
          p_category_id: string;
          p_quantity: number;
          p_photo_draft_ids?: string[];
          p_sub_category_id?: string | null;
          p_color?: string | null;
          p_size?: string | null;
          p_purpose?: string | null;
          p_product_url?: string | null;
          p_purchase_price?: number | null;
          p_purchased_at?: string | null;
          p_last_used_at?: string | null;
          p_status?: string;
          p_review_requested?: boolean;
          p_memo?: string | null;
        };
        Returns: ItemRow;
      };
      get_review_queue: {
        Args: { p_session_id: string; p_limit?: number };
        Returns: ItemRow[];
      };
      get_review_queue_count: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      review_item: {
        Args: {
          p_item_id: string;
          p_decision: string;
          p_session_id: string;
          p_memo?: string | null;
        };
        Returns: ItemReviewRow;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Category = CategoryRow;
export type SubCategory = SubCategoryRow;
