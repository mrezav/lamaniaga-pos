"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                setError("Email atau password salah")
            } else {
                router.push("/dashboard")
                router.refresh()
            }
        } catch (err) {
            setError("Gagal menghubungi server")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Selamat Datang</h1>
                <p className="text-slate-500 mt-2">Masuk ke akun Anda untuk mengelola toko</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg animate-in fade-in slide-in-from-top-1">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Email</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50/50"
                        placeholder="john@example.com"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Password</label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50/50"
                        placeholder="••••••••"
                    />
                </div>

                <Button type="submit" className="w-full h-11 text-base font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Masuk Sekarang"}
                </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-600">
                    Belum punya akun?{" "}
                    <Link href="/register" className="text-blue-600 font-semibold hover:underline decoration-2 underline-offset-4">
                        Daftar di sini
                    </Link>
                </p>
            </div>
        </div>
    )
}
