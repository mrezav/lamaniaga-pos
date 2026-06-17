export const PERMISSIONS = {
    category: {
        create: ["owner", "manager"],
        edit: ["owner", "manager"],
        delete: ["owner"],
        view: ["owner", "manager", "cashier"],
    },
    "join-code": {
        create: ["owner", "manager"],
        edit: [],
        delete: [],
        view: ["owner", "manager", "cashier"],
    },
    membership: {
        create: ["owner", "manager"],
        edit: ["owner", "manager"],
        delete: ["owner", "manager"],
        view: ["owner", "manager", "cashier"],
    },
    product: {
        create: ["owner", "manager"],
        edit: ["owner", "manager"],
        delete: ["owner"],
        view: ["owner", "manager", "cashier"],
    },
    store: {
        create: ["owner", "manager"],
        edit: ["owner", "manager"],
        delete: ["owner", "manager"],
        view: ["owner", "manager", "cashier"],
    },
    // Anda bisa menambahkan resource lain (seperti 'product' atau 'supplier') di sini nanti
} as const;

export const UserAction = {
    CREATE: "create",
    EDIT: "edit",
    DELETE: "delete",
    VIEW: "view",
} as const;
export type UserAction = (typeof UserAction)[keyof typeof UserAction];
