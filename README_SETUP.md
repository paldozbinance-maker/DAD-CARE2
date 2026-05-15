# DadWork Ledger System

## ⚠️ Database Setup Integration - READ ME FIRST

We encountered issues running the database setup tools locally due to your folder path containing spaces (`dadcare app`) and OneDrive restrictions.

**Because of this, you must set up the database using Method B below.**

### Method A: The Ideal Way (Try this if you moved the folder)
If you moved the project to `C:\dadwork-ledger`:
1. Open terminal in `C:\dadwork-ledger`
2. Run `npm install`
3. Run `npx prisma db push`
4. Run `npm run dev`

### Method B: The Guaranteed Way (Manual SQL)
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project.
3. Go to the **SQL Editor** (item in the left sidebar).
4. Click **New Query**.
5. Copy the entire content of the file `supabase_schema.sql` (found in this project folder).
6. Paste it into the SQL Editor and click **Run**.
   *This creates all the necessary tables directly.*

### Running the App
After setting up the database (Method A or B):
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## Features Implemented
- **Daily Book**: View and edit daily KG records per customer.
- **Main Ledger**: Transaction history and debt management.
- **Dashboard**: High-level business stats.
- **Customers**: Detailed profiles.
- **Auth**: Secure Login.

## Troubleshooting
- **"Client not found"**: If you see errors about Prisma Client, try running `npx prisma generate` one more time in the terminal. If it fails, rely on the SQL setup and ensure your `.env` connection strings are correct.
