# Product Requirement Document (PRD)
## Mini E-Commerce (Quick Order) & Real-time Admin Dashboard

| Informasi | Detail |
|---|---|
| Nama produk | Mini E-Commerce (Quick Order) & Real-time Admin Dashboard |
| Versi dokumen | 1.0 |
| Status | Draft untuk perencanaan dan pengembangan |
| Platform | Web responsif |
| Bahasa antarmuka | Bahasa Indonesia (utama) |
| Tech stack | Next.js App Router, TypeScript, Tailwind CSS, Supabase, Recharts, Vercel |

---

## 1. Deskripsi & Tujuan Produk

### 1.1 Ringkasan Produk

Mini E-Commerce (Quick Order) adalah aplikasi web e-commerce ringan yang memungkinkan pelanggan melihat katalog produk, mencari dan memfilter produk, memasukkan beberapa produk ke keranjang, lalu melakukan checkout tanpa membuat akun. Setelah pesanan berhasil dibuat, pelanggan memperoleh nomor pesanan dan invoice digital yang dapat dicetak atau disimpan serta dapat melacak status pesanannya.

Aplikasi menyediakan dashboard admin yang terproteksi autentikasi. Admin dapat memantau transaksi dan ringkasan penjualan secara real-time, melihat grafik, memperbarui status pesanan, serta mengelola produk dan stok. Next.js menjadi fondasi antarmuka dan endpoint server, Supabase menyediakan PostgreSQL, autentikasi, serta pembaruan real-time, sedangkan Vercel digunakan untuk deployment.

### 1.2 Masalah yang Ingin Diselesaikan

- Proses pemesanan terlalu panjang apabila pelanggan diwajibkan membuat akun.
- Pelanggan membutuhkan cara sederhana untuk membeli beberapa jenis produk sekaligus.
- Admin membutuhkan visibilitas transaksi dan stok yang cepat tanpa harus memuat ulang halaman secara manual.
- Pelanggan memerlukan bukti transaksi dan cara memeriksa status pesanan secara mandiri.

### 1.3 Tujuan Produk

1. Memungkinkan pelanggan menyelesaikan pemesanan tanpa login.
2. Mendukung beberapa produk dan kuantitas berbeda dalam satu transaksi.
3. Menyediakan invoice digital dengan nomor pesanan yang unik.
4. Memberikan admin tampilan transaksi, statistik, dan grafik yang diperbarui secara real-time.
5. Memungkinkan admin memperbarui status pesanan dan mengelola stok dengan aman.
6. Menyediakan pengalaman yang responsif, mudah dipahami, dan aman di perangkat desktop maupun mobile.

### 1.4 Indikator Keberhasilan (Success Metrics)

- **Keberhasilan checkout:** persentase checkout yang berhasil disimpan tanpa error.
- **Waktu checkout:** median waktu dari keranjang hingga pesanan berhasil dibuat.
- **Keberhasilan pencarian:** pengguna dapat menemukan produk melalui kata kunci atau filter kategori.
- **Kesegaran dashboard:** perubahan transaksi/status muncul pada dashboard aktif dalam beberapa detik pada kondisi jaringan normal.
- **Akurasi stok:** tidak terjadi overselling akibat dua checkout bersamaan.
- **Keandalan invoice:** setiap pesanan berhasil memiliki satu nomor pesanan unik dan detail invoice yang konsisten.
- **Kegunaan mobile:** alur katalog, keranjang, checkout, dan pelacakan dapat digunakan tanpa layout terpotong.

Target numerik perlu ditetapkan setelah baseline dan kebutuhan operasional dikonfirmasi. Sebagai sasaran awal, perubahan real-time dapat ditargetkan tampil dalam ≤ 3 detik pada kondisi jaringan normal.

### 1.5 Ruang Lingkup

**Termasuk dalam MVP**
- Katalog publik, pencarian, filter kategori, detail produk sederhana.
- Keranjang multi-produk.
- Guest checkout.
- Pembuatan nomor pesanan dan invoice digital.
- Pelacakan status menggunakan nomor pesanan.
- Login admin menggunakan Supabase Auth.
- Dashboard statistik, tabel transaksi, dan grafik.
- Pembaruan status pesanan dan pengelolaan produk/stok.
- Pembaruan dashboard melalui Supabase Realtime.
- Desain responsif, validasi input, penanganan error, dan deployment Vercel.

**Di luar ruang lingkup MVP, kecuali disepakati kemudian**
- Registrasi/login pelanggan.
- Payment gateway dan konfirmasi pembayaran otomatis.
- Pengiriman/logistik terintegrasi.
- Program loyalitas, voucher kompleks, ulasan, dan wishlist.
- Multi-tenant atau banyak toko dengan isolasi data per toko.
- Integrasi akuntansi dan ERP.

> **Asumsi penting:** MVP membuat pesanan tanpa pembayaran online. Metode pembayaran dan proses konfirmasi pembayaran dapat ditambahkan pada fase berikutnya. Status pesanan tidak boleh dianggap sebagai status pembayaran kecuali model pembayaran dirancang terpisah.

---

## 2. Target Pengguna

### 2.1 Guest Customer

**Profil:** pengunjung yang ingin membeli produk secara cepat tanpa membuat akun.

**Kebutuhan utama**
- Melihat katalog dan harga produk.
- Menemukan produk dengan pencarian dan kategori.
- Menambah beberapa produk ke keranjang dan mengubah kuantitas.
- Menyelesaikan checkout dengan informasi kontak/pengiriman minimum yang diperlukan.
- Mendapatkan nomor pesanan dan invoice.
- Memeriksa status pesanan tanpa login.

**Kriteria pengalaman yang baik**
- Tidak ada keharusan membuat akun.
- Harga, kuantitas, subtotal, dan total ditampilkan dengan jelas.
- Pesan validasi mudah dipahami.
- Keranjang tidak hilang saat halaman tidak sengaja dimuat ulang, selama penyimpanan browser tersedia.

### 2.2 Admin

**Profil:** pemilik toko atau staf yang memiliki hak mengelola produk, stok, dan pesanan.

**Kebutuhan utama**
- Login dan logout secara aman.
- Melihat ringkasan pesanan, penjualan, dan status transaksi.
- Memantau transaksi baru tanpa refresh manual.
- Mencari, memfilter, dan membuka detail pesanan.
- Memperbarui status pesanan sesuai alur yang diizinkan.
- Menambah, mengubah, mengaktifkan/nonaktifkan produk dan mengelola stok.
- Meninjau data yang konsisten dan mendapat informasi ketika operasi gagal.

**Kriteria pengalaman yang baik**
- Halaman admin tidak dapat diakses oleh pengguna tanpa sesi dan role admin.
- Perubahan status/stok memiliki konfirmasi dan feedback yang jelas.
- Dashboard memiliki indikator loading, empty state, error state, dan status koneksi real-time.

---

## 3. Spesifikasi Fitur & Kebutuhan Fungsional

### 3.1 Sisi Publik / Guest Customer

#### FR-G01 — Katalog Produk
- Sistem menampilkan produk aktif yang tersedia untuk dijual.
- Setiap kartu produk menampilkan minimal nama, gambar (jika tersedia), harga, kategori, dan ketersediaan stok.
- Produk nonaktif tidak ditampilkan di katalog publik.
- Produk habis dapat ditampilkan sebagai “Stok habis” dan tidak dapat ditambahkan ke keranjang.
- Harga dan stok yang ditampilkan di browser hanya untuk informasi; server harus memvalidasi ulang saat checkout.

**Acceptance criteria**
- Pelanggan dapat membuka katalog di desktop dan mobile.
- Produk nonaktif tidak muncul di katalog.
- Produk dengan stok nol tidak dapat dipesan.

#### FR-G02 — Pencarian dan Filter Kategori
- Pencarian mencocokkan kata kunci pada nama produk dan, bila tersedia, deskripsi.
- Filter kategori dapat diterapkan dan dihapus.
- Pencarian dan filter dapat digunakan bersamaan.
- Tersedia empty state ketika tidak ada produk yang cocok.
- Query parameter URL dapat digunakan agar hasil pencarian/filter mudah dibagikan atau dipulihkan.

**Acceptance criteria**
- Mengubah kata kunci atau kategori memperbarui daftar produk.
- Pengguna dapat menghapus filter dan kembali ke daftar produk yang relevan.

#### FR-G03 — Keranjang Multi-Produk
- Pelanggan dapat menambahkan lebih dari satu jenis produk.
- Pelanggan dapat menaikkan/menurunkan kuantitas atau menghapus item.
- Sistem menampilkan harga per item, kuantitas, subtotal item, subtotal keranjang, dan total.
- Kuantitas harus berupa bilangan bulat positif dan tidak boleh melampaui stok yang tersedia.
- Keranjang dapat disimpan sementara pada browser, misalnya melalui `localStorage`, agar bertahan saat halaman dimuat ulang.
- Total yang tersimpan pada browser tidak dianggap sebagai sumber kebenaran.

**Acceptance criteria**
- Dua produk berbeda dapat dipesan dalam satu transaksi.
- Mengubah kuantitas langsung memperbarui subtotal dan total di UI.
- Item yang stoknya tidak cukup ditandai dan checkout tidak dapat dilanjutkan sampai diperbaiki.

#### FR-G04 — Guest Checkout
- Checkout tidak mensyaratkan akun atau login.
- Form checkout mengumpulkan data minimum yang disepakati, misalnya nama penerima, nomor telepon, dan alamat jika pengiriman diperlukan.
- Pelanggan dapat meninjau item, kuantitas, harga, dan total sebelum mengirim pesanan.
- Server memvalidasi ulang produk, harga aktif, kuantitas, stok, dan data pelanggan.
- Pesanan serta detail item dibuat secara atomik melalui transaksi database atau fungsi database yang sesuai.
- Pengiriman permintaan berulang tidak boleh menciptakan pesanan ganda; gunakan idempotency key atau mekanisme setara.
- Jika stok berubah sebelum checkout selesai, sistem menolak atau meminta pelanggan menyesuaikan keranjang.
- Setelah sukses, sistem menampilkan halaman konfirmasi berisi nomor pesanan dan tautan invoice/pelacakan.

**Acceptance criteria**
- Checkout berhasil tanpa sesi pelanggan.
- Harga/total dihitung ulang di server dari harga produk yang tersimpan.
- Stok tidak menjadi negatif saat beberapa pelanggan memesan bersamaan.
- Error tidak menghapus keranjang secara diam-diam.
- Permintaan checkout yang dikirim ulang dengan idempotency key yang sama tidak membuat pesanan kedua.

#### FR-G05 — Nomor Pesanan
- Setiap pesanan mendapatkan nomor pesanan unik dan tidak mudah ditebak, misalnya kombinasi prefiks dan token acak.
- Nomor pesanan dibuat di sisi server/database, bukan ditentukan browser.
- Nomor pesanan ditampilkan setelah checkout dan tercantum di invoice.
- Nomor pesanan tidak boleh menjadi satu-satunya kontrol akses terhadap data sensitif.

#### FR-G06 — Invoice Digital
- Invoice menampilkan nomor pesanan, tanggal/waktu, detail produk, kuantitas, harga satuan, subtotal, total, serta informasi pelanggan yang relevan.
- Invoice mengambil data dari pesanan yang tersimpan, bukan dari state keranjang browser.
- Pelanggan dapat mencetak invoice menggunakan dialog print browser.
- Pelanggan dapat menyimpan invoice sebagai PDF melalui fungsi cetak browser; pembuatan PDF langsung di server dapat menjadi peningkatan lanjutan.
- Layout invoice dioptimalkan untuk cetak dan tidak memuat navigasi yang tidak relevan.

#### FR-G07 — Pelacakan Status Pesanan
- Pelanggan dapat memasukkan nomor pesanan pada halaman pelacakan.
- Sistem menampilkan status terkini: `Pending`, `Processing`, `Completed`, atau `Cancelled`.
- Sistem hanya menampilkan informasi minimum yang diperlukan dan tidak membocorkan data pribadi berlebihan.
- Endpoint pelacakan harus membatasi percobaan berulang dan menghindari enumerasi nomor pesanan.
- Sebaiknya nomor pesanan digabungkan dengan token akses rahasia yang dikembalikan saat checkout atau tautan bertanda tangan; nomor pesanan saja bukan rahasia yang kuat.

**Acceptance criteria**
- Nomor pesanan yang valid menampilkan status terkini.
- Nomor tidak valid menghasilkan pesan umum yang tidak membocorkan keberadaan data sensitif.
- Pelanggan tidak dapat melihat daftar pesanan pelanggan lain.

### 3.2 Sisi Admin

#### FR-A01 — Autentikasi dan Otorisasi Admin
- Admin login menggunakan Supabase Auth.
- Akses ke route admin diverifikasi di server, bukan hanya dengan menyembunyikan komponen di client.
- Hak admin ditentukan melalui role/allowlist yang dikelola secara aman, misalnya tabel profil admin yang hanya dapat diubah oleh proses tepercaya.
- Role tidak boleh dipercaya hanya karena nilainya dikirim dari browser.
- Sesi menggunakan pola cookie/session yang sesuai dengan integrasi Next.js dan Supabase SSR.
- Admin dapat logout dan sesi yang tidak valid diarahkan ke halaman login.
- RLS tetap menjadi lapisan keamanan data walaupun middleware atau layout telah memeriksa sesi.

**Acceptance criteria**
- Pengguna tanpa sesi tidak dapat mengakses halaman admin.
- Pengguna terautentikasi tanpa role admin tetap ditolak.
- Kunci `service_role` Supabase tidak pernah dikirim ke browser.

#### FR-A02 — Summary Cards
Dashboard menampilkan ringkasan seperti:
- Total pesanan pada periode terpilih.
- Pesanan berstatus Pending.
- Pesanan berstatus Processing.
- Pesanan Completed.
- Total penjualan/omzet berdasarkan definisi bisnis yang disepakati.

**Aturan metrik**
- Definisikan apakah “penjualan” dihitung dari pesanan Completed saja atau status lain.
- Pesanan Cancelled tidak dihitung sebagai penjualan.
- Periode waktu harus jelas dan konsisten, termasuk zona waktu bisnis.
- Total penjualan pada MVP adalah nilai pesanan, bukan laba bersih, kecuali biaya dan margin juga dimodelkan.

#### FR-A03 — Tabel Transaksi
- Menampilkan nomor pesanan, tanggal, nama pelanggan, jumlah item, total, dan status.
- Mendukung pagination server-side, pencarian nomor pesanan/nama pelanggan, filter status, dan filter rentang tanggal.
- Tabel menampilkan indikator loading, empty state, dan error state.
- Klik pada baris atau aksi detail membuka rincian pesanan dan item.
- Data sensitif hanya ditampilkan kepada admin berwenang.

#### FR-A04 — Pembaruan Real-time
- Dashboard berlangganan ke event Supabase Realtime yang relevan untuk pesanan.
- Perubahan status dan pesanan baru memperbarui tabel serta ringkasan tanpa refresh manual.
- Jika diperlukan, grafik diperbarui setelah event atau melalui refetch agregasi yang terkontrol.
- Saat koneksi putus, UI menampilkan status koneksi dan mencoba menyambung kembali.
- Setelah reconnect, sistem melakukan refetch untuk menyelaraskan data agar event yang terlewat tidak menyebabkan data usang.
- Langganan realtime harus difilter seperlunya, dibersihkan saat komponen unmount, dan tidak membuat subscription duplikat.

**Acceptance criteria**
- Pesanan baru terlihat pada dashboard yang terbuka dalam target latensi yang ditetapkan pada kondisi jaringan normal.
- Perubahan status yang dibuat admin lain tercermin pada dashboard aktif.
- Setelah reconnect, data akhir konsisten dengan database.

#### FR-A05 — Grafik Penjualan (Recharts)
- Menampilkan grafik tren penjualan per hari/minggu/bulan sesuai rentang tanggal.
- Menampilkan distribusi status pesanan atau metrik tambahan jika berguna.
- Grafik menggunakan data agregasi dari server/database, bukan mengunduh seluruh transaksi ke browser.
- Menampilkan tooltip, label periode, dan empty state ketika data belum tersedia.
- Perubahan filter periode memuat ulang data grafik.

#### FR-A06 — Manajemen Status Pesanan
- Admin dapat mengubah status pesanan ke status yang diizinkan.
- Status: `Pending`, `Processing`, `Completed`, `Cancelled`.
- Aturan transisi status perlu didefinisikan, misalnya Pending → Processing/Cancelled dan Processing → Completed/Cancelled.
- Transisi yang tidak diizinkan ditolak oleh server/database.
- Perubahan status menyimpan waktu pembaruan dan identitas admin yang melakukan perubahan.
- Perubahan ditampilkan melalui Supabase Realtime.
- Pembatalan harus menerapkan kebijakan stok yang konsisten, termasuk apakah stok yang sebelumnya dikurangi dikembalikan.

#### FR-A07 — Manajemen Produk dan Stok
- Admin dapat melihat daftar produk, mencari produk, menambah produk, mengubah detail, mengubah harga, mengubah stok, serta mengaktifkan/nonaktifkan produk.
- Field produk minimal: nama, deskripsi opsional, harga, kategori, gambar opsional, stok, status aktif, waktu dibuat, waktu diperbarui.
- Validasi harga dan stok dilakukan di server/database.
- Stok tidak boleh negatif.
- Perubahan stok disimpan dengan operasi atomik dan mencatat siapa yang melakukan perubahan jika audit dibutuhkan.
- Produk yang sudah tercantum pada pesanan tidak dihapus secara permanen tanpa kebijakan yang jelas; gunakan status nonaktif/soft delete untuk menjaga riwayat transaksi.

#### FR-A08 — Audit dan Feedback Operasi
- Perubahan status dan stok sebaiknya memiliki jejak audit: aktor, waktu, nilai sebelum/sesudah, dan alasan jika relevan.
- Admin memperoleh notifikasi sukses/gagal yang jelas.
- Aksi yang berdampak besar, seperti pembatalan atau pengurangan stok, meminta konfirmasi.
- Operasi gagal tidak boleh menampilkan pesan sukses palsu.

### 3.3 Alur Utama Pengguna

**Alur guest**
1. Membuka katalog.
2. Mencari produk atau memilih kategori.
3. Menambahkan produk dan kuantitas ke keranjang.
4. Meninjau keranjang dan total.
5. Mengisi data checkout minimum.
6. Mengirim pesanan.
7. Server memvalidasi stok/harga dan membuat pesanan beserta item secara atomik.
8. Pelanggan menerima nomor pesanan dan melihat invoice.
9. Pelanggan membuka halaman pelacakan untuk melihat status terbaru.

**Alur admin**
1. Membuka halaman admin dan login.
2. Server memverifikasi sesi dan role admin.
3. Dashboard mengambil ringkasan, grafik, dan transaksi terbaru.
4. Supabase Realtime memberi tahu dashboard tentang perubahan yang relevan.
5. Admin membuka detail pesanan dan memperbarui status.
6. Admin mengelola produk/stok.
7. Sistem memvalidasi dan menyimpan perubahan, lalu dashboard aktif menerima pembaruan.

---

## 4. Kebutuhan Non-Fungsional

### 4.1 Performa dan Real-time
- Halaman katalog harus menghindari pengambilan data yang tidak diperlukan dan menggunakan pagination atau batas hasil jika katalog membesar.
- Gunakan server-side rendering atau server components untuk data publik yang sesuai; interaktivitas keranjang dikelola pada client.
- Target awal untuk pembaruan realtime: ≤ 3 detik pada kondisi jaringan normal, dengan pengukuran dan pemantauan setelah deployment.
- Ringkasan dan grafik harus memakai query agregasi yang efisien.
- Indeks database perlu disediakan pada kolom yang sering dipakai untuk filter/sort, seperti nomor pesanan, status, tanggal dibuat, kategori, dan relasi foreign key.
- Tetapkan batas ukuran payload, pagination, dan timeout operasi.
- Optimalkan gambar produk dan gunakan caching dengan kebijakan yang tidak menampilkan stok/harga usang secara berlebihan.

### 4.2 Responsivitas dan Aksesibilitas
- Mendukung viewport mobile, tablet, dan desktop.
- Tata letak katalog, keranjang, checkout, invoice, tabel, dan grafik menyesuaikan ukuran layar.
- Tabel admin pada layar kecil dapat memakai scroll horizontal atau tampilan kartu yang tetap mempertahankan informasi penting.
- Semua form memiliki label, validasi, dan pesan error yang dapat dipahami.
- Kontrol interaktif dapat digunakan dengan keyboard dan memiliki fokus yang terlihat.
- Jangan hanya menggunakan warna untuk menyampaikan status.

### 4.3 Keamanan
- Aktifkan **Row Level Security (RLS)** pada seluruh tabel yang dapat diakses melalui Supabase API.
- Terapkan kebijakan RLS least-privilege; akses publik hanya untuk data katalog yang memang aman dipublikasikan.
- Jangan memberikan akses publik langsung untuk membaca seluruh pesanan atau data pelanggan.
- Checkout dilakukan melalui server action/Route Handler yang memvalidasi input atau fungsi database terkontrol; jangan mempercayai harga, total, role, maupun stok dari client.
- Gunakan transaksi database/RPC untuk membuat pesanan, item pesanan, dan mengurangi stok secara atomik.
- Gunakan `SUPABASE_SERVICE_ROLE_KEY` hanya pada lingkungan server tepercaya jika benar-benar diperlukan; jangan pernah memakai prefix `NEXT_PUBLIC_` untuk kunci rahasia.
- Validasi dan normalisasi input di server; lakukan escaping/output encoding sesuai konteks.
- Terapkan rate limiting untuk checkout dan pelacakan pesanan.
- Hindari kebocoran data pribadi pada URL, log, pesan error, atau analytics.
- Gunakan HTTPS melalui deployment Vercel dan cookie sesi yang aman.
- Batasi unggahan gambar (jika ada) berdasarkan tipe file, ukuran, dan akses Storage.
- Siapkan prosedur rotasi secret, backup, serta penanganan insiden.
- Untuk autentikasi admin, pertimbangkan MFA jika sesuai kebutuhan operasional.

### 4.4 Konsistensi Data dan Integritas
- Harga pesanan disalin sebagai snapshot ke `order_items` ketika checkout; perubahan harga produk berikutnya tidak mengubah invoice lama.
- Total pesanan dihitung dan diverifikasi di sisi server/database.
- Gunakan foreign key, constraint, dan tipe data yang sesuai.
- Simpan nominal uang sebagai integer dalam satuan terkecil mata uang (misalnya rupiah utuh jika tidak menggunakan pecahan) atau `numeric` yang sesuai; hindari floating point untuk uang.
- Gunakan operasi atomik untuk mengurangi stok dan mencegah stok negatif.
- Tentukan kebijakan kapan stok dikurangi (saat order dibuat atau saat diproses) dan kapan stok dikembalikan ketika pesanan dibatalkan.
- Gunakan waktu tersimpan yang konsisten (umumnya UTC) dan tampilkan sesuai zona waktu bisnis.

### 4.5 Reliabilitas dan Observabilitas
- UI harus menangani error jaringan, sesi kedaluwarsa, kegagalan checkout, dan disconnect realtime.
- Sediakan logging server tanpa menyimpan data pribadi berlebihan atau secret.
- Pantau error, latensi API, kegagalan checkout, dan koneksi realtime.
- Tentukan prosedur backup dan uji pemulihan database.
- Gunakan environment variable terpisah untuk development, preview, dan production.

### 4.6 SEO dan Metadata
- Halaman katalog publik menyediakan metadata judul/deskripsi yang sesuai.
- Halaman invoice/pelacakan tidak mengindeks informasi pesanan privat; gunakan metadata dan header yang sesuai, misalnya `noindex`.
- Pastikan data pribadi tidak masuk ke metadata atau Open Graph.

---

## 5. Rincian Arsitektur Tech Stack

### 5.1 Gambaran Arsitektur

```text
Browser (Guest / Admin)
        |
        | HTTPS
        v
Next.js App Router di Vercel
  - Public pages / Server Components
  - Client Components (cart, filters, charts)
  - Server Actions / Route Handlers
  - Validasi, otorisasi, dan logika checkout
        |
        | Supabase server/client SDK
        v
Supabase
  - PostgreSQL + constraints + RPC/transactions
  - Supabase Auth (admin)
  - Row Level Security (RLS)
  - Supabase Realtime (dashboard)
  - Supabase Storage (opsional: gambar produk)
```

### 5.2 Next.js App Router + TypeScript
- **App Router:** mengatur route publik, checkout, pelacakan, invoice, dan dashboard admin.
- **Server Components:** digunakan untuk merender data awal katalog dan halaman yang tidak memerlukan interaktivitas browser.
- **Client Components:** digunakan untuk keranjang, pencarian interaktif, filter, status koneksi realtime, dan Recharts.
- **Server Actions / Route Handlers:** menangani operasi sensitif seperti checkout, pembaruan status, dan pengelolaan stok. Validasi otorisasi dilakukan pada setiap operasi, bukan hanya di layout.
- **TypeScript:** menyediakan tipe untuk produk, pesanan, item pesanan, status, dan hasil operasi.
- **Validasi:** gunakan skema validasi (misalnya Zod) pada input client dan server; validasi server tetap menjadi sumber kebenaran.
- **Supabase SSR:** gunakan pola integrasi SSR resmi untuk sesi cookie dan akses data yang sesuai pada Server Components/Route Handlers.

### 5.3 Tailwind CSS
- Membangun desain responsif dengan utility classes.
- Menetapkan design tokens untuk warna, tipografi, jarak, border, dan status.
- Membuat komponen UI konsisten seperti tombol, input, badge status, modal konfirmasi, kartu statistik, tabel, dan empty state.
- Memastikan kontras warna, fokus keyboard, dan layout mobile.

### 5.4 Supabase PostgreSQL
PostgreSQL menjadi sumber data utama. Skema awal yang direkomendasikan:

#### `categories`
| Kolom | Tipe (saran) | Keterangan |
|---|---|---|
| `id` | `uuid` PK | ID kategori |
| `name` | `text` | Nama kategori |
| `slug` | `text` UNIQUE | Identitas URL |
| `is_active` | `boolean` | Kategori aktif |
| `created_at` | `timestamptz` | Waktu dibuat |

#### `products`
| Kolom | Tipe (saran) | Keterangan |
|---|---|---|
| `id` | `uuid` PK | ID produk |
| `category_id` | `uuid` FK | Relasi kategori |
| `name` | `text` | Nama produk |
| `slug` | `text` UNIQUE | Slug publik |
| `description` | `text` nullable | Deskripsi |
| `price` | `bigint` atau `numeric` | Harga, satuan uang yang disepakati |
| `stock_quantity` | `integer` | Stok tersedia, constraint ≥ 0 |
| `image_url` | `text` nullable | URL gambar |
| `is_active` | `boolean` | Status publikasi |
| `created_at` | `timestamptz` | Waktu dibuat |
| `updated_at` | `timestamptz` | Waktu diperbarui |

#### `admin_profiles`
| Kolom | Tipe (saran) | Keterangan |
|---|---|---|
| `user_id` | `uuid` PK/FK ke `auth.users` | Identitas admin |
| `role` | `text` | Role yang diizinkan, misalnya `admin` |
| `created_at` | `timestamptz` | Waktu dibuat |

Role admin harus diberikan melalui proses tepercaya. Jangan membuka izin pengguna untuk mengubah role mereka sendiri.

#### `orders`
| Kolom | Tipe (saran) | Keterangan |
|---|---|---|
| `id` | `uuid` PK | ID internal |
| `order_number` | `text` UNIQUE | Nomor pesanan publik |
| `tracking_token_hash` | `text` nullable | Hash token pelacakan jika memakai token rahasia |
| `customer_name` | `text` | Nama pelanggan |
| `customer_phone` | `text` | Nomor telepon |
| `customer_address` | `text` nullable | Alamat bila dibutuhkan |
| `status` | enum/text + constraint | Pending/Processing/Completed/Cancelled |
| `subtotal` | `bigint` atau `numeric` | Snapshot subtotal |
| `total` | `bigint` atau `numeric` | Snapshot total |
| `created_at` | `timestamptz` | Waktu dibuat |
| `updated_at` | `timestamptz` | Waktu diperbarui |
| `completed_at` | `timestamptz` nullable | Waktu selesai, bila relevan |
| `cancelled_at` | `timestamptz` nullable | Waktu dibatalkan, bila relevan |

#### `order_items`
| Kolom | Tipe (saran) | Keterangan |
|---|---|---|
| `id` | `uuid` PK | ID item |
| `order_id` | `uuid` FK | Relasi pesanan |
| `product_id` | `uuid` FK nullable | Relasi produk jika masih tersedia |
| `product_name_snapshot` | `text` | Nama saat transaksi |
| `unit_price_snapshot` | `bigint` atau `numeric` | Harga satuan saat transaksi |
| `quantity` | `integer` | Kuantitas, constraint > 0 |
| `line_total` | `bigint` atau `numeric` | Subtotal item |

#### `order_status_history` (direkomendasikan)
| Kolom | Tipe (saran) | Keterangan |
|---|---|---|
| `id` | `uuid` PK | ID histori |
| `order_id` | `uuid` FK | Pesanan |
| `old_status` | `text` nullable | Status sebelumnya |
| `new_status` | `text` | Status baru |
| `changed_by` | `uuid` nullable | ID admin |
| `note` | `text` nullable | Catatan perubahan |
| `created_at` | `timestamptz` | Waktu perubahan |

**Catatan desain database**
- Tambahkan indeks pada `orders(order_number)`, `orders(status, created_at)`, `order_items(order_id)`, `products(category_id, is_active)`, dan kolom pencarian yang sesuai.
- `order_number` harus unik dan dibuat oleh database/server.
- Tambahkan constraint status yang valid, kuantitas positif, harga nonnegatif, dan stok nonnegatif.
- Pertimbangkan tabel `inventory_movements` untuk audit perubahan stok.
- Tentukan retensi dan perlindungan data pelanggan sesuai kebutuhan bisnis dan peraturan yang berlaku.
- Hindari memberikan hak `SELECT` publik pada tabel `orders` dan `order_items`.

### 5.5 Supabase Auth, RLS, dan Realtime
- **Auth:** digunakan untuk login admin, bukan pelanggan.
- **RLS:** mengatur akses per tabel dan menjadi lapisan otorisasi database.
- **Realtime:** aktifkan publikasi/fitur Realtime hanya untuk tabel dan event yang dibutuhkan. Pastikan kebijakan akses tidak memungkinkan pengguna publik menerima event berisi data pesanan privat.
- **Pola yang disarankan:** dashboard admin berlangganan menggunakan sesi admin yang tervalidasi dan policy yang sesuai. Pelacakan pelanggan menggunakan endpoint server yang mengembalikan data terbatas setelah token pelacakan divalidasi, bukan subscription publik ke seluruh tabel pesanan.
- **RPC/transaksi:** buat fungsi database terkontrol untuk checkout atomik dan perubahan stok/status yang membutuhkan konsistensi kuat.
- **Storage:** opsional untuk gambar produk dengan bucket dan kebijakan akses yang sesuai.

### 5.6 Recharts
- Digunakan pada Client Components untuk menggambar grafik.
- Data grafik diambil dari query agregasi server/database berdasarkan rentang tanggal.
- Komponen grafik harus responsif, menampilkan tooltip dan label yang jelas, serta menangani data kosong.
- Jangan mengirim semua baris transaksi ke browser hanya untuk menghitung agregasi.

### 5.7 Vercel
- Menjadi platform deployment Next.js.
- Gunakan environment variable terpisah untuk Development, Preview, dan Production.
- Variabel contoh:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` atau publishable key sesuai konfigurasi proyek
  - `SUPABASE_SERVICE_ROLE_KEY` hanya bila diperlukan di server; rahasia dan tidak boleh memakai prefix `NEXT_PUBLIC_`
- Aktifkan HTTPS dan gunakan preview deployment untuk pengujian sebelum rilis production.
- Pastikan migrasi database dikelola melalui workflow yang terkontrol dan tidak dijalankan secara tidak sengaja dari setiap request aplikasi.
- Siapkan domain, monitoring, dan prosedur rollback.

### 5.8 Struktur Route yang Disarankan

```text
app/
  (store)/
    page.tsx                    # Katalog
    products/[slug]/page.tsx    # Detail produk (opsional)
    cart/page.tsx               # Keranjang
    checkout/page.tsx           # Form checkout
    checkout/success/page.tsx   # Konfirmasi pesanan
    invoice/[orderNumber]/page.tsx
    track-order/page.tsx
  admin/
    login/page.tsx
    (protected)/
      layout.tsx
      dashboard/page.tsx
      orders/page.tsx
      orders/[id]/page.tsx
      products/page.tsx
      products/new/page.tsx
      products/[id]/edit/page.tsx
  api/
    checkout/route.ts            # Contoh endpoint checkout
    orders/track/route.ts        # Pelacakan terbatas
    admin/                       # Endpoint admin bila diperlukan
lib/
  supabase/
    client.ts
    server.ts
  validations/
  auth/
  services/
  utils/
components/
  products/
  cart/
  checkout/
  admin/
  charts/
```

Struktur ini bersifat rekomendasi dan dapat disesuaikan. Hindari menaruh seluruh logika bisnis di komponen UI.

### 5.9 Alur Checkout Aman (Rekomendasi Teknis)

1. Browser mengirim daftar `product_id`, `quantity`, data pelanggan, dan idempotency key.
2. Server memvalidasi bentuk input dan batas kuantitas.
3. Server/database membaca harga dan status produk dari sumber tepercaya.
4. Operasi database memeriksa serta mengurangi stok secara atomik, menghitung total, membuat `orders` dan `order_items`, dan menyimpan snapshot harga/nama.
5. Jika salah satu langkah gagal, transaksi dibatalkan seluruhnya.
6. Server mengembalikan nomor pesanan dan token pelacakan rahasia (jika digunakan) hanya kepada pemesan.
7. Halaman sukses menampilkan invoice berdasarkan data pesanan yang sudah tersimpan.

Jangan mengimplementasikan pengurangan stok sebagai rangkaian query terpisah yang rentan terhadap dua checkout bersamaan.

### 5.10 Status Pesanan dan Kebijakan Stok

Status yang didukung:
- `Pending`
- `Processing`
- `Completed`
- `Cancelled`

Sebelum implementasi, tetapkan aturan bisnis berikut:
- Kapan stok dikurangi: ketika checkout berhasil atau ketika admin memproses pesanan.
- Apakah pembatalan mengembalikan stok dan dalam kondisi apa.
- Apakah pesanan Completed boleh dibatalkan.
- Apakah status pembayaran terpisah dari status pemenuhan pesanan.

Rekomendasi awal untuk MVP tanpa payment gateway: kurangi stok saat pesanan berhasil dibuat; jika pesanan dibatalkan, kembalikan stok satu kali melalui operasi atomik yang terlindungi dari pemrosesan ganda.

---

## 6. Kriteria Penerimaan MVP

MVP dapat dinyatakan siap untuk UAT apabila:

1. Pelanggan dapat melihat, mencari, dan memfilter produk aktif.
2. Pelanggan dapat memasukkan minimal dua jenis produk ke keranjang dan mengubah kuantitas.
3. Pelanggan dapat checkout tanpa login dan mendapatkan nomor pesanan unik.
4. Total dihitung ulang di server dan stok tidak menjadi negatif pada checkout bersamaan.
5. Invoice memuat detail pesanan yang benar dan dapat dicetak/disimpan sebagai PDF.
6. Pelanggan dapat melacak status tanpa melihat pesanan lain.
7. Admin dapat login dengan Supabase Auth dan route admin terlindungi oleh verifikasi sesi serta role.
8. Admin dapat melihat summary cards, tabel transaksi, dan grafik.
9. Pesanan baru dan perubahan status tampil pada dashboard aktif secara real-time atau setelah mekanisme reconnect/refetch.
10. Admin dapat mengubah status dengan validasi transisi dan mengelola stok.
11. Kebijakan RLS diuji untuk anon, pengguna terautentikasi non-admin, dan admin.
12. Layout utama dapat digunakan pada mobile, tablet, dan desktop.
13. Error, loading, empty state, dan koneksi realtime terputus ditangani dengan jelas.
14. Tidak ada secret server yang terekspos pada bundle client, repository, atau log.

---

## 7. Risiko, Ketergantungan, dan Keputusan yang Perlu Dikonfirmasi

| Area | Risiko / keputusan | Rekomendasi awal |
|---|---|---|
| Pembayaran | Tanpa payment gateway, status order bukan bukti pembayaran | Pisahkan status pesanan dan pembayaran bila pembayaran ditambahkan |
| Stok | Checkout bersamaan dapat menyebabkan overselling | Transaksi/RPC atomik dan constraint stok |
| Privasi | Nomor pesanan dapat ditebak jika format sederhana | Gunakan nomor acak dan token pelacakan rahasia |
| Real-time | Event dapat terlewat ketika koneksi putus | Reconnect lalu refetch data kanonis |
| Omzet | Definisi penjualan bisa berbeda | Hitung dari status yang disepakati, misalnya Completed |
| Pembatalan | Pengembalian stok dapat terjadi dua kali | Proses idempotent dan audit perubahan stok |
| Data pelanggan | Data kontak/alamat perlu perlindungan | Minimalkan pengumpulan dan batasi retensi/akses |
| Gambar produk | URL gambar dapat rusak atau tidak aman | Gunakan Supabase Storage atau sumber gambar tepercaya |
| Admin | Role dapat disalahgunakan jika dapat diubah client | Role dikelola oleh proses tepercaya dan diproteksi RLS |

---

## 8. Rencana Implementasi Tingkat Tinggi

### Fase 1 — Fondasi
- Setup Next.js, TypeScript, Tailwind CSS, Supabase, dan Vercel.
- Definisikan skema database, constraint, indeks, dan migrasi.
- Konfigurasikan RLS dan lingkungan development/preview/production.

### Fase 2 — Katalog dan Keranjang
- Bangun katalog, pencarian, filter kategori, serta komponen produk.
- Implementasikan keranjang multi-produk dan penyimpanan sementara di browser.
- Tambahkan validasi ketersediaan stok.

### Fase 3 — Checkout, Invoice, dan Tracking
- Implementasikan checkout atomik dan idempotency.
- Buat nomor pesanan serta token pelacakan.
- Buat invoice digital, print stylesheet, dan halaman pelacakan.

### Fase 4 — Admin Dashboard
- Implementasikan login Supabase Auth dan pemeriksaan role.
- Bangun tabel transaksi, filter, pagination, summary cards, dan grafik Recharts.
- Implementasikan perubahan status, histori, dan manajemen produk/stok.

### Fase 5 — Real-time, QA, dan Deployment
- Aktifkan dan uji Supabase Realtime.
- Uji keamanan RLS, akses non-admin, checkout bersamaan, dan pemulihan koneksi.
- Lakukan pengujian responsif, aksesibilitas dasar, dan UAT.
- Deploy ke Vercel, konfigurasi domain/secret, monitoring, serta prosedur rollback.

---

## 9. Ringkasan Keputusan Produk

- **Pelanggan:** guest checkout, keranjang multi-produk, invoice digital, dan pelacakan status.
- **Admin:** autentikasi Supabase Auth, dashboard transaksi real-time, statistik, grafik, manajemen status, dan stok.
- **Sumber data utama:** Supabase PostgreSQL.
- **Keamanan:** validasi server, transaksi atomik, RLS, role admin yang tepercaya, dan pelacakan dengan akses terbatas.
- **Deployment:** Vercel untuk Next.js dengan environment variable terpisah.
- **Batasan MVP:** pembayaran online dan integrasi pengiriman belum termasuk kecuali diputuskan sebagai kebutuhan tambahan.

Dokumen ini menjadi dasar diskusi produk, desain teknis, estimasi pekerjaan, dan penyusunan backlog. Sebelum implementasi, keputusan bisnis tentang pembayaran, aturan stok, definisi omzet, dan data checkout wajib dikonfirmasi.
