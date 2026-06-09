import { relations } from "drizzle-orm/relations";
import { stores, categories, products, productVariants, usersInAuth, profiles, storeMembers } from "./schema";

export const categoriesRelations = relations(categories, ({one, many}) => ({
	store: one(stores, {
		fields: [categories.storeId],
		references: [stores.id]
	}),
	products: many(products),
}));

export const storesRelations = relations(stores, ({one, many}) => ({
	categories: many(categories),
	productVariants: many(productVariants),
	products: many(products),
	profiles: many(profiles),
	storeMembers: many(storeMembers),
	usersInAuth: one(usersInAuth, {
		fields: [stores.ownerId],
		references: [usersInAuth.id]
	}),
}));

export const productVariantsRelations = relations(productVariants, ({one}) => ({
	product: one(products, {
		fields: [productVariants.productId],
		references: [products.id]
	}),
	store: one(stores, {
		fields: [productVariants.storeId],
		references: [stores.id]
	}),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	productVariants: many(productVariants),
	category: one(categories, {
		fields: [products.categoryId],
		references: [categories.id]
	}),
	store: one(stores, {
		fields: [products.storeId],
		references: [stores.id]
	}),
}));

export const profilesRelations = relations(profiles, ({one}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [profiles.id],
		references: [usersInAuth.id]
	}),
	store: one(stores, {
		fields: [profiles.lastActiveStoreId],
		references: [stores.id]
	}),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	profiles: many(profiles),
	storeMembers: many(storeMembers),
	stores: many(stores),
}));

export const storeMembersRelations = relations(storeMembers, ({one}) => ({
	store: one(stores, {
		fields: [storeMembers.storeId],
		references: [stores.id]
	}),
	usersInAuth: one(usersInAuth, {
		fields: [storeMembers.userId],
		references: [usersInAuth.id]
	}),
}));