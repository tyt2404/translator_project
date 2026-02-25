const macDinh = require("./macDinh");
const tienHiep = require("./tienHiep");

const danhSach = {
  mac_dinh: macDinh,
  tien_hiep: tienHiep
};

function apDungProfile(tokens, tenProfile) {

  const profile = danhSach[tenProfile] || macDinh;

  if (!Array.isArray(tokens)) return tokens;

  let ketQua = [...tokens];

  /* ==========================================
     1️⃣ Thay thế theo token chính xác
  ========================================== */
  ketQua = ketQua.map(token => {
    if (profile.thayThe[token]) {
      return profile.thayThe[token];
    }
    return token;
  });

  /* ==========================================
     2️⃣ Xử lý cấu trúc đặc biệt (nếu có)
  ========================================== */
  if (profile.xuLyCau) {
    ketQua = profile.xuLyCau(ketQua);
  }

  return ketQua;
}

module.exports = { apDungProfile };