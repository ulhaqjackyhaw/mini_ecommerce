# Product Requirement Document (PRD)
## AmaraStore — Mini E-Commerce & Real-time Order Management

| Informasi | Detail |
|---|---|
| Nama Produk | AmaraStore (Mini E-Commerce & Real-time Admin Dashboard) |
| Versi Dokumen | 2.0 (Final & Implemented) |
| Status | Production Ready |
| Domain Produksi | `https://www.armatastore.web.id` |
| Platform | Web Responsif (Mobile-first & Desktop) |
| Bahasa Antarmuka | Bahasa Indonesia |
| Tech Stack Utama | Next.js 16 (App Router), TypeScript, Tailwind CSS, Supabase (PostgreSQL, Auth, Realtime, Atomic RPC), Recharts, Framer Motion, Lucide Icons |

---

## 1. Deskripsi & Tujuan Produk

### 1.1 Ringkasan Produk
**AmaraStore** adalah platform e-commerce modern dengan filosofi desain *high-craft minimalist editorial* yang memberikan pengalaman belanja cepat, mulus, dan terpercaya bagi pelanggan, serta alat manajemen toko yang tangguh secara *real-time* bagi pemilik toko (Admin).

Aplikasi mengusung fleksibilitas transaksi: pelanggan dapat berbelanja secara instan melalui **Guest Checkout** (tanpa wajib login atau membuat akun) maupun membuat **Akun Pelanggan (Customer Account)** untuk menyimpan profil alamat pengiriman default dan melihat riwayat seluruh pesanan. Di sisi operasional, Admin dilengkapi Dashboard analitik *real-time*, filter rentang tanggal, integrasi template penagihan WhatsApp otomatis, serta manajemen inventaris produk.

### 1.2 Masalah yang Diselesaikan
- **Hambatan Konversi Akun Wajib:** Kebanyakan pembeli enggan bertransaksi jika diwajibkan mendaftar akun dan mengisi form panjang.
- **Risiko Overselling Stok:** Dua pembeli yang melakukan checkout bersamaan pada stok terbatas sering menyebabkan stok minus pada aplikasi e-commerce sederhana.
- **Komunikasi Penagihan Manual:** Admin toko online sering kerepotan menyalin rincian pesanan, total rupiah, dan nomor rekening saat mengirim pesan konfirmasi ke WhatsApp pelanggan.
- **Keterbatasan Visibilitas Transaksi:** Admin harus me-refresh halaman terus-menerus untuk mengetahui pesanan baru atau melihat tren omzet.
- **Pengalaman Pengguna Buruk dari Dialog Browser:** Dialog bawaan browser (`window.alert`, `window.confirm`) merusak estetika antarmuka dan membingungkan pengguna di layar ponsel.

### 1.3 Tujuan Produk (Goals)
1. **Pemesanan Super Cepat:** Memungkinkan pelanggan memilih produk, menentukan kuantitas, dan menyelesaikan pemesanan dalam kurang dari 1 menit.
2. **Integritas Stok & Transaksi Atomik:** Memastikan pemesanan, pengurangan stok, pembuatan snapshot harga, dan pencatatan histori pesanan berjalan secara *ACID transaction* melalui RPC PostgreSQL.
3. **Visibilitas Real-time:** Notifikasi otomatis pesanan baru muncul seketika di dashboard admin tanpa reload halaman.
4. **Otomatisasi Tagihan WhatsApp:** Mempersingkat proses verifikasi pembayaran dengan template WhatsApp terformat otomatis dalam satu klik.
5. **UI/UX Bersih & Tanpa AI Slop:** Tampilan editorial berkelas (estetika Linear/Vercel) dengan tipografi tegas, angka monospace tabular, dan sistem modal pop-up seragam.

---

## 2. Arsitektur Peran Pengguna & Proteksi Akses (Role-Based Access Control)

Aplikasi memiliki 3 jenis entitas pengguna dengan isolasi akses ketat:

```
[ Pengunjung Publik ] ──> Akses: Katalog, Detail Produk, Keranjang, Guest Checkout, Pelacakan Pesanan, Invoice
[ Pelanggan Terdaftar (Role: customer) ] ──> Akses: Seluruh fitur publik + Riwayat Pesanan (/customer/orders), Profil & Alamat Default (/customer/profile)
[ Administrator (Role: admin) ] ──> Akses: Dashboard Analitik (/admin/dashboard), Kelola Produk & Stok (/admin/products)
```

### 2.1 Guest User (Publik)
- Menjelajahi katalog produk, mencari menu/produk, memfilter berdasarkan kategori.
- Membuka modal detail produk dengan informasi stok dan jumlah penjualan ("Terjual X pcs").
- Menambahkan produk ke keranjang belanja lokal (*client-side cart* tersimpan di browser).
- Melakukan pemesanan instan tanpa login hanya dengan memasukkan Nama, Nomor WhatsApp, dan Alamat/Catatan.
- Menerima nomor pesanan unik dan invoice digital digital instan yang dapat dicetak/disimpan.
- Melacak status pesanan mandiri melalui nomor pesanan di `/track-order`.

### 2.2 Customer Account (`role = customer`)
- Mendaftar (`/register`) dan masuk akun (`/login`).
- Data profil (Nama Lengkap, No. WhatsApp, Alamat Pengiriman Default) tersimpan di tabel `profiles`.
- Form checkout otomatis terisi (*auto-filled*) ketika customer sedang dalam kondisi login.
- Riwayat seluruh transaksi pesanan terhubung ke `user_id` pelanggan dan dapat dipantau di `/customer/orders`.
- Proteksi route: Customer dilarang mengakses seluruh halaman `/admin/*`. Jika mencoba mengakses, sistem otomatis mengalihkan (*redirect*) ke area customer.

### 2.3 Administrator (`role = admin`)
- Masuk melalui halaman login admin khusus (`/admin/login`).
- Akses penuh ke Dashboard Transaksi (`/admin/dashboard`) dan Manajemen Produk (`/admin/products`).
- Tidak ada link login admin pada navigasi publik (navbar pelanggan bersih dari tombol admin).
- Proteksi route: Pengguna tanpa role admin yang mencoba mengakses `/admin/*` akan otomatis ditolak dan diarahkan ke `/admin/login`.

---

## 3. Rincian Modul & Spesifikasi Fitur

### 3.1 Modul Katalog & Detail Produk
- **Hero Header Editorial:** Header bersih dengan teks AmaraStore, deskripsi toko, dan bilah pencarian responsif.
- **Pencarian Real-Time:** Filter instan berdasarkan nama produk dan deskripsi tanpa reload halaman.
- **Kategori Produk:** Tombol pill kategori ("Semua", "Minuman", "Camilan", "Makanan") yang dinamis dari tabel `categories`.
- **Kartu Produk Interaktif:**
  * Gambar produk teroptimasi dengan Next.js Image.
  * Teks nama produk, badge kategori, dan sisa stok real-time (badge merah "Habis", badge oranye "Sisa X unit").
  * Badge statistik penjualan: Menghitung total kuantitas produk yang telah sukses terjual dari tabel `order_items`.
  * Harga satuan dalam format Rupiah dengan font monospace tabular.
  * Tombol aksi: "Tambah ke Keranjang" atau stepper kuantitas jika produk sudah berada di keranjang.
- **Modal Detail Produk (Klik Kartu):**
  * Klik pada kartu produk membuka modal detail resolusi penuh.
  * Menampilkan deskripsi lengkap, stok terkini, statistik terjual, stepper kuantitas pesanan, dan tombol langsung tambah ke troli.
  * Dapat ditutup melalui tombol `(X)`, tombol `Tutup`, klik di area blur luar modal, atau tombol `Escape`.

### 3.2 Modul Keranjang Belanja (Cart)
- **Persistensi State:** Menggunakan React Context + `localStorage` agar isi troli tidak hilang saat halaman dimuat ulang.
- **Kontrol Kuantitas:** Stepper `+` dan `-` dengan validasi ketat batas stok maksimal (tidak bisa menambah melebihi sisa stok riil di database).
- **Subtotal & Total Dinamis:** Kalkulasi subtotal per baris dan total belanja secara otomatis.
- **Konfirmasi Penghapusan Aman:**
  * Tombol hapus item (ikon tempat sampah) memunculkan kartu pop-up konfirmasi.
  * Tombol "Kosongkan Keranjang" memunculkan kartu pop-up konfirmasi bahaya (*danger dialog*) sebelum menghapus semua isi troli.

### 3.3 Modul Checkout Cepat & Transaksi Atomik
- **Formulir Checkout:**
  * Nama Lengkap (Wajib, minimal 1 karakter).
  * Nomor WhatsApp / Telepon (Wajib, minimal 6 digit numerik).
  * Alamat Pengiriman / Catatan Pesanan (Opsional).
- **Dukungan Idempotency:** Menghasilkan `idempotency_key` (UUID v4) unik per sesi checkout untuk mencegah terjadinya pesanan dobel akibat koneksi lambat atau penekanan tombol berulang.
- **Database RPC (`create_guest_order`):**
  * Menggunakan transaksi PostgreSQL atomik berkeamanan tinggi.
  * Mengunci baris produk (`FOR UPDATE`) untuk verifikasi harga dan ketersediaan stok riil.
  * Menghitung ulang total belanja di sisi server (mencegah manipulasi harga dari browser).
  * Mengurangi `stock_quantity` produk secara instan.
  * Menyimpan record ke tabel `orders`, menyalin item ke tabel `order_items` lengkap dengan snapshot nama dan harga, serta membuat riwayat pertama di `order_status_history`.
- **Modal Sukses Checkout:**
  * Setelah pesanan tersimpan, muncul pop-up kartu sukses dengan nomor pesanan, animasi centang, dan hitung mundur redirect otomatis (3 detik) menuju halaman invoice.

### 3.4 Modul Invoice Digital & Pelacakan Mandiri
- **Invoice Digital (`/invoice/[orderNumber]`):**
  * Desain faktur resmi yang bersih, siap cetak (*print-optimized* via CSS `@media print`).
  * Informasi nomor pesanan, tanggal pemesanan, status pesanan dengan badge warna semantik.
  * Rincian kontak pemesan dan alamat pengiriman.
  * Tabel rincian produk (Nama, Kuantitas, Harga Satuan Snapshot, Subtotal Snapshot).
  * Total pembayaran dengan penekanan visual yang jelas.
  * Instruksi transfer bank (BCA & Mandiri a.n. AmaraStore).
- **Halaman Pelacakan Mandiri (`/track-order`):**
  * Pelanggan cukup memasukkan nomor pesanan untuk melihat status terkini pesanan mereka (`Pending`, `Processing`, `Completed`, `Cancelled`).

### 3.5 Modul Admin Dashboard & Analitik Real-Time
- **Summary Cards:**
  * Total Omzet Penjualan (Rupiah).
  * Total Transaksi Pesanan.
  * Total Unit Produk Terjual.
  * Antrean Pesanan Perlu Diproses (Pending).
- **Filter Rentang Tanggal (Date Range Filter):**
  * Preset Cepat: *Hari Ini*, *7 Hari Terakhir*, *30 Hari Terakhir*, *Semua Waktu*.
  * *Custom Date Range*: Input Tanggal Mulai s/d Tanggal Akhir.
  * Sinkronisasi Akurat: Mengubah filter tanggal secara otomatis memperbarui kartu ringkasan, grafik Recharts, dan tabel transaksi.
- **Grafik Penjualan Interaktif:**
  * *Tren Omzet Penjualan (Area Chart Recharts)*: Visualisasi kurva pendapatan harian.
  * *Distribusi Status Pesanan (Pie Chart Recharts)*: Proporsi pesanan Pending, Processing, Completed, dan Cancelled.
- **Tabel Transaksi & Pembaruan Real-Time:**
  * Memanfaatkan Supabase Realtime (koneksi websocket ke PostgreSQL `orders`).
  * Pesanan baru yang masuk seketika muncul di tabel dengan kartu notifikasi toast dan highlight visual.
  * Tombol filter status tabel (*Semua*, *Pending*, *Processing*, *Completed*, *Cancelled*).
- **Modal Detail Transaksi & Penagihan WhatsApp:**
  * Rincian lengkap produk yang dipesan, catatan alamat, dan data pemesan.
  * **Tombol "Hubungi via WhatsApp (Tagihan & Verifikasi)":**
    - Otomatis mengubah format nomor lokal `08...` menjadi standar internasional `628...`.
    - Membuka tab `https://wa.me/{nomor}?text={pesan}` dengan pesan tersusun rapi: Sapaan nama pelanggan, no. pesanan, rincian produk & kuantitas, konfirmasi alamat, total tagihan transfer, info no. rekening resmi toko, dan permintaan bukti transfer.
- **Manajemen Status Pesanan:**
  * Ubah status menjadi `Pending`, `Processing`, `Completed`, atau `Cancelled`.
  * Pembatalan pesanan (`Cancelled`) dilindungi dialog konfirmasi modal dan secara otomatis mengembalikan jumlah stok produk ke sistem.

### 3.6 Modul Kelola Produk & Inventaris (`/admin/products`)
- Form tambah produk baru dan modal edit produk (Nama, Slug, Kategori, Deskripsi, Harga, Stok, URL Gambar, Status Aktif).
- Fitur *Inline Quick Stock Edit*: Mengubah stok langsung pada baris tabel inventaris.
- Toggle switch aktif/nonaktif produk dari katalog publik.

### 3.7 Sistem UI/UX & Pop-Up Dialog Terpadu (Zero Native Alerts)
- **Penghapusan Native Dialog:** Seluruh dialog default browser (`window.alert`, `window.confirm`) telah dihapus 100%.
- **`DialogProvider` & Hook `useDialog()`:**
  * Komponen dialog modal pop-up kustom yang dapat dipanggil dari mana saja (`await confirm(...)` atau `await alert(...)`).
  * Dilengkapi tombol silang `X` di sudut kanan atas.
  * Menutup otomatis saat area blur di luar kartu diklik atau saat menekan tombol `Escape`.
  * Tipe semantik: `danger` (merah), `warning` (oranye), `info` (biru), dan `success` (hijau).
- **`ToastCard` Notification:** Komponen notifikasi mengambang yang bersih dan konsisten untuk alert pesanan baru, peringatan batas stok, dan update status.

---

## 4. Keamanan & Kepatuhan Data

1. **Row Level Security (RLS) PostgreSQL:**
   - Tabel `orders` dan `order_items` hanya dapat dibaca publik menggunakan token atau oleh admin yang terautentikasi.
   - Operasi modifikasi status dan pengelolaan produk dibatasi hanya untuk user dengan role `admin`.
2. **Sanitasi & Validasi Input:** Seluruh payload checkout divalidasi menggunakan skema Zod di sisi server API sebelum diteruskan ke database.
3. **Pemisahan Kredensial:** Anon key hanya memiliki izin terbatas, sedangkan operasi sensitif dijalankan melalui Supabase Service Role / RPC Security Definer.

---

## 5. Ringkasan Endpoint API

| Metode | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| `POST` | `/api/checkout` | Validasi checkout dan pemanggilan RPC `create_guest_order` | Publik |
| `POST` | `/api/orders/track` | Mengambil data pesanan berdasarkan order number & token | Publik |
| `GET` | `/api/customer/orders` | Mengambil seluruh riwayat pesanan milik customer yang login | Customer |
| `GET/PATCH` | `/api/customer/profile` | Mengambil atau memperbarui profil dan alamat customer | Customer |
| `POST` | `/api/admin/orders/status`| Memperbarui status transaksi pesanan via RPC `update_order_status` | Admin |
| `GET/POST/PATCH` | `/api/admin/products` | Mengelola data produk dan stok katalog | Admin |
| `GET` | `/api/health` | Healthcheck konektivitas API dan Supabase | Publik |
