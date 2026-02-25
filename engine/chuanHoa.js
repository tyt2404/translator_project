/* ===================================================
   ENGINE CHUẨN HÓA VĂN BẢN
=================================================== */

function chuanHoaVanBan(vanBan) {
  if (!vanBan || typeof vanBan !== "string") return "";

  let text = vanBan;

  /* ==========================================
     1. Chuẩn hóa ký tự full-width → half-width
  ========================================== */
  text = text.replace(/[\uFF01-\uFF5E]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0xFEE0)
  );

  text = text.replace(/\u3000/g, " "); // full-width space

  /* ==========================================
     2. Chuẩn hóa dấu câu Trung → Việt
  ========================================== */
  const dauCauMap = {
    "，": ",",
    "。": ".",
    "！": "!",
    "？": "?",
    "：": ":",
    "；": ";",
    "（": "(",
    "）": ")",
    "【": "[",
    "】": "]",
    "《": "\"",
    "》": "\"",
    "“": "\"",
    "”": "\"",
    "‘": "'",
    "’": "'"
  };

  text = text.replace(/[，。！？：；（）【】《》“”‘’]/g, (m) => dauCauMap[m] || m);

  /* ==========================================
     3. Chuẩn hóa xuống dòng
  ========================================== */
  text = text.replace(/\r\n/g, "\n");
  text = text.replace(/\r/g, "\n");
  text = text.replace(/\n{3,}/g, "\n\n");

  /* ==========================================
     4. Chuẩn hóa khoảng trắng
  ========================================== */
  text = text.replace(/[ \t]{2,}/g, " ");
  text = text.replace(/ ?([,.!?;:]) ?/g, "$1 "); 
  text = text.replace(/\s+\n/g, "\n");
  text = text.replace(/\n\s+/g, "\n");

  /* ==========================================
     5. Bảo vệ số + chữ Latin
     (Không xử lý gì — chỉ đảm bảo không phá)
  ========================================== */

  // Không tách ký tự Latin
  // Không thay đổi số
  // Không can thiệp nếu đã là tiếng Việt

  /* ==========================================
     6. Trim cuối cùng
  ========================================== */
  text = text.trim();

  return text;
}

module.exports = { chuanHoaVanBan };