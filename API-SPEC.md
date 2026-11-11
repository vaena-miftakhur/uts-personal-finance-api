# API Specification: Personal Finance Tracker

Base URL: `http://localhost:3000`
Format: JSON (`Content-Type: application/json`)

## Format Error

```json
{ "message": "Akun <id> tidak ditemukan", "error": "Not Found", "statusCode": 404 }
```

Untuk 400 karena validasi DTO, `message` berupa daftar pesan.

## Ringkasan Endpoint

| Entitas | Endpoint |
|---|---|
| Users | POST, GET, GET/:id, PUT/:id, DELETE/:id `/users` |
| Accounts | POST, GET, GET/:id, PUT/:id, DELETE/:id `/accounts` |
| Categories | POST, GET, GET/:id, PUT/:id, DELETE/:id `/categories` |
| Transactions | POST, GET, GET/:id, PATCH/:id, DELETE/:id, GET `/summary` |
| Budgets | POST, GET, GET/:id, PUT/:id, DELETE/:id, GET `/:id/summary` |

Semua DELETE adalah soft delete (kolom `deleted_at` terisi) dan mengembalikan:

```json
{ "message": "<Entitas> <id> berhasil dihapus", "deletedId": "<id>" }
```

---

## USERS

### POST /users
Membuat user. Password disimpan sebagai hash (bcrypt).

| Field | Tipe | Wajib | Aturan |
|---|---|---|---|
| name | string | Ya | maks 100 karakter |
| email | string | Ya | format email, maks 100, unik |
| password | string | Ya | minimal 6 karakter |

```json
{ "name": "Vina", "email": "vina@gmail.com", "password": "123456" }
```

**Response 201**
```json
{ "id": "uuid", "name": "Vina", "email": "vina@gmail.com", "createdAt": "...", "updatedAt": "..." }
```

| Status | Keterangan |
|---|---|
| 201 | Berhasil dibuat |
| 400 | Validasi gagal |
| 409 | Email sudah terdaftar |

### GET /users
Daftar user (tanpa password), urut terbaru. Status: **200**.

### GET /users/:id
| Status | Keterangan |
|---|---|
| 200 | Data user |
| 404 | User tidak ditemukan |

### PUT /users/:id
Mengubah user. Semua field wajib dikirim.

| Status | Keterangan |
|---|---|
| 200 | Berhasil diubah |
| 400 | Validasi gagal |
| 404 | User tidak ditemukan |
| 409 | Email dipakai user lain |

### DELETE /users/:id
| Status | Keterangan |
|---|---|
| 200 | Berhasil dihapus |
| 404 | User tidak ditemukan |

---

## ACCOUNTS

### POST /accounts

| Field | Tipe | Wajib | Aturan |
|---|---|---|---|
| user_id | string (UUID) | Ya | harus user yang ada |
| name | string | Ya | maks 100 karakter |
| type | string | Ya | `cash`, `bank`, atau `e-wallet` |
| balance | number | Tidak | min 0, maks 2 desimal, default 0 |

```json
{ "user_id": "uuid-user", "name": "BCA", "type": "bank", "balance": 5000000 }
```

| Status | Keterangan |
|---|---|
| 201 | Berhasil dibuat |
| 400 | Validasi gagal |
| 404 | User tidak ditemukan |

### GET /accounts
Daftar akun, urut terbaru. Status: **200**.

### GET /accounts/:id
| Status | Keterangan |
|---|---|
| 200 | Data akun |
| 404 | Akun tidak ditemukan |

### PUT /accounts/:id
`id` di URL adalah **id akun**. Semua field wajib dikirim.

| Status | Keterangan |
|---|---|
| 200 | Berhasil diubah |
| 400 | Validasi gagal |
| 404 | Akun atau user tidak ditemukan |

### DELETE /accounts/:id
| Status | Keterangan |
|---|---|
| 200 | Berhasil dihapus |
| 404 | Akun tidak ditemukan |

---

## CATEGORIES

### POST /categories

| Field | Tipe | Wajib | Aturan |
|---|---|---|---|
| name | string | Ya | maks 100 karakter |
| type | string | Ya | `income` atau `outcome` |

```json
{ "name": "Makanan", "type": "outcome" }
```

| Status | Keterangan |
|---|---|
| 201 | Berhasil dibuat |
| 400 | Validasi gagal (type bukan income/outcome) |
| 409 | Kombinasi name dan type sudah ada |

### GET /categories
Daftar kategori, urut terbaru. Status: **200**.

### GET /categories/:id
| Status | Keterangan |
|---|---|
| 200 | Data kategori |
| 404 | Kategori tidak ditemukan |

### PUT /categories/:id
Semua field wajib dikirim.

| Status | Keterangan |
|---|---|
| 200 | Berhasil diubah |
| 400 | Validasi gagal |
| 404 | Kategori tidak ditemukan |
| 409 | Kombinasi name dan type sudah ada |

### DELETE /categories/:id
| Status | Keterangan |
|---|---|
| 200 | Berhasil dihapus |
| 404 | Kategori tidak ditemukan |

---

## TRANSACTIONS

Pencatatan: satu tabel untuk pemasukan dan pengeluaran. Jenis ditentukan `type` (`income` / `outcome`), `amount` selalu positif. `type` transaksi harus sama dengan `type` kategori.

### POST /transactions

| Field | Tipe | Wajib | Aturan |
|---|---|---|---|
| accountsId | string (UUID) | Ya | harus akun yang ada |
| categoryId | string (UUID) | Ya | harus kategori yang ada |
| type | string | Ya | `income` atau `outcome`, sama dengan type kategori |
| amount | number | Ya | lebih dari 0 |
| transactionDate | string | Ya | format `YYYY-MM-DD` |
| description | string | Tidak | teks bebas |

```json
{
  "accountsId": "uuid-akun",
  "categoryId": "uuid-kategori",
  "type": "outcome",
  "amount": 50000,
  "transactionDate": "2026-11-10",
  "description": "Makan siang"
}
```

| Status | Keterangan |
|---|---|
| 201 | Berhasil dibuat |
| 400 | Validasi gagal, amount ≤ 0, atau type tidak sama dengan type kategori |
| 404 | Akun atau kategori tidak ditemukan |

### GET /transactions
Daftar transaksi beserta akun dan kategori, urut terbaru. Status: **200**.

### GET /transactions/:id
Detail transaksi.

| Status | Keterangan |
|---|---|
| 200 | Data transaksi |
| 404 | Transaksi tidak ditemukan |

### GET /transactions/summary
Ringkasan seluruh transaksi.

**Response 200**
```json
{ "totalIncome": 3000000, "totalOutcome": 50000, "balance": 2950000 }
```

### PATCH /transactions/:id
Mengubah sebagian field (semua field opsional, aturan sama dengan POST).

| Status | Keterangan |
|---|---|
| 200 | Berhasil diubah |
| 400 | Validasi gagal, amount ≤ 0, atau type tidak sama dengan kategori |
| 404 | Transaksi, akun, atau kategori tidak ditemukan |

### DELETE /transactions/:id
| Status | Keterangan |
|---|---|
| 200 | Berhasil dihapus |
| 404 | Transaksi tidak ditemukan |

---

## BUDGETS

Budget hanya untuk kategori `outcome`.

### POST /budgets

| Field | Tipe | Wajib | Aturan |
|---|---|---|---|
| userId | string (UUID) | Ya | harus user yang ada |
| categoryId | string (UUID) | Ya | kategori bertipe `outcome` |
| amount | number | Ya | lebih dari 0 |
| startDate | string | Ya | format `YYYY-MM-DD` |
| endDate | string | Ya | tidak boleh sebelum startDate |

```json
{
  "userId": "uuid-user",
  "categoryId": "uuid-kategori-outcome",
  "amount": 1000000,
  "startDate": "2026-11-01",
  "endDate": "2026-11-30"
}
```

| Status | Keterangan |
|---|---|
| 201 | Berhasil dibuat |
| 400 | Validasi gagal, amount ≤ 0, tanggal tidak valid, atau kategori bukan outcome |
| 404 | User atau kategori tidak ditemukan |

### GET /budgets
Daftar budget beserta user dan kategori, urut terbaru. Status: **200**.

### GET /budgets/:id
| Status | Keterangan |
|---|---|
| 200 | Data budget |
| 404 | Budget tidak ditemukan |

### PUT /budgets/:id
Mengubah budget (field opsional, aturan sama dengan POST).

| Status | Keterangan |
|---|---|
| 200 | Berhasil diubah |
| 400 | Validasi gagal |
| 404 | Budget, user, atau kategori tidak ditemukan |

### GET /budgets/:id/summary
Realisasi anggaran, dihitung dari transaksi `outcome` dengan kategori yang sama, tanggal di dalam periode budget, dan akun milik user budget.

```
realization = SUM(amount transaksi outcome sesuai kriteria)
remaining   = amount budget - realization
percentage  = realization / amount budget * 100
```

**Response 200**
```json
{
  "budgetId": "uuid",
  "userId": "uuid",
  "category": "Makanan",
  "totalBudget": 1000000,
  "realization": 50000,
  "remaining": 950000,
  "percentage": 5,
  "startDate": "2026-11-01",
  "endDate": "2026-11-30"
}
```

Jika belum ada transaksi, `realization` bernilai `0`.

| Status | Keterangan |
|---|---|
| 200 | Ringkasan realisasi |
| 404 | Budget tidak ditemukan |

### DELETE /budgets/:id
| Status | Keterangan |
|---|---|
| 200 | Berhasil dihapus |
| 404 | Budget tidak ditemukan |
