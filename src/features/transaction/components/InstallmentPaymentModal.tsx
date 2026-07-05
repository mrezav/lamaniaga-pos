"use client";

import React, { useEffect, useState } from "react";
import { X, DollarSign, CreditCard, Wallet, Calendar } from "lucide-react"; // Menggunakan Lucide Icon
import { PaymentMethod } from "@/db/schema";
import { formatIDR } from "@/utils";
import { toast } from "sonner";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    remainingBill: number; // Sisa tagihan dari data transaksi
    onSubmitPayment: (amount: number, method: string, note: string) => void;
}

export default function InstallmentPaymentModal({
    isOpen,
    onClose,
    remainingBill,
    onSubmitPayment,
}: PaymentModalProps) {
    const [paymentAmount, setPaymentAmount] = useState<string>("");
    const [paymentMethod, setPaymentMethod] = useState<string>(
        PaymentMethod.CASH,
    );
    const [note, setNote] = useState<string>("");

    if (!isOpen) return null;

    // Handler auto-fill sisa tagihan jika kasir ingin bayar lunas
    const handlePayInFull = () => {
        setPaymentAmount(remainingBill.toString());
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseInt(paymentAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Jumlah pembayaran tidak valid");

            return;
        }
        if (amount > remainingBill) {
            toast.error("Jumlah pembayaran melebihi sisa tagihan!");

            return;
        }
        onSubmitPayment(amount, paymentMethod, note);
    };

    const currentRemaining = remainingBill - (parseInt(paymentAmount) || 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            {/* Container Modal */}
            <div className="w-full max-w-lg overflow-hidden bg-white rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">
                            Input Pembayaran Cicilan
                        </h3>
                        <p className="text-xs text-gray-500">
                            Catat pembayaran baru untuk transaksi ini
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Ringkasan Saldo (Info Panel) */}
                <div className="p-6 bg-slate-50 border-b border-gray-100 grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                        <span className="text-xs font-medium text-gray-500 block mb-1">
                            Total Sisa Tagihan
                        </span>
                        <span className="text-base font-bold text-red-600">
                            {formatIDR(remainingBill)}
                        </span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                        <span className="text-xs font-medium text-gray-500 block mb-1">
                            Sisa Setelah Bayar
                        </span>
                        <span
                            className={`text-base font-bold ${currentRemaining < 0 ? "text-rose-500" : "text-slate-700"}`}
                        >
                            {formatIDR(
                                currentRemaining < 0 ? 0 : currentRemaining,
                            )}
                        </span>
                    </div>
                </div>

                {/* Form Input */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Input Jumlah Bayar */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Jumlah Pembayaran{" "}
                            <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative rounded-xl shadow-sm">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <span className="text-gray-500 font-medium text-sm">
                                    Rp
                                </span>
                            </div>
                            <input
                                type="number"
                                required
                                placeholder="0"
                                value={paymentAmount}
                                onChange={(e) =>
                                    setPaymentAmount(e.target.value)
                                }
                                className="w-full py-3 pl-11 pr-24 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-semibold text-lg text-gray-900 placeholder-gray-400"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                                <button
                                    type="button"
                                    onClick={handlePayInFull}
                                    className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                                >
                                    Bayar Lunas
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Metode Pembayaran (Radio Card grid) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Metode Pembayaran
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                {
                                    id: PaymentMethod.CASH,
                                    label: "Tunai",
                                    icon: Wallet,
                                },
                                {
                                    id: PaymentMethod.TRANSFER,
                                    label: "Transfer",
                                    icon: CreditCard,
                                },
                                {
                                    id: PaymentMethod.QRIS,
                                    label: "QRIS",
                                    icon: DollarSign,
                                },
                            ].map((method) => {
                                const Icon = method.icon;
                                const isSelected = paymentMethod === method.id;
                                return (
                                    <label
                                        key={method.id}
                                        className={`flex flex-col items-center justify-center p-3 border rounded-xl cursor-pointer transition select-none ${
                                            isSelected
                                                ? "border-indigo-600 bg-indigo-50/50 text-indigo-600 font-medium"
                                                : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value={method.id}
                                            checked={isSelected}
                                            onChange={() =>
                                                setPaymentMethod(method.id)
                                            }
                                            className="sr-only"
                                        />
                                        <Icon className="w-5 h-5 mb-1" />
                                        <span className="text-xs">
                                            {method.label}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Catatan Tambahan */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Catatan{" "}
                            <span className="text-gray-400 font-normal">
                                (Opsional)
                            </span>
                        </label>
                        <textarea
                            rows={2}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Contoh: Cicilan ke-2, dititip ke Sales Ahmad"
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400"
                        />
                    </div>

                    {/* Tombol Aksi */}
                    <div className="flex gap-3 pt-2 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition"
                        >
                            Simpan Pembayaran
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
