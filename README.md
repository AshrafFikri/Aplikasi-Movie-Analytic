Aplikasi-Movie-Analytic
Movie dashboard analytic apps merupakan aplikasi web full stack untuk mengelola dan menganalisis data film dengan visualisasi interaktif. Aplikasi ini mengintegrasikan data dari The Movie Database (TMDB) API dan menyediakan antarmuka yang user-friendly untuk operasi CRUD serta analitik data real-time.

Fronted

Dashboard dengan Pie Chart & Bar Chart
CRUD Movies (Create, Read, Update, Delete)
Filter & Search
Sorting setiap kolom
Date range filter
Responsive design
Tech Stack

React 18
Tailwind CSS
Recharts
Lucide React Icons
Instalasi

npm install
npm start
Movie Dashboard Analytic akan berjalan di http://localhost:3000

API Endpoints

GET /api/movies - Get all movies
GET /api/movies/:id - Get single movie
POST /api/movies - Create movie
PUT /api/movies/:id - Update movie
DELETE /api/movies/:id - Delete movie
POST /api/sync - Sync from TMDB
GET /api/health - Health che
Fitur dan Ketentuan Pada Aplikasi Movie Analytic

KONSUMSI API PUBLIK & PENYIMPANAN DATA
Aplikasi wajib mengonsumsi minimal satu API publik.
Data hasil konsumsi API harus disimpan ke dalam database.
Setiap data wajib memiliki:
Tanggal (tanggal rilis, dibuat, atau diambil).
Kategori yang relevan dengan jenis data. Contoh:
Data orang: pekerjaan, gender, dll.
Data film: genre.
Struktur data harus konsisten dan dapat dikembangkan.
MENU MANAJEMEN DATA & FITUR SYNC
Sediakan menu khusus untuk manajemen data.
Tambahkan fitur sinkronisasi (Sync) ke API publik dengan ketentuan:
Tersedia tombol/aksi Sync Data.
Mengambil data terbaru dari API publik.
Update data jika berubah dan hindari duplikasi.
Catat dan tampilkan waktu terakhir sinkronisasi (last sync time).
FITUR MANAJEMEN DATA (CRUD)
Data ditampilkan dalam bentuk tabel.
Default sorting berdasarkan last updated.
Fitur wajib:
Create, Read, Update, Delete (satuan).
Fitur tambahan:
Pencarian.
Sorting setiap kolom.
Filtering setiap kolom.
DASHBOARD Data Dashboard menampilkan ringkasan data dari API publik.
Terpisah dari halaman manajemen data.
VISUALISASI DATA
Pie Chart: distribusi data berdasarkan kategori.
Column Chart: agregasi data per tanggal.
Data ditampilkan untuk 1 bulan terakhir.
FILTER TANGGAL
Filter tanggal (date range) memengaruhi seluruh chart.
Fitur TAMBAH
Chart analitik tambahan.
Ringkasan data (total, kategori terbanyak, data terbaru).
Optimasi performa.
 
