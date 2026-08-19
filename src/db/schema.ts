import { pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const boards = pgTable('boards', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  owner: jsonb('owner'),
  preferences: jsonb('preferences'),
  shows: jsonb('shows').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const friends = pgTable('friends', {
  userId: text('user_id').primaryKey(),
  friendsList: jsonb('friends_list').notNull(),
  pendingSent: jsonb('pending_sent').notNull(),
  pendingReceived: jsonb('pending_received').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const merchandise = pgTable('merchandise', {
  id: text('id').primaryKey(),
  showTitle: text('show_title').notNull(),
  category: text('category').notNull(),
  title: text('title').notNull(),
  price: text('price').notNull(),
  rating: text('rating'),
  imageUrl: text('image_url').notNull(),
  amazonUrl: text('amazon_url').notNull(),
  badge: text('badge'),
  description: text('description'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

