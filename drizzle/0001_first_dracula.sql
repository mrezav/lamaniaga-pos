CREATE SCHEMA "auth";
--> statement-breakpoint
CREATE TABLE "auth"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"avatar_url" text,
	"phone_number" text,
	"store_id" uuid,
	"role" text DEFAULT 'cashier',
	"status" text DEFAULT 'idle',
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "stores" ALTER COLUMN "owner_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "phone_number" text;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "banner_url" text;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "join_code" text;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "categories_store_id_idx" ON "categories" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "products_store_id_idx" ON "products" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "products_category_id_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "product_variants_store_id_idx" ON "product_variants" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "product_variants_product_id_idx" ON "product_variants" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "stores_owner_id_idx" ON "stores" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "stores_name_idx" ON "stores" USING btree ("name");--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_join_code_unique" UNIQUE("join_code");--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_price_check" CHECK (price >= 0);--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_stock_check" CHECK (stock >= 0);--> statement-breakpoint
CREATE POLICY "Users can view own profile" ON "profiles" AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = id));--> statement-breakpoint
CREATE POLICY "Owners can view their staff" ON "profiles" AS PERMISSIVE FOR SELECT TO public USING (exists (
            select 1 from stores 
            where stores.id = store_id and stores.owner_id = auth.uid()
        ));--> statement-breakpoint
ALTER POLICY "Manage own categories" ON "categories" TO public USING (store_id IN (SELECT owned_store_ids()));--> statement-breakpoint
ALTER POLICY "Manage own products" ON "products" TO public USING (store_id IN ( SELECT owned_store_ids()));--> statement-breakpoint
ALTER POLICY "Manage own variants" ON "product_variants" TO public USING (store_id IN ( SELECT owned_store_ids()));