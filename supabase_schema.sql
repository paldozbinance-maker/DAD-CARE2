-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Enums
create type "Role" as enum ('ADMIN', 'CUSTOMER');
create type "LedgerType" as enum ('PRODUCT', 'PAYMENT');

-- Create Tables

-- User Table
create table if not exists "User" (
  "id" uuid not null default uuid_generate_v4(),
  "email" text not null,
  "role" "Role" not null default 'CUSTOMER',
  "created_at" timestamp(3) not null default current_timestamp,

  constraint "User_pkey" primary key ("id")
);

-- Customer Table
create table if not exists "Customer" (
  "id" uuid not null default uuid_generate_v4(),
  "customer_code" text not null,
  "name" text not null,
  "gender" text,
  "phone" text,
  "avatar_url" text,
  "created_at" timestamp(3) not null default current_timestamp,

  constraint "Customer_pkey" primary key ("id")
);

-- DailyBook Table
create table if not exists "DailyBook" (
  "id" uuid not null default uuid_generate_v4(),
  "date" date not null,
  "created_at" timestamp(3) not null default current_timestamp,

  constraint "DailyBook_pkey" primary key ("id")
);

-- DailyBookItem Table
create table if not exists "DailyBookItem" (
  "id" uuid not null default uuid_generate_v4(),
  "daily_book_id" uuid not null,
  "customer_id" uuid not null,
  "kg" double precision not null,

  constraint "DailyBookItem_pkey" primary key ("id")
);

-- Ledger Table
create table if not exists "Ledger" (
  "id" uuid not null default uuid_generate_v4(),
  "customer_id" uuid not null,
  "type" "LedgerType" not null,
  "reference_date" date,
  "kg" double precision,
  "price_per_kg" double precision,
  "amount" double precision not null,
  "previous_debt" double precision not null,
  "new_debt" double precision not null,
  "created_at" timestamp(3) not null default current_timestamp,

  constraint "Ledger_pkey" primary key ("id")
);

-- Create Indexes and Unique Constraints
create unique index if not exists "User_email_key" on "User"("email");
create unique index if not exists "Customer_customer_code_key" on "Customer"("customer_code");
create unique index if not exists "DailyBook_date_key" on "DailyBook"("date");

-- Add Foreign Keys
alter table "DailyBookItem" add constraint "DailyBookItem_daily_book_id_fkey"
  foreign key ("daily_book_id") references "DailyBook"("id") on update cascade on delete restrict;

alter table "DailyBookItem" add constraint "DailyBookItem_customer_id_fkey"
  foreign key ("customer_id") references "Customer"("id") on update cascade on delete restrict;

alter table "Ledger" add constraint "Ledger_customer_id_fkey"
  foreign key ("customer_id") references "Customer"("id") on update cascade on delete restrict;
