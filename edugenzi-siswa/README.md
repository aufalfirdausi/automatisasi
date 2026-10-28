# Sistem Administrasi Siswa Edugenzi

Prototype internal berbasis Google Apps Script.

## Teknologi

- HTML
- CSS
- JavaScript
- Google Apps Script
- Google Sheets
- Google Drive

## Akun prototype

- Username: `AdminEdugenzi`
- Password: `Admin123`

Ganti kredensial sebelum penggunaan nyata. Prototype ini memakai login custom sederhana dan belum cocok untuk keamanan produksi.

## Fitur MVP

- Login admin
- Tambah data siswa
- NIS otomatis berdasarkan program kelas dan nomor urut dua digit
- Pembuatan satu surat PDF dummy per siswa
- Folder arsip siswa di Google Drive
- Pencarian siswa
- Tautan lihat dokumen
- Status dan pesan error

## Format NIS

```text
{kode program}{nomor urut 2 digit}
```

Contoh:

```text
CD01
DSG02
PB01
```

## Instalasi

1. Buat Google Spreadsheet kosong.
2. Buka **Extensions → Apps Script**.
3. Buat file `Code.gs`, `Index.html`, `styles.html`, dan `scripts.html`.
4. Salin isi folder `appsscript/` ke file sesuai nama.
5. Jalankan fungsi `setup()` sekali.
6. Beri izin yang diminta.
7. Pilih **Deploy → New deployment → Web app**.
8. Jalankan sebagai akun pemilik script.
9. Batasi akses sesuai akun internal.

## Catatan

Prototype menyimpan password di kode. Gunakan hanya untuk percobaan dummy. Untuk produksi, ganti dengan login Google Workspace atau mekanisme autentikasi yang disetujui Edugenzi.
