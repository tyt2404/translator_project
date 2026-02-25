module.exports = {
  thayThe: {
    "ta": "tôi",
    "ngươi": "bạn"
  },

  xuLyCau: function(tokens) {
    // xử lý 被 đơn giản
    for (let i = 0; i < tokens.length - 1; i++) {
      if (tokens[i] === "bị") {
        // ví dụ có thể xử lý nâng cao ở đây
      }
    }
    return tokens;
  }
};