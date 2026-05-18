import { LogoutButton } from "@/components/shared/LogoutButton"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/db"
import { profiles } from "@/db/schema"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // Pengecekan profil (self-healing jika profil tidak terbuat di callback)
    let userProfile = null
    try {
        userProfile = await db.query.profiles.findFirst({
            where: eq(profiles.id, user.id)
        })

        if (!userProfile) {
            const fullName = user.user_metadata.full_name || "User"
            const inserted = await db.insert(profiles).values({
                id: user.id,
                fullName: fullName,
                status: "idle",
            }).onConflictDoNothing({ target: profiles.id }).returning()
            
            userProfile = inserted[0] || await db.query.profiles.findFirst({
                where: eq(profiles.id, user.id)
            })
        }
    } catch (error) {
        console.error("Error verifying/creating profile in dashboard layout:", error)
    }

    // If user has a store, bypass the onboarding layout header
    if (userProfile?.storeId) {
        return <>{children}</>
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
            {/* Header / Navbar */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">L</span>
                        </div>
                        <span className="text-xl font-bold text-slate-900 tracking-tight">Lamaniaga POS</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <LogoutButton />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>
        </div>
    )
}
