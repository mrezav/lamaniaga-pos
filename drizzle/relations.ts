import { relations } from "drizzle-orm/relations";
import { stores, categories, products, productVariants, usersInAuth } from "./schema";

export const categoriesRelations = relations(categories, ({one, many}) => ({
	store: one(stores, {
		fields: [categories.storeId],
		references: [stores.id]
	}),
	products: many(products),
}));

export const storesRelations = relations(stores, ({one, many}) => ({
	categories: many(categories),
	products: many(products),
	productVariants: many(productVariants),
	usersInAuth: one(usersInAuth, {
		fields: [stores.ownerId],
		references: [usersInAuth.id]
	}),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	category: one(categories, {
		fields: [products.categoryId],
		references: [categories.id]
	}),
	store: one(stores, {
		fields: [products.storeId],
		references: [stores.id]
	}),
	productVariants: many(productVariants),
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

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	stores: many(stores),
}));