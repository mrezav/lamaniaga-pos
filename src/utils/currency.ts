export function formatCurrency(amount: string, local: string) {
    return Number(amount).toLocaleString(local);
}

export const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(num);
};
