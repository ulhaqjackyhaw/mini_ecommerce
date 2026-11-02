# ERD & Flowchart — AmaraStore (Mini E-Commerce & Real-time Order Management)

Dokumen ini memetakan arsitektur basis data relasional (ERD) dan alur kerja (*flowcharts*) yang merefleksikan implementasi sistem **AmaraStore** secara presisi.

---

## 1. Entity Relationship Diagram (ERD)

Diagram di bawah ini menggambarkan struktur tabel pada database PostgreSQL (Supabase) yang digunakan oleh aplikasi:

```mermaid
erDiagram
    auth_users {
        uuid id PK
        text email
        timestamptz created_at
    }

    profiles {
        uuid id PK, FK
        text email
        text full_name
        text phone
        text address
        text role
        timestamptz created_at
        timestamptz updated_at
    }

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

    orders {
        uuid id PK
        uuid user_id FK
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

    auth_users ||--|| profiles : "has profile (1:1)"
    profiles ||--o{ orders : "places order (0:N)"
    categories ||--o{ products : "categorizes (1:N)"
    orders ||--|{ order_items : "contains (1:N)"
    products o|--o{ order_items : "referenced by (0:N)"
    orders ||--o{ order_status_history : "tracks history (1:N)"
    profiles o|--o{ order_status_history : "updated by (0:N)"
```

### Penjelasan Entitas & Integritas Data

1. **`auth.users` & `profiles` (1:1)**:
   - Setiap pengguna yang mendaftar di Supabase Auth otomatis memiliki record di tabel `profiles`.
   - Kolom `role` bernilai `'admin'` (untuk pengelola toko) atau `'customer'` (untuk pelanggan terdaftar).
   - Profil pelanggan menyimpan alamat default (`address`) dan kontak telepon (`phone`) untuk kemudahan checkout otomatis (*auto-fill*).

2. **`categories` & `products` (1:N)**:
   - Kategori mengelompokkan produk di katalog.
   - `products.category_id` bersifat opsional (*nullable*); produk tetap valid jika belum dikategorikan.
   - `stock_quantity` bernilai integer positif yang dicek dan dikurangi secara otomatis setiap transaksi berhasil.

3. **`orders` & `order_items` (1:N)**:
   - `orders.user_id` bernilai *nullable*: diisi `uuid` pelanggan jika pembeli melakukan checkout dalam keadaan login, atau `NULL` jika pembeli menggunakan mode **Guest Checkout**.
   - `orders.order_number`: Kode unik pesanan yang ramah dibaca (format: `ORD-YYYYMMDD-XXXXXXXX`) dibuat oleh database.
   - Snapshot Harga & Nama (`product_name_snapshot` & `unit_price_snapshot`): Mengabadikan data saat pesanan dibuat, sehingga jika nama atau harga produk diubah oleh admin di masa depan, faktur invoice lama tidak akan berubah.
   - Nominal uang (`price`, `subtotal`, `total`, `line_total`) disimpan dalam satuan Rupiah bulat (`bigint`).
   - `idempotency_key` mencegah terjadinya duplikasi pesanan jika tombol checkout ditekan berulang.

4. **`order_status_history`**:
   - Mencatat audit trail setiap kali status pesanan berubah dari `old_status` ke `new_status` beserta waktu dan catatan.

---

## 2. Flowchart A — Alur Belanja Pelanggan (Guest & Customer) hingga Invoice

Diagram alur berikut memperlihatkan perjalanan pengguna dari membuka katalog produk hingga mendapatkan invoice digital dan pelacakan pesanan:

```mermaid
flowchart TD
    A([Mulai: Pelanggan Buka Katalog]) --> B[Cari Produk / Filter Kategori]
    B --> C[Klik Kartu Produk]
    C --> D[Buka Modal Detail: Cek Foto, Stok, Statistik Terjual]
    D --> E[Pilih Kuantitas & Tambah ke Keranjang]
    E --> F[Review Keranjang Belanja]
    F --> G{Ingin Hapus / Kosongkan Troli?}
    G -- Ya --> H[Pop-up Modal Konfirmasi Kartu]
    H -- Batal / Klik Luar / ESC --> F
    H -- Konfirmasi --> I[Item Dihapus / Keranjang Dikosongkan]
    I --> F
    G -- Tidak --> J[Klik Lanjut ke Checkout]
    J --> K{Pelanggan Sedang Login?}
    K -- Ya --> L[Form Terisi Otomatis dari Profil Default]
    K -- Tidak --> M[Guest Checkout: Input Nama, WA, & Alamat Catatan]
    L --> N[Klik 'Buat Pesanan & Dapatkan Invoice']
    M --> N
    N --> O[Client Validasi Input & Generate Idempotency Key]
    O --> P[Kirim POST /api/checkout]
    P --> Q[Panggil RPC PostgreSQL create_guest_order Atomik]
    Q --> R[Kunci Baris Produk FOR UPDATE & Hitung Ulang Total]
    R --> S{Stok Cukup & Produk Aktif?}
    S -- Tidak --> T[Rollback Transaksi & Tampilkan Alert Batas Stok]
    T --> F
    S -- Ya --> U[Kurangi Stok, Simpan orders, order_items, dan history]
    U --> V[Pop-up Modal Sukses Pesanan: Hitung Mundur 3 Detik]
    V --> W[Arahkan ke Invoice Digital /invoice/orderNumber]
    W --> X[Cetak Struk / Simpan PDF / Lacak Pesanan Mandiri]
    X --> Y([Selesai])
```

---

## 3. Flowchart B — Admin Real-Time Dashboard, Filter Tanggal & Tagihan WhatsApp

Diagram berikut memetakan operasional toko di panel admin, mulai dari analitik data hingga komunikasi WhatsApp ke pelanggan:

```mermaid
flowchart TD
    A([Admin Mengakses /admin/login]) --> B[Input Email & Password Supabase Auth]
    B --> C{Autentikasi Valid & Role = admin?}
    C -- Tidak --> D[Tolak Akses & Redirect ke Login Publik]
    C -- Ya --> E[Masuk ke Dashboard /admin/dashboard]
    E --> F[Fetch Data Awal: Summary Cards, Recharts, & Transaksi]
    E --> G[Buka Koneksi Supabase Realtime channel postgres_changes]
    G --> H{Ada Pesanan Baru Masuk?}
    H -- Ya --> I[Toast Notifikasi Mengambang + Auto Refresh Data]
    I --> J[Tampilkan Pesanan Baru di Atas Tabel]
    H -- Tidak --> K{Gunakan Filter Tanggal?}
    K -- Ya --> L[Pilih Preset Cepat atau Custom Date Range]
    L --> M[Sinkronkan Omzet, Total Transaksi, Grafik, & Tabel]
    M --> N[Review Tabel Transaksi]
    K -- Tidak --> N
    N --> O[Klik 'Lihat Detail' pada Pesanan]
    O --> P[Buka Modal Detail Pesanan Transaksi]
    P --> Q{Pilih Aksi?}
    Q -- Hubungi WhatsApp --> R[Klik 'Hubungi via WhatsApp Tagihan & Verifikasi']
    R --> S[Format Nomor Otomatis ke Standar 628]
    S --> T[Buka wa.me dengan Template Rincian, Total Rp, & Rekening Bank]
    T --> P
    Q -- Ubah Status Pesanan --> U{Status Baru = Cancelled?}
    U -- Ya --> V[Pop-up Modal Konfirmasi Bahaya Pembatalan]
    V -- Batal --> P
    V -- Ya, Batalkan --> W[Panggil RPC update_order_status]
    U -- Tidak: Processing / Completed --> W
    W --> X[Simpan Status Baru, Tulis Histori, & Kembalikan Stok jika Cancelled]
    X --> Y[Realtime Update Status ke Pelanggan & Dashboard]
    Y --> P
    P --> Z[Tutup Modal via Tombol X / Klik Luar / ESC]
    Z --> N
```

---

## 4. Flowchart C — Proteksi Route Berdasarkan Peran (Role Guard)

Diagram berikut menjelaskan isolasi akses ketat antara Admin, Customer terdaftar, dan Pengunjung publik:

```mermaid
flowchart TD
    A([Permintaan Route URL]) --> B{Target Route Membutuhkan Proteksi?}
    B -- Halaman Publik / atau /cart atau /checkout --> C[Izinkan Akses Langsung]
    B -- Area Customer /customer/* --> D{User Terautentikasi?}
    D -- Belum Login --> E[Redirect ke /login?redirect=target]
    D -- Sudah Login --> F{Role Pengguna?}
    F -- customer --> G[Izinkan Akses ke Area Pelanggan]
    F -- admin --> H[Redirect ke /admin/dashboard]
    B -- Area Admin /admin/* --> I{User Terautentikasi & Role = admin?}
    I -- Tidak --> J[Redirect ke /admin/login]
    I -- Ya --> K[Izinkan Akses ke Dashboard & Produk Admin]
```
