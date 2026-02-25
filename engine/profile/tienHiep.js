const profileTienHiep = {

  /* ===============================
     Thay thế token đơn
  =============================== */
  thayThe: {
    "anh": "hắn",
    "cô": "nàng",
    "ta": "bổn tọa",
    "tôi": "bản tọa",
    "giết": "tru sát",
    "người": "nhân sĩ",
    "thành phố": "thành trì",
    "trường học": "học viện"
  },

  /* ===============================
     Xử lý cụm từ (multi-token)
  =============================== */
  xuLyCau: function(tokens) {

    let ketQua = [];

    for (let i = 0; i < tokens.length; i++) {

      // xử lý "bị giết"
      if (
        tokens[i] === "bị" &&
        tokens[i + 1] === "giết"
      ) {
        ketQua.push("bị tru sát");
        i++; // bỏ qua token kế tiếp
        continue;
      }

      // xử lý "anh ấy"
      if (
        tokens[i] === "hắn" &&
        tokens[i + 1] === "ấy"
      ) {
        ketQua.push("hắn");
        i++;
        continue;
      }

      ketQua.push(tokens[i]);
    }

    return ketQua;
  }
};

module.exports = profileTienHiep;