function lamMuotCau(text) {

  text = text.replace(/\s+/g, " ");
  text = text.replace(/ ,/g, ",");
  text = text.replace(/ \./g, ".");
  text = text.replace(/ \?/g, "?");
  text = text.replace(/ !/g, "!");
  text = text.replace(/\s+"\s+/g, ' "');

  return text.trim();
}

module.exports = { lamMuotCau };