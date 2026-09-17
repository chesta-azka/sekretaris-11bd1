/**
 * Google Apps Script Reference for 11 BD 1 Attendance System
 * 
 * 1. Create a new Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Paste this code.
 * 4. Deploy > New Deployment > Web App.
 * 5. Execute as: Me, Access: Anyone.
 * 6. Copy the Web App URL and use it in your Next.js API route.
 */

const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE";
const ATTENDANCE_SHEET = "Kehadiran";
const READINESS_SHEET = "Kesiapan";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    if (data.type === "attendance") {
      const sheet = ss.getSheetByName(ATTENDANCE_SHEET) || ss.insertSheet(ATTENDANCE_SHEET);
      // Ensure headers exist
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["Timestamp", "Date", "Submitted By", "Total Kas", "Sakit", "Izin", "Alpa", "Notes Details"]);
      }
      
      const { date, submittedBy, kasTotal, records } = data.payload;
      
      // Calculate totals and names
      const getNames = (status) => records.filter(r => r.status === status).map(r => r.studentName).join(", ");
      const sakitNames = getNames("S");
      const izinNames = getNames("I");
      const alpaNames = getNames("A");
      const notes = records.filter(r => r.notes).map(r => `[${r.studentName}: ${r.notes}]`).join(" | ");

      sheet.appendRow([
        new Date().toISOString(),
        date,
        submittedBy,
        kasTotal,
        sakitNames || "-",
        izinNames || "-",
        alpaNames || "-",
        notes || "-"
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.type === "readiness") {
      const sheet = ss.getSheetByName(READINESS_SHEET) || ss.insertSheet(READINESS_SHEET);
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["Timestamp", "Date", "Cleanliness", "Markers", "Eraser", "Attributes", "Notes"]);
      }
      
      const { date, cleanliness, markers, eraser, attributes, notes } = data.payload;
      sheet.appendRow([
        new Date().toISOString(),
        date,
        cleanliness,
        markers,
        eraser,
        attributes,
        notes || "-"
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Invalid type" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
