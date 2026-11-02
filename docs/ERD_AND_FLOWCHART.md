# ERD & Flowchart — Mini E-Commerce (Quick Order)

Dokumen ini mengikuti entitas dan alur utama pada PRD Mini E-Commerce (Quick Order) & Real-time Admin Dashboard.

## 1. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    categories {
        uuid id PK
        text name
        text slug UK
        boolean is_active
        timestamptz created_at
    }

    products {
        uuid id PK
        uuid category_id FK
        text name
        text slug UK
        text description
        bigint price
        integer stock_quantity
        text image_url
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    admin_profiles {
        uuid user_id PK, FK
        text role
        timestamptz created_at
    }

    orders {
        uuid id PK
        text order_number UK
        text tracking_token_hash
        text customer_name
        text customer_phone
        text customer_address
        order_status status
        bigint subtotal
        bigint total
        text idempotency_key UK
        timestamptz created_at
        timestamptz updated_at
        timestamptz completed_at
        timestamptz cancelled_at
    }

    order_items {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        text product_name_snapshot
        bigint unit_price_snapshot
        integer quantity
        bigint line_total
    }

    order_status_history {
        uuid id PK
        uuid order_id FK
        order_status old_status
        order_status new_status
        uuid changed_by FK
        text note
        timestamptz created_at
    }

    categories ||--o{ products : contains
    auth_users ||--o| admin_profiles : has_profile
    orders ||--|{ order_items : contains
    products o|--o{ order_items : referenced_by
    orders ||--o{ order_status_history : records
    auth_users o|--o{ order_status_history : changes
```

### Penjelasan ERD

- `categories` memiliki banyak `products`; produk boleh tidak memiliki kategori (`category_id` nullable).
- `admin_profiles.user_id` mereferensikan `auth.users.id` milik Supabase Auth. Entitas `auth_users` pada diagram adalah tabel bawaan Supabase `auth.users`, bukan tabel aplikasi ketujuh.
- `orders` menyimpan data transaksi dan snapshot subtotal/total. `order_number` dibuat unik oleh database.
- `order_items` menyimpan detail setiap produk dalam pesanan. Nama dan harga disalin ke kolom snapshot agar invoice lama tidak berubah saat data produk berubah. `product_id` nullable agar histori tetap ada jika produk dihapus di masa depan.
- `order_status_history` mencatat perubahan status, waktu, admin yang melakukan perubahan (jika ada), dan catatan.
- `idempotency_key` opsional mencegah permintaan checkout yang sama membuat pesanan ganda. Nominal uang disimpan sebagai `bigint` dalam rupiah utuh.

## 2. Flowchart A — Guest Checkout Multi-Produk hingga Invoice & Tracking

```mermaid
flowchart TD
    A([Mulai: pelanggan membuka katalog]) --> B[Cari produk / filter kategori]
    B --> C[Pilih beberapa produk dan kuantitas]
    C --> D[Review keranjang: item, subtotal, total]
    D --> E{Keranjang valid dan tidak kosong?}
    E -- Tidak --> C
    E -- Ya --> F[Isi nama, telepon, dan alamat bila diperlukan]
    F --> G[Kirim checkout tanpa login]
    G --> H[Server validasi input dan idempotency key]
    H --> I{Input valid?}
    I -- Tidak --> J[Tampilkan error validasi]
    J --> F
    I -- Ya --> K[RPC create_guest_order]
    K --> L[Lock produk dan validasi status, harga, serta stok]
    L --> M{Semua produk aktif dan stok cukup?}
    M -- Tidak --> N[Rollback transaksi; tampilkan stok terbaru]
    N --> D
    M -- Ya --> O[Hitung subtotal dari harga database]
    O --> P[Kurangi stok dan simpan orders + order_items + history secara atomik]
    P --> Q{Transaksi berhasil?}
    Q -- Tidak --> R[Tampilkan error; pertahankan keranjang]
    R --> D
    Q -- Ya --> S[Kembalikan nomor pesanan dan token tracking]
    S --> T[Tampilkan invoice digital]
    T --> U[Cetak / simpan sebagai PDF]
    T --> V[Masukkan nomor pesanan + token untuk tracking]
    V --> W[Tampilkan status terkini]
    W --> X([Selesai])
```

### Penjelasan Flowchart A

Pelanggan memilih satu atau lebih produk, lalu mengirim checkout tanpa akun. Server tidak mempercayai harga atau total dari browser; RPC mengambil harga dan stok dari PostgreSQL, mengunci baris produk, menghitung total, dan menyimpan pesanan beserta item serta histori status dalam satu transaksi. Jika satu item tidak valid atau stok tidak cukup, seluruh transaksi dibatalkan sehingga stok dan pesanan tetap konsisten. Setelah sukses, pelanggan menerima nomor pesanan dan token pelacakan; token dibutuhkan agar nomor pesanan saja tidak menjadi satu-satunya kontrol akses.

## 3. Flowchart B — Admin Real-time Dashboard & Manajemen Status/Stok

```mermaid
flowchart TD
    A([Admin membuka area admin]) --> B[Login melalui Supabase Auth]
    B --> C{Sesi valid dan role admin?}
    C -- Tidak --> D[Tolak akses / arahkan ke login]
    C -- Ya --> E[Ambil summary cards, grafik, dan tabel transaksi]
    E --> F[Subscribe Supabase Realtime: orders, order_items, products]
    F --> G{Ada event atau aksi admin?}
    G -- Event pesanan / item / produk --> H[Refetch data terkait dan perbarui UI]
    H --> F
    G -- Admin membuka pesanan --> I[Lihat detail dan histori status]
    I --> J{Ubah status?}
    J -- Ya --> K[Panggil RPC update_order_status]
    K --> L[Validasi role, transisi status, dan stok]
    L --> M{Valid?}
    M -- Tidak --> N[Tampilkan error dan refresh data kanonis]
    N --> F
    M -- Ya --> O[Simpan status + history; jika Cancelled, kembalikan stok satu kali]
    O --> P[Realtime mengirim perubahan ke dashboard aktif]
    P --> F
    J -- Tidak --> Q{Kelola produk/stok?}
    Q -- Ya --> R[Tambah/edit produk atau ubah stok]
    R --> S[Validasi server/RLS dan constraint database]
    S --> T[Simpan perubahan produk/stok]
    T --> U[Realtime memperbarui katalog/dashboard]
    U --> F
    Q -- Tidak --> F
```

### Penjelasan Flowchart B

Admin harus memiliki sesi Supabase Auth yang valid dan role `admin`. Dashboard memuat statistik, grafik, dan transaksi, lalu berlangganan event Realtime yang diperlukan. Ketika status pesanan diubah, RPC memvalidasi hak admin dan transisi status, menulis histori, serta mengembalikan stok satu kali jika pesanan dibatalkan. Operasi produk/stok tetap dibatasi RLS dan constraint database. Setelah reconnect Realtime, aplikasi sebaiknya melakukan refetch agar UI kembali sinkron dengan database.
