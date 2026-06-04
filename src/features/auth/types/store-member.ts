export const STORE_ROLES = ["owner", "manager", "cashier"] as const;
export type StoreRole = (typeof STORE_ROLES)[number];
export const MEMBER_STATUSES = [
    "idle",
    "pending",
    "active",
    "rejected",
] as const;
export type MemberStatus = (typeof MEMBER_STATUSES)[number];
