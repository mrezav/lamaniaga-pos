ALTER TABLE "products" DROP CONSTRAINT "products_slug_key";--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "image_url" text;--> statement-breakpoint
CREATE UNIQUE INDEX "products_store_slug_partial_idx" ON "products" USING btree ("store_id","slug") WHERE deleted_at IS NULL;