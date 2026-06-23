# 🏪 Lamaniaga POS (Point of Sales)

[![Next.js Version](https://img.shields.io/badge/Next.js-16.2.6-blue?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React Version](https://img.shields.io/badge/React-19.2.4-cyan?logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Architecture](https://img.shields.io/badge/Architecture-Feature--Based_&_Multi--Tenant-orange)](#)

**Lamaniaga POS** adalah sistem Point of Sales berskala enterprise dengan arsitektur **Multi-Tenant** modern. Aplikasi ini dirancang menggunakan pendekatan **Feature-Based Structure** untuk memastikan skalabilitas kode tingkat tinggi, pemisahan tanggung jawab yang jelas (*Separation of Concerns*), serta performa maksimal menggunakan teknologi serverless terbaru.

---

## ✨ Fitur Utama
- **Multi-Tenant Architecture**: Satu aplikasi dapat melayani banyak toko (*stores*) dengan isolasi data yang aman melalui identifikasi `storeSlug`.
- **Feature-Based Modularization**: Setiap domain bisnis (Auth, Kategori, Produk, Supplier) dibungkus secara independen.
- **Robust Data Flow**: Arsitektur berlapis memisahkan *UI Components*, *Server Actions* (Business Logic), dan *Repositories* (Database Queries).
- **Hybrid Querying Strategy**: Optimasi Drizzle ORM menggunakan *Core API* untuk kalkulasi berat dan *Query API* untuk kecepatan CRUD relasional.

---

## 🚀 Tech Stack

### Frontend & UI Layer
- **Framework:** `Next.js 16.2.6` (App Router)
- **Library Utama:** `React 19.2.4`
- **Styling & Components:** `Tailwind CSS v4`, `shadcn/ui`, `radix-ui`, `lucide-react`
- **State & Form Management:** `zustand`, `react-hook-form`, `zod`

### Backend, Cache & Database Layer
- **Data Fetching & Cache:** `@tanstack/react-query`
- **Database Backend:** PostgreSQL via `drizzle-orm` & `drizzle-kit`
- **Auth & Serverless Infrastructure:** `supabase`, `@supabase/supabase-js`, `@supabase/ssr`
- **Environment:** `dotenv`, `typescript`

---

## 📐 Alur Data (Data Flow Architecture)

Aplikasi ini menerapkan aliran data satu arah yang ketat dari UI hingga ke database untuk menjaga konsistensi state:

```text
  [ Halaman / Page ]
          ↓
  [ Feature Component ]
          ↓
  [ Hook (TanStack React Query) ]
          ↓
  [ Action (Server Action + Business Logic & Permission) ]
          ↓
  [ Repository (Drizzle Core/Query API) ]
          ↓
  [ Database (PostgreSQL) ]
