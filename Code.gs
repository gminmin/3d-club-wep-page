// --- 설정: 알림을 받을 이메일 주소를 입력하세요 ---
const RECEIVER_EMAIL = "gangminsu098@gmail.com"; 

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet;

    let fileUrl = "없음";
    
    if (data.type === 'recruitment') {
      sheet = ss.getSheetByName('부원모집') || ss.insertSheet('부원모집');
      if (sheet.getLastRow() === 0) sheet.appendRow(['날짜', '이름', '학번', '연락처', '지원분야', '지원동기', '수상 및 경력']);
      sheet.appendRow([new Date(), data.name, data.student_id, data.contact, data.field, data.motivation, data.awards_career]);
      
      sendEmailNotification(data);
    } else if (data.type === 'contact') {
      sheet = ss.getSheetByName('일반문의') || ss.insertSheet('일반문의');
      if (sheet.getLastRow() === 0) sheet.appendRow(['날짜', '이름', '연락처', '문의내용', '첨부파일']);
      sheet.appendRow([new Date(), data.name, data.contact_info, data.message, fileUrl]);

      sendEmailNotification(data);
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

/**
 * 이메일 권한 승인을 위한 테스트 함수
 * 에디터 상단에서 이 함수를 선택하고 [실행]을 누르세요.
 */
function testEmail() {
  const testData = {
    type: 'contact',
    name: '테스트 관리자',
    contact_info: 'test@example.com',
    message: '이 메일이 도착했다면 권한 설정이 완료된 것입니다!'
  };
  sendEmailNotification(testData);
  console.log("테스트 메일을 발송했습니다. 본인의 메일함을 확인하고 권한 승인 창이 떴다면 허용해주세요.");
}

/**
 * 이메일 알림 발송 함수
 */
function sendEmailNotification(data) {
  try {
    if (!RECEIVER_EMAIL) return;

    let subject = "";
    let body = "";

    if (data.type === 'recruitment') {
      subject = `[3D 동아리] 신규 부원 지원서 도착 (${data.name} 학생)`;
      body = `새로운 부원 모집 지원서가 접수되었습니다.\n\n` +
             `[지원자 정보]\n` +
             `- 이름: ${data.name}\n` +
             `- 학번: ${data.student_id}\n` +
             `- 연락처: ${data.contact}\n` +
             `- 지원분야: ${data.field}\n` +
             `- 지원동기: ${data.motivation}\n` +
             `- 수상 및 경력: ${data.awards_career}\n\n` +
             `------------------------------------------\n` +
             `이 메일은 시스템에 의해 자동으로 발송되었습니다. 구글 시트에서 상세 내용을 확인하세요.`;
    } else if (data.type === 'contact') {
      subject = `[3D 동아리] 홈페이지 일반 문의 접수 (${data.name}님)`;
      body = `홈페이지를 통해 새로운 문의 사항이 접수되었습니다.\n\n` +
             `[문의 내용]\n` +
             `- 이름: ${data.name}\n` +
             `- 연락처: ${data.contact_info}\n` +
             `- 내용: ${data.message}\n\n` +
             `------------------------------------------\n` +
             `이 메일은 시스템에 의해 자동으로 발송되었습니다. 구글 시트에서 상세 내용을 확인하세요.`;
    }

    if (subject && body) {
      GmailApp.sendEmail(RECEIVER_EMAIL, subject, body);
    }
  } catch (e) {
    Logger.log("이메일 발송 실패: " + e.toString());
  }
}
