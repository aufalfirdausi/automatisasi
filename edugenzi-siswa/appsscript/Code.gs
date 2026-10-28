const CONFIG = {
  spreadsheetName: 'Edugenzi - Administrasi Siswa',
  rootFolderName: 'Arsip Administrasi Siswa - Edugenzi',
  sheetName: 'Siswa',
  username: 'AdminEdugenzi',
  password: 'Admin123', // Dummy prototype only. Replace before real use.
  sessionTtlSeconds: 21600,
  programs: { coding: 'CD', design: 'DSG', publicspeaking: 'PB' },
};

const HEADERS = [
  'NIS', 'Nama Siswa', 'Jenis Kelamin', 'Nama Orang Tua',
  'No WhatsApp Orang Tua', 'Program Kelas', 'File Surat', 'Dibuat Pada',
];

function doGet() {
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle('Administrasi Siswa Edugenzi')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// Run once from the Apps Script editor while bound to a Google Spreadsheet.
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Buat atau buka Google Spreadsheet, lalu pilih Extensions → Apps Script.');
  let sheet = ss.getSheetByName(CONFIG.sheetName);
  if (!sheet) sheet = ss.insertSheet(CONFIG.sheetName);
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('ROOT_FOLDER_ID')) {
    const folder = DriveApp.createFolder(CONFIG.rootFolderName);
    props.setProperty('ROOT_FOLDER_ID', folder.getId());
  }
  return 'Setup selesai. Spreadsheet dan folder arsip siap.';
}

function login(username, password) {
  if (username !== CONFIG.username || password !== CONFIG.password) {
    throw new Error('Nama pengguna atau password salah.');
  }
  const token = Utilities.getUuid();
  CacheService.getScriptCache().put('session:' + token, 'admin', CONFIG.sessionTtlSeconds);
  return { token: token, username: CONFIG.username };
}

function logout(token) {
  if (token) CacheService.getScriptCache().remove('session:' + token);
  return true;
}

function listStudents(token, query) {
  requireSession_(token);
  const sheet = getSheet_();
  if (sheet.getLastRow() < 2) return [];
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length).getDisplayValues();
  const q = String(query || '').trim().toLowerCase();
  return rows.filter(row => !q || row.slice(0, 6).join(' ').toLowerCase().includes(q))
    .reverse()
    .map(row => ({ nis: row[0], name: row[1], gender: row[2], parent: row[3], whatsapp: row[4], program: row[5], fileUrl: row[6], createdAt: row[7] }));
}

function addStudent(token, input) {
  requireSession_(token);
  const data = validateStudent_(input);
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sheet = getSheet_();
    const code = CONFIG.programs[data.program];
    const lastRow = sheet.getLastRow();
    let max = 0;
    if (lastRow >= 2) {
      sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues().flat().forEach(nis => {
        const match = String(nis).match(new RegExp('^' + code + '(\\d+)$'));
        if (match) max = Math.max(max, Number(match[1]));
      });
    }
    const nis = code + String(max + 1).padStart(2, '0');
    const root = DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty('ROOT_FOLDER_ID'));
    const studentFolder = root.createFolder(nis + '_' + safeName_(data.name));
    const pdf = createLetterPdf_(data, nis, studentFolder);
    sheet.appendRow([nis, data.name, data.gender, data.parent, data.whatsapp, data.program, pdf.getUrl(), new Date()]);
    return { nis: nis, fileUrl: pdf.getUrl(), message: 'Siswa dan surat berhasil dibuat.' };
  } finally {
    lock.releaseLock();
  }
}

function requireSession_(token) {
  if (!token || CacheService.getScriptCache().get('session:' + token) !== 'admin') {
    throw new Error('Sesi berakhir. Silakan masuk kembali.');
  }
}

function getSheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('Setup belum dijalankan. Jalankan fungsi setup() di Apps Script.');
  const sheet = SpreadsheetApp.openById(id).getSheetByName(CONFIG.sheetName);
  if (!sheet) throw new Error('Sheet data tidak ditemukan. Jalankan setup() kembali.');
  return sheet;
}

function validateStudent_(input) {
  if (!input || typeof input !== 'object') throw new Error('Data siswa tidak valid.');
  const data = {
    name: String(input.name || '').trim(),
    gender: String(input.gender || '').trim(),
    parent: String(input.parent || '').trim(),
    whatsapp: String(input.whatsapp || '').trim(),
    program: String(input.program || '').trim(),
  };
  if (Object.values(data).some(value => !value)) throw new Error('Semua kolom wajib diisi.');
  if (!['Laki-laki', 'Perempuan'].includes(data.gender)) throw new Error('Jenis kelamin tidak valid.');
  if (!Object.hasOwn(CONFIG.programs, data.program)) throw new Error('Program kelas tidak valid.');
  if (data.name.length > 100 || data.parent.length > 100) throw new Error('Nama maksimal 100 karakter.');
  if (!/^[+0-9 ()-]{8,20}$/.test(data.whatsapp)) throw new Error('Nomor WhatsApp tidak valid.');
  return data;
}

function createLetterPdf_(data, nis, folder) {
  const doc = DocumentApp.create('Surat Administrasi - ' + nis);
  const body = doc.getBody();
  body.appendParagraph('EDUGENZI').setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph('SURAT PENERIMAAN DAN KOMITMEN ORANG TUA').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph('Nomor Induk Siswa: ' + nis);
  body.appendParagraph('');
  body.appendParagraph('Dengan ini kami mencatat data siswa berikut:');
  body.appendParagraph('Nama siswa: ' + data.name);
  body.appendParagraph('Jenis kelamin: ' + data.gender);
  body.appendParagraph('Nama orang tua: ' + data.parent);
  body.appendParagraph('Nomor WhatsApp orang tua: ' + data.whatsapp);
  body.appendParagraph('Program kelas: ' + programLabel_(data.program));
  body.appendParagraph('');
  body.appendParagraph('Surat dummy untuk uji coba sistem. Bukan dokumen resmi dan belum disahkan Edugenzi.');
  body.appendParagraph('');
  body.appendParagraph('Orang tua/wali,');
  body.appendParagraph('');
  body.appendParagraph('________________________');
  body.appendParagraph(data.parent);
  doc.saveAndClose();
  const file = DriveApp.getFileById(doc.getId());
  const pdf = folder.createFile(file.getBlob().getAs(MimeType.PDF).setName('Surat_' + nis + '.pdf'));
  file.setTrashed(true);
  return pdf;
}

function programLabel_(key) {
  return { coding: 'Coding', design: 'Design', publicspeaking: 'Public Speaking' }[key];
}

function safeName_(value) {
  return value.replace(/[\\/:*?"<>|#%{}~&]/g, '').replace(/\s+/g, '_').slice(0, 70) || 'Siswa';
}
