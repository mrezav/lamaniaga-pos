import { relations } from "drizzle-orm/relations";
import {
    stores,
    categories,
    productVariants,
    products,
    profiles,
    storeMembers,
} from "./schema";
import { users as usersInAuth } from "@/db/schema/users";

export const categoriesRelations = relations(categories, ({ one, many }) => ({
    store: one(stores, {
        fields: [categories.storeId],
        references: [stores.id],
    }),
    products: many(products),
}));

export const storesRelations = relations(stores, ({ one, many }) => ({
    categories: many(categories),
    productVariants: many(productVariants),
    products: many(products),
    profiles: many(profiles),
    storeMembers: many(storeMembers),
    usersInAuth: one(usersInAuth, {
        fields: [stores.modifiedBy],
        references: [usersInAuth.id],
    }),
}));

export const productVariantsRelations = relations(
    productVariants,
    ({ one }) => ({
        usersInAuth: one(usersInAuth, {
            fields: [productVariants.modifiedBy],
            references: [usersInAuth.id],
        }),
        product: one(products, {
            fields: [productVariants.productId],
            references: [products.id],
        }),
        store: one(stores, {
            fields: [productVariants.storeId],
            references: [stores.id],
        }),
    }),
);

export const usersInAuthRelations = relations(usersInAuth, ({ many }) => ({
    productVariants: many(productVariants),
    products: many(products),
    stores: many(stores),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
    productVariants: many(productVariants),
    category: one(categories, {
        fields: [products.categoryId],
        references: [categories.id],
    }),
    usersInAuth: one(usersInAuth, {
        fields: [products.modifiedBy],
        references: [usersInAuth.id],
    }),
    store: one(stores, {
        fields: [products.storeId],
        references: [stores.id],
    }),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
    store: one(stores, {
        fields: [profiles.lastActiveStoreId],
        references: [stores.id],
    }),
}));

export const storeMembersRelations = relations(storeMembers, ({ one }) => ({
    store: one(stores, {
        fields: [storeMembers.storeId],
        references: [stores.id],
    }),
}));
