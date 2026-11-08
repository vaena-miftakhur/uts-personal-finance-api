# API Specification: Personal Finance Tracker

Base URL: `http://localhost:3000`
Format: JSON (`Content-Type: application/json`)

## Format Error

```json
{ "message": "Akun <id> tidak ditemukan", "error": "Not Found", "statusCode": 404 }
```

Validasi gagal (400) berisi `message` berupa daftar pesan.

---

## USERS

### POST /users
Membuat user baru. Password disimpan dalam bentuk hash (bcrypt).

**Request body**

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
{
  "id": "uuid",
  "name": "Vina",
  "email": "vina@gmail.com",
  "createdAt": "2026-11-08T00:00:00.000Z",
  "updatedAt": "2026-11-08T00:00:00.000Z"
}
```

| Status | Keterangan |
|---|---|
| 201 | User berhasil dibuat |
| 400 | Validasi gagal |
| 409 | Email sudah terdaftar |

### GET /users
Menampilkan semua user (tanpa password), urut terbaru.

| Status | Keterangan |
|---|---|
| 200 | Array user |

### GET /users/:id

| Parameter | Lokasi | Keterangan |
|---|---|---|
| id | path | UUID user |

| Status | Keterangan |
|---|---|
| 200 | Data user |
| 404 | User tidak ditemukan |

### PUT /users/:id
Mengubah user. Semua field wajib dikirim (sama dengan POST).

| Status | Keterangan |
|---|---|
| 200 | User berhasil diubah |
| 400 | Validasi gagal |
| 404 | User tidak ditemukan |
| 409 | Email dipakai user lain |

### DELETE /users/:id
Soft delete (kolom `deleted_at` terisi).

**Response 200**
```json
{ "message": "User <id> berhasil dihapus", "deletedId": "<id>" }
```

| Status | Keterangan |
|---|---|
| 200 | Berhasil dihapus |
| 404 | User tidak ditemukan |

---

## ACCOUNTS

### POST /accounts
Membuat akun keuangan milik user.

**Request body**

| Field | Tipe | Wajib | Aturan |
|---|---|---|---|
| user_id | string (UUID) | Ya | harus user yang ada |
| name | string | Ya | maks 100 karakter |
| type | string | Ya | `cash`, `bank`, atau `e-wallet` |
| balance | number | Tidak | min 0, maks 2 desimal, default 0 |

```json
{ "user_id": "uuid-user", "name": "BCA", "type": "bank", "balance": 5000000 }
```

**Response 201**
```json
{
  "id": "uuid",
  "user_id": "uuid-user",
  "name": "BCA",
  "type": "bank",
  "balance": 5000000,
  "createdAt": "...",
  "updatedAt": "..."
}
```

| Status | Keterangan |
|---|---|
| 201 | Akun berhasil dibuat |
| 400 | Validasi gagal (field kosong, type tidak valid) |
| 404 | User tidak ditemukan |

### GET /accounts
| Status | Keterangan |
|---|---|
| 200 | Array akun, urut terbaru |

### GET /accounts/:id
| Status | Keterangan |
|---|---|
| 200 | Data akun |
| 404 | Akun tidak ditemukan |

### PUT /accounts/:id
Mengubah akun. Semua field wajib dikirim. `id` di URL adalah **id akun**, bukan id user.

| Status | Keterangan |
|---|---|
| 200 | Akun berhasil diubah |
| 400 | Validasi gagal |
| 404 | Akun atau user tidak ditemukan |

### DELETE /accounts/:id
Soft delete.

**Response 200**
```json
{ "message": "Akun <id> berhasil dihapus", "deletedId": "<id>" }
```

| Status | Keterangan |
|---|---|
| 200 | Berhasil dihapus |
| 404 | Akun tidak ditemukan |