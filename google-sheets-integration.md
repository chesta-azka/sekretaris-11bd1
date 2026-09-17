# Integrasi Google Sheets Tanpa Login OAuth (Public Web App)

Ya, **sangat bisa**! Anda tidak perlu meminta setiap pengguna (sekretaris pengganti atau teman) untuk login ke akun Google tertentu. Semua data dari perangkat mana pun atau akun mana pun bisa masuk ke **satu Google Sheet yang sama**.

Rahasianya ada pada fitur **Google Apps Script Web App** yang diatur sebagai `Execute as: Me` (Eksekusi sebagai pemilik file). Dengan cara ini, Google Script akan bertindak sebagai "pelayan" yang memasukkan data ke Sheet Anda, terlepas dari siapa yang mengirimkan datanya.

Berikut adalah panduan lengkapnya:

## Langkah 1: Persiapan Google Sheet
1. Buka [Google Sheets](https://sheets.new/) menggunakan akun utama Anda (akun admin kelas).
2. Beri nama file, misal: `Data Absensi 11 BD 1`.
3. Perhatikan **Spreadsheet ID** di URL. Contoh: `https://docs.google.com/spreadsheets/d/1ABC123xyz.../edit`, maka ID-nya adalah `1ABC123xyz...`.

## Langkah 2: Memasang Google Apps Script (Backend)
1. Di Google Sheet Anda, klik menu **Extensions (Ekstensi) > Apps Script**.
2. Hapus semua kode bawaan, lalu paste kode berikut:

```javascript
// GANTI DENGAN SPREADSHEET ID ANDA SENDIRI
const SPREADSHEET_ID = "MASUKKAN_SPREADSHEET_ID_DISINI";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // 1. Handle Absensi
    if (data.type === "attendance") {
      const sheet = ss.getSheetByName("Kehadiran") || ss.insertSheet("Kehadiran");
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["Timestamp", "Tanggal", "Pengirim", "Total Kas", "Sakit", "Izin", "Alpa", "Catatan"]);
      }
      
      const { date, submittedBy, kasTotal, records } = data.payload;
      const getNames = (status) => records.filter(r => r.status === status).map(r => r.studentName).join(", ");
      
      sheet.appendRow([
        new Date().toISOString(), date, submittedBy, kasTotal,
        getNames("S") || "-", getNames("I") || "-", getNames("A") || "-",
        records.filter(r => r.notes).map(r => `[${r.studentName}: ${r.notes}]`).join(" | ") || "-"
      ]);
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 2. Handle Kesiapan Kelas
    if (data.type === "readiness") {
      const sheet = ss.getSheetByName("Kesiapan") || ss.insertSheet("Kesiapan");
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["Timestamp", "Tanggal", "Kebersihan", "Spidol", "Penghapus", "Atribut", "Catatan"]);
      }
      
      const { date, cleanliness, markers, eraser, attributes, notes } = data.payload;
      sheet.appendRow([
        new Date().toISOString(), date, cleanliness, markers, eraser, attributes, notes || "-"
      ]);
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.message })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Langkah 3: Deploy & Dapatkan URL Web App (SANGAT PENTING)
Ini adalah langkah agar akun siapapun bisa mengirim data:
1. Klik tombol **Deploy** di sudut kanan atas > pilih **New deployment**.
2. Klik ikon gir (Settings) di sebelah "Select type" > pilih **Web app**.
3. Isi deskripsi (misal: "API Absensi V1").
4. **Execute as:** Pilih `Me (email-anda@gmail.com)`. *(Ini kuncinya!)*
5. **Who has access:** Pilih `Anyone`. *(Ini artinya web app Anda bisa menerima data dari siapapun tanpa harus login).*
6. Klik **Deploy**.
7. Jika diminta otorisasi, klik *Authorize access > pilih akun Google Anda > Advanced > Go to [Nama Script] (unsafe) > Allow*.
8. **Copy URL Web App** yang muncul (berakhiran `.../exec`).

## Langkah 4: Hubungkan ke Next.js (Frontend)
Di proyek Next.js kita, buka file `app/api/sync/route.ts` dan masukkan URL Web App yang baru saja Anda copy:

```typescript
// app/api/sync/route.ts
import { NextResponse } from "next/server";

// PASTE URL WEB APP ANDA DI SINI
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz_XXXXXXXXX/exec";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Teruskan data dari HP/Web ke Google Apps Script
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(data),
      // Mencegah error CORS
      headers: { "Content-Type": "text/plain;charset=utf-8" },
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("[SYNC] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to sync" }, { status: 500 });
  }
}
```

### Kesimpulan
Dengan arsitektur ini, aplikasi Next.js bertindak sebagai perantara (Proxy). Siapa pun yang membuka URL aplikasi absensi di HP mereka bisa langsung mengisi absen. Saat tombol "Simpan" ditekan, data dikirim ke API Route Next.js, lalu Next.js akan mengirimkannya ke Google Script. Karena Google Script diatur `Execute as: Me`, data tersebut akan ditulis ke Google Sheet Anda **tanpa** mengharuskan si pengguna HP untuk login akun Google tertentu.
