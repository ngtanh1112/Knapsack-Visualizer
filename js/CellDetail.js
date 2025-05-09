class CellDetail {
    constructor(row, column) {
      this.row = row;
      this.column = column;
      this.cellValue = 0;
      this.winningCell = null;
      this.cellAbove = null;
      this.cellRemainingCapacity = null;
    }
  }
  
  // Gắn vào window để dùng global
  window.CellDetail = CellDetail;