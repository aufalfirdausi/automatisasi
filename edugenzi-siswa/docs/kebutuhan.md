# Kebutuhan Prototype

## Tujuan
Menguji alur administrasi siswa: input data, pembuatan NIS, pembuatan satu surat PDF, arsip Drive, serta pencarian dan pembukaan dokumen dari web.

## Pengguna
- Admin internal.

## Data siswa
- Nama siswa
- Jenis kelamin
- Nama orang tua
- Nomor WhatsApp orang tua
- Program kelas

## Program dan kode NIS
| Program | Kode |
|---|---|
| Coding | CD |
| Design | DSG |
| Public Speaking | PB |

NIS prototype: kode program + nomor urut dua digit, dimulai dari 01 dan dihitung terpisah untuk tiap program. Contoh: `CD01`, `DSG01`, `PB01`.

## Fitur MVP
1. Login admin prototype.
2. Tambah data siswa.
3. Validasi seluruh field.
4. Penomoran NIS otomatis dengan penguncian saat penyimpanan.
5. Pembuatan folder arsip per siswa.
6. Pembuatan satu surat PDF dummy per siswa.
7. Penyimpanan URL PDF di Google Sheets.
8. Daftar dan pencarian siswa.
9. Tautan untuk membuka PDF.
10. Penanganan kesalahan dasar.

## Struktur data
Sheet `Siswa` berisi: NIS, Nama Siswa, Jenis Kelamin, Nama Orang Tua, No WhatsApp Orang Tua, Program Kelas, File Surat, Dibuat Pada.

## Struktur Drive
```text
Arsip Administrasi Siswa - Edugenzi/
└── {NIS}_{Nama_Siswa}/
    └── Surat_{NIS}.pdf
```

## Surat dummy
Satu surat berjudul “Surat Penerimaan dan Komitmen Orang Tua”. Surat mencantumkan data siswa, NIS, program, dan nama orang tua. Surat menyatakan dengan jelas bahwa dokumen dummy bukan dokumen resmi dan belum disahkan Edugenzi.

## Batasan dan keamanan
- Gunakan hanya data dummy untuk prototype.
- Login custom dengan kredensial di source code hanya untuk demo; bukan autentikasi aman untuk penggunaan nyata.
- File Drive dibuat oleh akun pemilik script. Hak akses file mengikuti izin Drive akun tersebut.
- Jangan mengatur dokumen sensitif menjadi publik.
- Untuk penggunaan nyata, ganti login prototype dengan akses Google Workspace atau autentikasi yang disetujui Edugenzi, dan gunakan akun Workspace resmi.
- Nomor urut dimulai dari 01 per program; belum menerapkan tahun pada NIS.
- Sistem tidak mengirim email.
