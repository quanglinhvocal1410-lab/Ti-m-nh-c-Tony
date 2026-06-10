// Database configuration
var SHEET_DB_KEY = "DB_SPREADSHEET_ID";

function getDbSpreadsheet() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty(SHEET_DB_KEY);
  if (id) {
    try {
      return SpreadsheetApp.openById(id);
    } catch (e) {
      // If deleted or no access, create a new one below
      Logger.log("Could not open existing spreadsheet: " + e.toString());
    }
  }
  
  // Create new DB Spreadsheet in Google Drive root
  var ss = SpreadsheetApp.create("Database_TiemDayNhacTony");
  props.setProperty(SHEET_DB_KEY, ss.getId());
  
  // Initialize sheets
  var sheet1 = ss.getSheets()[0];
  sheet1.setName("Students");
  
  var sheet2 = ss.insertSheet("Lessons");
  
  return ss;
}

function getSheetData(sheetName) {
  var ss = getDbSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return []; // Only headers or empty
  
  var headers = data[0];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var val = data[i][j];
      // Try parsing JSON if it looks like it
      if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
        try {
          val = JSON.parse(val);
        } catch(e) {}
      }
      obj[headers[j]] = val;
    }
    rows.push(obj);
  }
  return rows;
}

function generateId() {
  return Utilities.getUuid();
}

function saveToSheet(sheetName, obj, isUpdate) {
  var ss = getDbSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  
  var data = sheet.getDataRange().getValues();
  var headers = [];
  if (data.length > 0 && data[0].length > 0 && data[0][0] !== "") {
    headers = data[0];
  } else {
    // Initialize headers with _id
    headers = ['_id'];
  }
  
  // Add any new fields to headers
  var keys = Object.keys(obj);
  var headerChanged = false;
  for (var i = 0; i < keys.length; i++) {
    if (headers.indexOf(keys[i]) === -1) {
      headers.push(keys[i]);
      headerChanged = true;
    }
  }
  
  if (headerChanged || data.length === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  
  // Serialize complex objects to string
  var rowData = [];
  for (var i = 0; i < headers.length; i++) {
    var val = obj[headers[i]];
    if (val === undefined || val === null) {
      rowData.push("");
    } else if (typeof val === 'object') {
      rowData.push(JSON.stringify(val));
    } else if (val instanceof Date) {
      rowData.push(val.toISOString());
    } else {
      rowData.push(val);
    }
  }
  
  if (isUpdate) {
    var idIndex = headers.indexOf('_id');
    for (var r = 1; r < data.length; r++) {
      if (data[r][idIndex] === obj._id) {
        sheet.getRange(r + 1, 1, 1, headers.length).setValues([rowData]);
        return obj;
      }
    }
  }
  
  // Insert
  sheet.appendRow(rowData);
  return obj;
}

function deleteFromSheet(sheetName, id) {
  var ss = getDbSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;
  
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return;
  
  var headers = data[0];
  var idIndex = headers.indexOf('_id');
  if (idIndex === -1) return;
  
  for (var r = 1; r < data.length; r++) {
    if (data[r][idIndex] === id) {
      sheet.deleteRow(r + 1);
      return;
    }
  }
}

// ------------------------------------
// API Endpoints for Frontend
// ------------------------------------

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('Tiệm Dạy Nhạc Tony')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getActiveUserEmail() {
  try {
    return Session.getActiveUser().getEmail();
  } catch(e) {
    return "";
  }
}

function getStudents() {
  return JSON.stringify(getSheetData('Students'));
}

function getStudentById(id) {
  var students = getSheetData('Students');
  var student = students.find(function(s) { return s._id === id; });
  return JSON.stringify(student || null);
}

function createStudent(studentStr) {
  var student = JSON.parse(studentStr);
  student._id = generateId();
  student.createdAt = new Date().toISOString();
  student.updatedAt = student.createdAt;
  var res = saveToSheet('Students', student, false);
  return JSON.stringify(res);
}

function updateStudent(id, studentStr) {
  var studentUpdate = JSON.parse(studentStr);
  var students = getSheetData('Students');
  var existing = students.find(function(s) { return s._id === id; });
  if (!existing) throw new Error("Student not found");
  
  var merged = Object.assign(existing, studentUpdate);
  merged.updatedAt = new Date().toISOString();
  
  var res = saveToSheet('Students', merged, true);
  return JSON.stringify(res);
}

function deleteStudent(id) {
  deleteFromSheet('Students', id);
  return JSON.stringify({success: true});
}

function deleteAllStudents() {
  var ss = getDbSpreadsheet();
  var sheet = ss.getSheetByName('Students');
  if (sheet) {
    var data = sheet.getDataRange().getValues();
    if (data.length > 1) {
      sheet.deleteRows(2, data.length - 1);
    }
  }
  return JSON.stringify({success: true});
}

function deleteMultipleStudents(idsStr) {
  var ids = JSON.parse(idsStr);
  ids.forEach(function(id) {
    deleteFromSheet('Students', id);
  });
  return JSON.stringify({success: true});
}

function getLessonsByStudent(studentId) {
  var lessons = getSheetData('Lessons');
  var filtered = lessons.filter(function(l) { return l.studentId === studentId; });
  return JSON.stringify(filtered);
}

function createLesson(lessonStr) {
  var lesson = JSON.parse(lessonStr);
  lesson._id = generateId();
  lesson.createdAt = new Date().toISOString();
  lesson.updatedAt = lesson.createdAt;
  var res = saveToSheet('Lessons', lesson, false);
  return JSON.stringify(res);
}

function updateLesson(id, lessonStr) {
  var lessonUpdate = JSON.parse(lessonStr);
  var lessons = getSheetData('Lessons');
  var existing = lessons.find(function(l) { return l._id === id; });
  if (!existing) throw new Error("Lesson not found");
  
  var merged = Object.assign(existing, lessonUpdate);
  merged.updatedAt = new Date().toISOString();
  
  var res = saveToSheet('Lessons', merged, true);
  return JSON.stringify(res);
}

function deleteLesson(id) {
  deleteFromSheet('Lessons', id);
  return JSON.stringify({success: true});
}

// Helper to find the Database URL
function getDatabaseUrl() {
  var ss = getDbSpreadsheet();
  return ss.getUrl();
}

// Function to link an existing Spreadsheet ID manually
function setSpreadsheetId(id) {
  PropertiesService.getScriptProperties().setProperty(SHEET_DB_KEY, id);
  return "Linked to " + id;
}

// Drive Integration for Audio
function extractFolderId(url) {
  if (!url) return null;
  var match = url.match(/folders\/([a-zA-Z0-9-_]+)/);
  if (match) return match[1];
  match = url.match(/id=([a-zA-Z0-9-_]+)/);
  if (match) return match[1];
  return null;
}

function uploadAudio(base64Data, filename, studentName, driveLink) {
  var folder;
  if (driveLink) {
    var folderId = extractFolderId(driveLink);
    if (folderId) {
      try {
        folder = DriveApp.getFolderById(folderId);
      } catch (e) {
        throw new Error("Không thể truy cập thư mục từ Link Drive. Vui lòng kiểm tra lại quyền truy cập hoặc link.");
      }
    } else {
      throw new Error("Định dạng Link Drive không hợp lệ. Vui lòng dán link thư mục Google Drive chính xác.");
    }
  } else {
    throw new Error("Học viên này chưa có Link Drive Video. Vui lòng Cập nhật học viên và thêm Link Drive trước khi lưu.");
  }

  
  var dataIndex = base64Data.indexOf('base64,');
  var dataStr = dataIndex > -1 ? base64Data.substr(dataIndex + 7) : base64Data;
  var blob = Utilities.newBlob(Utilities.base64Decode(dataStr), 'audio/webm', filename);
  var file = folder.createFile(blob);
  
  return JSON.stringify({
    fileUrl: file.getUrl(),
    folderUrl: folder.getUrl()
  });
}
