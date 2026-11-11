# Personal Finance Tracker API

Backend pengelolaan keuangan pribadi (NestJS + TypeORM + PostgreSQL) dengan 5 entitas: Users, Accounts, Categories, Transactions, Budgets.

Dokumentasi endpoint: [API-SPEC.md](./API-SPEC.md)

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

```
copy .env.example .env
```

Isi `.env`:

```
PORT=3000
NODE_ENV=development

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

PostgreSQL berjalan di port `5433` dan database `personal_finance_db` dibuat otomatis.

## 4. Pembuatan Tabel Database

Tabel dibuat otomatis oleh TypeORM saat aplikasi dijalankan pertama kali (`synchronize: true` di `app.module.ts`), jadi tidak perlu menjalankan migration manual.

Setelah aplikasi berjalan, cek tabel `users`, `accounts`, `categories`, `transactions`, dan `budgets` di DBeaver/HeidiSQL (host `localhost`, port `5433`).

## 5. Menjalankan Aplikasi

```
npm run start:dev
```

Aplikasi berjalan di `http://localhost:3000`.

```
npm run build
npm run start:prod
```

## Desain Database

### Relasi

| Parent | Child | Relasi | Foreign key |
|---|---|---|---|
| users | accounts | One-to-Many | user_id |
| users | budgets | One-to-Many | user_id |
| accounts | transactions | One-to-Many | account_id |
| categories | transactions | One-to-Many | category_id |
| categories | budgets | One-to-Many | category_id |

### Aturan Bisnis

- Transaksi dicatat di satu tabel `transactions`. Jenis ditentukan kolom `type`: `income` (pemasukan) atau `outcome` (pengeluaran). `amount` selalu positif.
- `type` transaksi harus sama dengan `type` kategorinya.
- Budget hanya boleh untuk kategori `outcome`, dengan `end_date` tidak sebelum `start_date`.
- Realisasi anggaran tidak disimpan, tetapi dihitung dari transaksi:

```
realisasi = SUM(transactions.amount)
            WHERE type = 'outcome'
            AND category_id = budget.category_id
            AND transaction_date BETWEEN budget.start_date AND budget.end_date
            AND akun milik user yang sama dengan budget.user_id

sisa = budget.amount - realisasi
```

- Penghapusan memakai soft delete (kolom `deleted_at`).

## Pembagian Tugas

| Anggota | Entity |
|---|---|
| Vaena | users, accounts |
| Nissa | categories |
| Naela | transactions |
| Nares | budgets |

## Alur Git

```
git checkout main
git pull origin main
git checkout -b nama-fitur
git add .
git commit -m "pesan"
git push -u origin nama-fitur
```

Gabungkan lewat Pull Request. Jangan commit `.env`.
