function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet;

    // --- 파일 처리 로직 (Google Drive 저장) ---
    // [수정됨] 파일 업로드 기능이 제거되었습니다.
    let fileUrl = "없음";
    
    // 이전 로직 제거됨 (DriveApp 사용 안 함)

    // 데이터 타입에 따라 자동으로 시트 분류 및 생성
    if (data.type === 'recruitment') {
      sheet = ss.getSheetByName('부원모집') || ss.insertSheet('부원모집');
      if (sheet.getLastRow() === 0) sheet.appendRow(['날짜', '이름', '학번', '지원분야', '지원동기', '수상 및 경력']);
      sheet.appendRow([new Date(), data.name, data.student_id, data.field, data.motivation, data.awards_career]);
    } else if (data.type === 'contact') {
      sheet = ss.getSheetByName('일반문의') || ss.insertSheet('일반문의');
      if (sheet.getLastRow() === 0) sheet.appendRow(['날짜', '이름', '연락처', '문의내용', '첨부파일']);
      sheet.appendRow([new Date(), data.name, data.contact_info, data.message, fileUrl]);
    }

    return ContentService.createTextOutput(JSON.stringify({"result":"success", "fileUrl": fileUrl}))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({"result":"error", "error": err.message}))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
  }
}
