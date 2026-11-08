# Personal Finance Tracker API

Backend pengelolaan keuangan pribadi (NestJS + TypeORM + PostgreSQL).

## Prasyarat

- Node.js 20+
- Docker dan Docker Compose
- Git

## 1. Instalasi Dependency

```
git clone https://github.com/vaena-miftakhur/uts-personal-finance-api.git
cd uts-personal-finance-api
npm install
```

## 2. Konfigurasi Environment

Salin `.env.example` menjadi `.env`, lalu isi nilainya:

```
copy .env.example .env
```

Isi `.env`:

```
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=rahasia
DB_DATABASE=personal_finance_db
```

Nilai harus sama dengan `docker-compose.yml`. File `.env` tidak ikut Git.

## 3. Menjalankan Database (Docker)

```
docker compose up -d
docker ps
```

Container PostgreSQL berjalan di port `5433` (host) dan database `personal_finance_db` dibuat otomatis.

## 4. Migrasi Database

Generate migration dari entity, lalu jalankan:

```
npm run build
npx typeorm migration:generate -d dist/data-source.js src/migrations/InitSchema
npm run build
npx typeorm migration:run -d dist/data-source.js
```

Batalkan migration terakhir (jika perlu):

```
npx typeorm migration:revert -d dist/data-source.js
```

Cek tabel di HeidiSQL/DBeaver (host `localhost`, port `5433`): `users`, `accounts`, `categories`, `transactions`, `budgets`.

## 5. Menjalankan Aplikasi

```
npm run start:dev
```

Aplikasi berjalan di `http://localhost:3000`.

Mode produksi:

```
npm run build
npm run start:prod
```

## Struktur Relasi

| Parent | Child | Relasi |
|---|---|---|
| users | accounts | One-to-Many |
| users | budgets | One-to-Many |
| accounts | transactions | One-to-Many |
| categories | transactions | One-to-Many |
| categories | budgets | One-to-Many |

## Aturan Bisnis

- Transaksi dicatat di satu tabel `transactions` dengan `type` = `income` / `expense`, `amount` selalu positif.
- Realisasi anggaran dihitung dari transaksi `expense` dengan kategori yang sama dan tanggal di dalam periode budget.
- Sisa anggaran = `budgets.amount` dikurangi realisasi.

### POST /users
Membuat user baru.

**Request body**
```json
{ "name": "Vina", "email": "vina@gmail.com", "password": "123456" }
```

**Response 201**
```json
{ "id": "uuid", "name": "Vina", "email": "vina@gmail.com" }
```

| Status | Keterangan |
|---|---|
| 201 | User berhasil dibuat |
| 400 | Validasi gagal (field kosong, email tidak valid) |
| 409 | Email sudah terdaftar |