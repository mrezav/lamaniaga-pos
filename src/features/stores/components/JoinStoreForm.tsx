"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { joinStoreSchema, type JoinStoreInput } from "../schemas/join-schema"
import { submitJoinCodeAction } from "../services/join-actions"
import { useToastStore } from "@/store/useToastStore"
import { Button } from "@/components/ui/button"
import { Users, Loader2 } from "lucide-react"

interface JoinStoreFormProps {
  userId: string
}

export function JoinStoreForm({ userId }: JoinStoreFormProps) {
  const { showToast } = useToastStore()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JoinStoreInput>({
    resolver: zodResolver(joinStoreSchema),
    defaultValues: {
      joinCode: "",
    },
  })

  // TanStack Query Mutation for submitting join code
  const mutation = useMutation({
    mutationFn: async (data: JoinStoreInput) => {
      const result = await submitJoinCodeAction(data.joinCode, userId)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result
    },
    onSuccess: () => {
      showToast(
        "Permintaan terkirim! Silakan hubungi pemilik toko untuk menyetujui pendaftaran Anda.",
        "success"
      )
      reset()
    },
    onError: (error: any) => {
      showToast(error.message || "Gagal mengajukan permintaan gabung.", "error")
    },
  })

  const onSubmit = (data: JoinStoreInput) => {
    mutation.mutate(data)
  }

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-6 hover:shadow-lg transition-all duration-300 group animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <Users className="w-12 h-12" />
      </div>
      
      <div className="space-y-2 w-full">
        <h2 className="text-2xl font-bold text-slate-900">Gabung Toko</h2>
        <p className="text-slate-500 leading-relaxed">
          Gunakan kode akses untuk bergabung dengan toko yang sudah ada.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
        <div className="space-y-1 text-left">
          <input
            type="text"
            id="joinCode"
            disabled={mutation.isPending}
            className={`w-full px-4 h-14 border rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-slate-50/50 text-center font-mono text-lg tracking-widest uppercase ${
              errors.joinCode ? "border-red-500 focus:ring-red-500" : "border-slate-200"
            }`}
            placeholder="KODE-TOKO"
            {...register("joinCode")}
          />
          {errors.joinCode && (
            <p className="text-xs text-red-500 font-semibold px-2">
              {errors.joinCode.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={mutation.isPending}
          variant="secondary"
          className="w-full h-14 text-lg font-bold rounded-2xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none transition-all flex items-center justify-center gap-2"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <span>Bergabung</span>
          )}
        </Button>
      </form>
    </div>
  )
}
