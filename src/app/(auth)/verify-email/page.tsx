import { Mail } from "lucide-react"

export default function VerifyEmailPage() {
    return (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100 text-center">
            <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                <Mail className="w-8 h-8" />
            </div>
            
            <h1 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Cek Email Anda</h1>
            <p className="text-slate-600 leading-relaxed mb-8">
                Pendaftaran berhasil! Silakan periksa kotak masuk email Anda dan klik tautan verifikasi untuk melanjutkan.
            </p>
            
            <div className="pt-6 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                    Tidak menerima email? Periksa folder spam atau{" "}
                    <button className="text-blue-600 font-semibold hover:underline decoration-2 underline-offset-4">kirim ulang</button>
                </p>
            </div>
        </div>
    )
}
