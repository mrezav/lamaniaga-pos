import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Self-healing profile creation in dashboard layout
    try {
        const existingProfile = await db.query.profiles.findFirst({
            where: eq(profiles.id, user.id),
        });

        if (!existingProfile) {
            const fullName = user.user_metadata.full_name || "User";
            await db
                .insert(profiles)
                .values({
                    id: user.id,
                    fullName: fullName,
                })
                .onConflictDoNothing({ target: profiles.id });
        }
    } catch (error) {
        console.error(
            "Error verifying/creating profile in dashboard layout:",
            error,
        );
    }

    return <div className="min-h-screen bg-slate-50 font-sans">{children}</div>;
}
