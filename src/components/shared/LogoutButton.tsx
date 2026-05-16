"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useState } from "react"

export function LogoutButton() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)

    const handleLogout = async () => {
        setLoading(true)
        try {
            await supabase.auth.signOut()
            router.refresh()
            router.push("/login")
        } catch (error) {
            console.error("Error signing out:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout} 
            disabled={loading}
            className="text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors gap-2"
        >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
        </Button>
    )
}
