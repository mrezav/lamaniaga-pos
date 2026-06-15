"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useLogin } from "@/features/auth/hooks/use-login";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { LoginInput } from "@/features/auth/types";

export default function LoginPage() {
    const router = useRouter();
    const loginMutation = useLogin();

    const form = useForm<LoginInput>({
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function handleLogin(data: LoginInput) {
        form.clearErrors();

        try {
            const result = await loginMutation.mutateAsync(data);
            if (!result.success && result.validationErrors) {
                Object.entries(result.validationErrors).forEach(
                    ([field, errors]) => {
                        if (!errors?.[0]) return;

                        form.setError(field as keyof LoginInput, {
                            message: errors[0],
                        });
                    },
                );
                return;
            }
            router.push("/stores");
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Selamat Datang
                </h1>
                <p className="text-slate-500 mt-2">
                    Masuk ke akun Anda untuk mengelola toko
                </p>
            </div>

            <form
                onSubmit={form.handleSubmit(handleLogin)}
                className="space-y-6"
            >
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
                        "Masuk Sekarang"
                    )}
                </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-600">
                    Belum punya akun?{" "}
                    <Link
                        href="/register"
                        className="text-blue-600 font-semibold hover:underline decoration-2 underline-offset-4"
                    >
                        Daftar di sini
                    </Link>
                </p>
            </div>
        </div>
    );
}
