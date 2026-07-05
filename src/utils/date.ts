// src/utils/date.ts
export type DatePreset =
    | "today"
    | "yesterday"
    | "this_week"
    | "this_month"
    | "this_year"
    | "all";

export function getPresetDateRange(preset: DatePreset) {
    if (preset === "all") {
        return {
            startDate: "",
            endDate: "",
        };
    }

    const start = new Date();
    const end = new Date();

    switch (preset) {
        case "today":
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            break;
        case "yesterday":
            start.setDate(start.getDate() - 1);
            start.setHours(0, 0, 0, 0);
            end.setDate(end.getDate() - 1);
            end.setHours(23, 59, 59, 999);
            break;
        case "this_week":
            const day = start.getDay();
            const diff = start.getDate() - day + (day === 0 ? -6 : 1);
            start.setDate(diff);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            break;
        case "this_month":
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            break;
        case "this_year": // <-- Tambahkan logika ini
            start.setMonth(0, 1); // Bulan 0 (Januari), Tanggal 1
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999); // Sampai detik ini di akhir hari
            break;
    }

    return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
    };
}

export const formatters = {
    date: new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
    }),

    dateTime: new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
    }),

    shortDate: new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }),

    time: new Intl.DateTimeFormat("id-ID", {
        timeStyle: "short",
    }),
};

export function formatDate(
    value: string | null | undefined,
    formatter: Intl.DateTimeFormat,
) {
    if (!value) return "";

    return formatter.format(new Date(value));
}
