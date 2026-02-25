function xuLyBi(tokens) {

  const ketQua = [];

  for (let i = 0; i < tokens.length; i++) {

    if (tokens[i] === "bị" && i + 1 < tokens.length) {

      const dongTu = tokens[i + 1];

      ketQua.push("bị " + dongTu);
      i++;
      continue;
    }

    ketQua.push(tokens[i]);
  }

  return ketQua;
}

function xuLyBa(tokens) {

  const ketQua = [];

  for (let i = 0; i < tokens.length; i++) {

    if (tokens[i] === "đem" && i + 2 < tokens.length) {
      // giả định cấu trúc đã được dịch
      const doiTuong = tokens[i + 1];
      const dongTu = tokens[i + 2];

      ketQua.push(dongTu);
      ketQua.push(doiTuong);
      i += 2;
      continue;
    }

    ketQua.push(tokens[i]);
  }

  return ketQua;
}

function xuLyCauDacBiet(tokens) {
  tokens = xuLyBi(tokens);
  tokens = xuLyBa(tokens);
  return tokens;
}

module.exports = { xuLyCauDacBiet };