const { chuanHoaVanBan } = require("./chuanHoa");
const { ghepCumTrie } = require("./ghepCumTrie");
const { xuLyCauDacBiet } = require("./xuLyCauDacBiet");
const { xuLySo } = require("./xuLySo");
const { lamMuotCau } = require("./lamMuot");
const { apDungProfile } = require("./profile/quanLyProfile");

/* ===================================================
   Highlight từ chưa có trong từ điển
=================================================== */
function highlightTuChuaCo(tokens) {
  return tokens.map(token => {
    // Nếu vẫn còn chữ Hán → chưa có trong từ điển
    if (/[\u4E00-\u9FFF]/.test(token)) {
      return `<span class="highlight-unknown">${token}</span>`;
    }
    return token;
  });
}

/* ===================================================
   Highlight 被 / 把 (giúp debug cấu trúc câu)
=================================================== */
function highlightCauDacBiet(text) {
  return text
    .replace(/被/g, '<span class="highlight-ba">被</span>')
    .replace(/把/g, '<span class="highlight-ba">把</span>');
}

/* ===================================================
   ENGINE CHÍNH
=================================================== */
/* ===================================================
   DỊCH MỘT DÒNG ĐƠN
=================================================== */
function dichMotDong(donDong, tuDien, tenProfile = "mac_dinh") {
  if (!donDong || typeof donDong !== "string") return "";

  /* 1️⃣ Chuẩn hóa */
  let text = chuanHoaVanBan(donDong);

  /* 2️⃣ Xử lý số (năm, tiền, thời gian...) */
  text = xuLySo(text);

  /* 3️⃣ Ghép cụm bằng Trie */
  let tokens = ghepCumTrie(text, tuDien);

  if (!Array.isArray(tokens)) {
    tokens = [tokens];
  }

  /* 4️⃣ Highlight từ chưa có */
  tokens = highlightTuChuaCo(tokens);

  /* 5️⃣ Xử lý 被 / 把 (đảo cấu trúc nếu có) */
  tokens = xuLyCauDacBiet(tokens);

  /* 6️⃣ Áp profile (tiên hiệp / mặc định) */
  tokens = apDungProfile(tokens, tenProfile);

  /* 7️⃣ Join lại câu */
  let ketQua = tokens.join(" ");

  /* 8️⃣ Làm mượt văn phong */
  ketQua = lamMuotCau(ketQua);

  /* 9️⃣ Highlight 被 / 把 nếu còn tồn tại */
  ketQua = highlightCauDacBiet(ketQua);

  return ketQua;
}

/* ===================================================
   ENGINE CHÍNH (hỗ trợ xuống dòng)
=================================================== */
function dichVanBan(vanBan, tuDien, tenProfile = "mac_dinh") {

  if (!vanBan || typeof vanBan !== "string") return "";

  /* Chia văn bản thành các dòng */
  const cacDong = vanBan.split(/\n/);

  /* Dịch từng dòng riêng */
  const cacDongDich = cacDong.map(dong => {
    return dichMotDong(dong.trim(), tuDien, tenProfile);
  });

  /* Join lại với xuống dòng */
  return cacDongDich.join("\n");
}

module.exports = { dichVanBan };