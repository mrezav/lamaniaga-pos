"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function RegisterPage() {
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        // Client-side validation
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            setError("Password minimal 8 karakter, terdiri dari huruf dan angka")
            setLoading(false)
            return
        }

        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ full_name: fullName, email, password }),
            })

            const result = await res.json()

            if (!res.ok) {
                setError(result.error || "Terjadi kesalahan")
            } else {
                router.push("/verify-email")
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
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Buat Akun</h1>
                <p className="text-slate-500 mt-2">Daftar untuk mulai mengelola toko Anda</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg animate-in fade-in slide-in-from-top-1">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Nama Lengkap</label>
                    <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50/50"
                        placeholder="John Doe"
                    />
                </div>

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
                    <p className="text-xs text-slate-400">Min. 8 karakter, kombinasi huruf & angka</p>
                </div>

                <Button type="submit" className="w-full h-11 text-base font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Daftar Sekarang"}
                </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-600">
                    Sudah punya akun?{" "}
                    <Link href="/login" className="text-blue-600 font-semibold hover:underline decoration-2 underline-offset-4">
                        Login di sini
                    </Link>
                </p>
            </div>
        </div>
    )
}
