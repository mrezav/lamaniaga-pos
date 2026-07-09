import React from "react";

// Definisikan tipe preset yang tersedia
export type DatePreset =
    | "today"
    | "yesterday"
    | "this_week"
    | "this_month"
    | "this_year"
    | "all";

export function DatePresetFilters({
    activePreset,
    setActivePreset,
    setPage,
}: {
    activePreset: DatePreset;
    setActivePreset: (preset: DatePreset) => void;
    setPage: (page: number) => void;
}) {
    const presets: { value: DatePreset; label: string }[] = [
        { value: "today", label: "Hari Ini" },
        { value: "yesterday", label: "Kemarin" },
        { value: "this_week", label: "Minggu Ini" },
        { value: "this_month", label: "Bulan Ini" },
        { value: "this_year", label: "Tahun Ini" },
        { value: "all", label: "Semua" },
    ];

    const handleSelect = (preset: DatePreset) => {
        setActivePreset(preset);
        setPage(1); // Reset halaman ke 1 setiap kali filter berubah
    };

    return (
        /* flex-nowrap + overflow-x-auto membuat menu bisa di-swipe horizontal jika layar sangat kecil */
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            {presets.map((preset) => {
                const isActive = activePreset === preset.value;
                return (
                    <button
                        key={preset.value}
                        onClick={() => handleSelect(preset.value)}
                        className={`
              whitespace-nowrap px-4 py-2 text-xs font-medium rounded-full transition-all duration-200
              ${
                  isActive
                      ? "bg-slate-900 text-white shadow-sm dark:bg-slate-50 dark:text-slate-900"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 active:scale-95"
              }
            `}
                    >
                        {preset.label}
                    </button>
                );
            })}
        </div>
    );
}
