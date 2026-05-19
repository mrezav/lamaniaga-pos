CREATE TABLE "store_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"store_id" uuid NOT NULL,
	"role" text DEFAULT 'cashier' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "store_members" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "profiles" RENAME COLUMN "store_id" TO "last_active_store_id";--> statement-breakpoint
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_store_id_fkey";
--> statement-breakpoint
ALTER TABLE "store_members" ADD CONSTRAINT "store_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_members" ADD CONSTRAINT "store_members_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_last_active_store_id_fkey" FOREIGN KEY ("last_active_store_id") REFERENCES "public"."stores"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "role";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "status";--> statement-breakpoint
DROP POLICY "Owners can view their staff" ON "profiles" CASCADE;--> statement-breakpoint
CREATE POLICY "Users can view own memberships" ON "store_members" AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Owners can insert store members" ON "store_members" AS PERMISSIVE FOR INSERT TO public WITH CHECK (exists (
      select 1 from stores 
      where stores.id = store_id and stores.owner_id = auth.uid()
    ));--> statement-breakpoint
CREATE POLICY "Owners can update store members" ON "store_members" AS PERMISSIVE FOR UPDATE TO public USING (exists (
      select 1 from stores 
      where stores.id = store_id and stores.owner_id = auth.uid()
    ));--> statement-breakpoint
CREATE POLICY "Owners can delete store members" ON "store_members" AS PERMISSIVE FOR DELETE TO public USING (exists (
      select 1 from stores 
      where stores.id = store_id and stores.owner_id = auth.uid()
    ));