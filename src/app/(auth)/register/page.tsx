"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRegister } from "@/features/auth/hooks";
import { useForm } from "react-hook-form";
import { RegisterInput } from "@/features/auth/types";

export default function RegisterPage() {
    const router = useRouter();
    const registerMutation = useRegister();

    const form = useForm<RegisterInput>({
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
        },
    });

    async function handleRegister(data: RegisterInput) {
        form.clearErrors();

        try {
            const result = await registerMutation.mutateAsync(data);
            if (!result.success && result.validationErrors) {
                Object.entries(result.validationErrors).forEach(
                    ([field, errors]) => {
                        if (!errors?.[0]) return;

                        form.setError(field as keyof RegisterInput, {
                            message: errors[0],
                        });
                    },
                );
                return;
            }
            router.push("/verify-email");
        } catch (error) {
            console.error(error);
            // ERROR INTERNAL SISTEM AKAN TERTANGKAP DI SINI
            // Kita biarkan CATCH ini kosong karena toast error-nya
            // sudah ditangani secara global oleh callback `onError` di custom hook.
            // Tujuannya di sini hanya agar aplikasi TIDAK CRASH.
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Buat Akun
                </h1>
                <p className="text-slate-500 mt-2">
                    Daftar untuk mulai mengelola toko Anda
                </p>
            </div>

            <form
                onSubmit={form.handleSubmit(handleRegister)}
                className="space-y-6"
            >
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                        Nama Lengkap
                    </label>
                    <input
                        type="text"
                        {...form.register("fullName")}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50/50"
                        placeholder="John Doe"
                    />
                    {form.formState.errors.fullName && (
                        <p className="text-sm text-red-500">
                            {form.formState.errors.fullName?.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                        Email
                    </label>
                    <input
                        type="email"
                        {...form.register("email")}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50/50"
                        placeholder="john@example.com"
                    />
                    {form.formState.errors.email && (
                        <p className="text-sm text-red-500">
                            {form.formState.errors.email?.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                        Password
                    </label>
                    <input
                        type="password"
                        {...form.register("password")}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50/50"
                        placeholder="••••••••"
                    />
                    {form.formState.errors.password && (
                        <p className="text-sm text-red-500">
                            {form.formState.errors.password?.message}
                        </p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full h-11 text-base font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors"
                    disabled={form.formState.isSubmitting}
                >
                    {form.formState.isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        "Daftar Sekarang"
                    )}
                </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-600">
                    Sudah punya akun?{" "}
                    <Link
                        href="/login"
                        className="text-blue-600 font-semibold hover:underline decoration-2 underline-offset-4"
                    >
                        Login di sini
                    </Link>
                </p>
            </div>
        </div>
    );
}
