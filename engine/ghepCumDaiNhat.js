function ghepCumDaiNhat(text, tuDien) {

  const DO_DAI_TOI_DA = 8; // có thể tăng nếu dict có cụm dài
  let i = 0;
  const tokens = [];

  while (i < text.length) {

    const char = text[i];

    /* ==========================================
       1️⃣ Nếu không phải chữ Hán → gom lại
    ========================================== */
    if (!/[\u4E00-\u9FFF]/.test(char)) {

      let buffer = char;
      i++;

      while (
        i < text.length &&
        !/[\u4E00-\u9FFF]/.test(text[i])
      ) {
        buffer += text[i];
        i++;
      }

      tokens.push(buffer.trim());
      continue;
    }

    /* ==========================================
       2️⃣ Longest Match
    ========================================== */
    let timThay = false;

    for (let len = DO_DAI_TOI_DA; len > 0; len--) {

      const cum = text.slice(i, i + len);

      if (tuDien[cum]) {
        tokens.push(tuDien[cum]);
        i += len;
        timThay = true;
        break;
      }
    }

    /* ==========================================
       3️⃣ Nếu không tìm thấy → giữ nguyên ký tự
    ========================================== */
    if (!timThay) {
      tokens.push(char);
      i++;
    }
  }

  /* ==========================================
     4️⃣ Dọn token rỗng
  ========================================== */
  return tokens.filter(t => t && t.length > 0);
}

module.exports = { ghepCumDaiNhat };