ALTER TABLE "product_variants" ADD COLUMN "unit" text DEFAULT 'pcs' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "merk" text NOT NULL;