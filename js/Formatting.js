function format(number) {
    return Number(number).toFixed(2);
  }
  
  // Gắn vào window để dùng global
  window.format = format;