export async function createSpreadsheet(accessToken: string, title: string) {
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: 'Absensi',
          }
        },
        {
          properties: {
            title: 'Checklist Piket',
          }
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error('Gagal membuat spreadsheet baru');
  }

  const data = await response.json();
  return data.spreadsheetId;
}

export async function initSpreadsheetHeaders(accessToken: string, spreadsheetId: string) {
  // Headers for Absensi
  await appendRow(accessToken, spreadsheetId, 'Absensi', [
    'Tanggal', 'Waktu', 'Sakit', 'Izin', 'Alpa', 'Catatan Tambahan', 'Kas Belum Lunas', 'Submitter'
  ]);

  // Headers for Checklist
  await appendRow(accessToken, spreadsheetId, 'Checklist Piket', [
    'Tanggal', 'Waktu', 'Kebersihan', 'Spidol', 'Papan Tulis', 'Atribut Lainnya', 'Catatan', 'Submitter'
  ]);
}

export async function appendRow(accessToken: string, spreadsheetId: string, sheetName: string, values: any[]) {
  const range = `${sheetName}!A1:Z`;
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [values]
    })
  });

  if (!response.ok) {
    const err = await response.json();
    console.error("Sheets API Error:", err);
    throw new Error(`Gagal menyimpan data ke sheet ${sheetName}`);
  }

  return response.json();
}

export async function readSheet(accessToken: string, spreadsheetId: string, sheetName: string, rangeStr: string = 'A1:Z') {
  const range = `${sheetName}!${rangeStr}`;
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    }
  });

  if (!response.ok) {
    const err = await response.json();
    console.error("Sheets API Read Error:", err);
    throw new Error(`Gagal membaca data dari sheet ${sheetName}`);
  }

  const data = await response.json();
  return data.values || [];
}
