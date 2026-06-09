ALTER TABLE "categories" DROP CONSTRAINT "categories_slug_key";--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_slug_key";--> statement-breakpoint
ALTER TABLE "stores" DROP CONSTRAINT "stores_owner_id_fkey";
--> statement-breakpoint
DROP INDEX "stores_owner_id_idx";--> statement-breakpoint
DROP INDEX "product_variants_store_id_idx";--> statement-breakpoint
DROP INDEX "product_variants_product_id_idx";--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "modified_by" uuid;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "modified_by" uuid;--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "modified_by" uuid;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "modified_by" uuid;--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_modified_by_users_id_fk" FOREIGN KEY ("modified_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_modified_by_users_id_fk" FOREIGN KEY ("modified_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_modified_by_users_id_fk" FOREIGN KEY ("modified_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_modified_by_users_id_fk" FOREIGN KEY ("modified_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "product_variants_store_id_idx" ON "product_variants" USING btree ("store_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "product_variants_product_id_idx" ON "product_variants" USING btree ("product_id" uuid_ops);--> statement-breakpoint
ALTER TABLE "stores" DROP COLUMN "owner_id";--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_slug_key" UNIQUE("store_id","slug");--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_slug_key" UNIQUE("store_id","slug");--> statement-breakpoint
ALTER POLICY "Manage own store" ON "stores" TO public USING (exists (
                select 1 from store_members 
                where store_members.store_id = id 
                and store_members.user_id = auth.uid() 
                and store_members.role IN ('owner', 'manager')
            )) WITH CHECK (exists (
                select 1 from store_members 
                where store_members.store_id = id 
                and store_members.user_id = auth.uid() 
                and store_members.role IN ('owner', 'manager')
            ));--> statement-breakpoint
ALTER POLICY "Manage own variants" ON "product_variants" TO public USING (store_id IN (SELECT owned_store_ids()));--> statement-breakpoint
ALTER POLICY "Manage own products" ON "products" TO public USING (store_id IN (SELECT owned_store_ids()));--> statement-breakpoint
ALTER POLICY "Owners can insert store members" ON "store_members" TO public WITH CHECK (exists (
                select 1 from store_members 
                where store_members.store_id = store_id 
                and store_members.user_id = auth.uid() 
                and store_members.role = 'owner'
            ));--> statement-breakpoint
ALTER POLICY "Owners can update store members" ON "store_members" TO public USING (exists (
                select 1 from store_members 
                where store_members.store_id = store_id 
                and store_members.user_id = auth.uid() 
                and store_members.role = 'owner'
            ));--> statement-breakpoint
ALTER POLICY "Owners can delete store members" ON "store_members" TO public USING (exists (
                select 1 from store_members 
                where store_members.store_id = store_id 
                and store_members.user_id = auth.uid() 
                and store_members.role = 'owner'
            ));