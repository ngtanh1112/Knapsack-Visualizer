class KnapsackAlgorithmDynamicProgramming {
  _solutionTable;
  _solutionItems;
  _maxLengthItem;
  _contributingCells;
  _steps;

  constructor(items, capacity) {
    // Kiểm tra đầu vào
    if (!items || items.length === 0) throw new Error("Danh sách vật phẩm không được rỗng");
    if (capacity < 0) throw new Error("Dung lượng túi phải không âm");
    items.forEach((item, index) => {
      if (item.weight < 0 || item.value < 0) {
        throw new Error(`Vật phẩm ${index + 1} có trọng lượng hoặc giá trị âm`);
      }
    });

    this._items = items;
    this._capacity = Math.floor(capacity); // Đảm bảo capacity là số nguyên
    this._maxLengthItem = 0;
    this._contributingCells = {};
    this._steps = [];
  }

  _init() {
    if (!this._solutionTable) {
      this._solutionTable = this._knapsack();
    }
    if (!this._solutionItems) {
      this._solutionItems = this._findItemsThatFit();
    }
  }

  _knapsack() {
    const n = this._items.length;
    const table = [];
    for (let i = 0; i <= n; i++) {
      table.push(Array(this._capacity + 1).fill(0));
    }

    this._items.forEach((item, index) => {
      const offsetIndex = index + 1;
      for (let currentCapacity = 1; currentCapacity <= this._capacity; currentCapacity++) {
        let cell = new window.CellDetail(offsetIndex, currentCapacity);
        const previousRow = offsetIndex - 1;
        const leftOverCapacity = currentCapacity - item.weight;
        const valueForCapacityInPreviousRow = table[previousRow][currentCapacity];
        let cellValue = 0;

        if (item.weight <= currentCapacity && leftOverCapacity >= 0) {
          let combinedValue = item.value + table[previousRow][leftOverCapacity];
          if (combinedValue > valueForCapacityInPreviousRow) {
            cellValue = combinedValue;
            cell.winningCell = [previousRow, leftOverCapacity];
          } else {
            cellValue = valueForCapacityInPreviousRow;
            cell.winningCell = [previousRow, currentCapacity];
          }
          cell.cellRemainingCapacity = [previousRow, leftOverCapacity];
        } else {
          cellValue = valueForCapacityInPreviousRow;
          cell.winningCell = [previousRow, currentCapacity];
        }

        table[offsetIndex][currentCapacity] = cellValue;
        cell.cellAbove = [previousRow, currentCapacity];
        this._contributingCells[[offsetIndex, currentCapacity]] = cell;
        this._maxLengthItem = Math.max(this._maxLengthItem, table[offsetIndex][currentCapacity]);

        // Lưu bước trực quan hóa
        const tableSnapshot = table.map(row => [...row]);
        this._steps.push({
          description: `Điền ô [${offsetIndex}, ${currentCapacity}] = ${cellValue} (Vật phẩm ${offsetIndex}: trọng lượng ${item.weight}, giá trị ${item.value})`,
          table: tableSnapshot,
          highlightedCell: [offsetIndex, currentCapacity]
        });
      }
    });

    return table;
  }

  _findItemsThatFit() {
    const solution = [];
    let currentCapacity = this._capacity;

    for (let i = this._items.length; i > 0; i--) {
      const item = new window.SolutionItem(this._items[i - 1], i, currentCapacity, false);
      if (this._solutionTable[i][currentCapacity] !== this._solutionTable[i - 1][currentCapacity]) {
        item.inSolution = true;
        solution.push(item);
        currentCapacity -= this._items[i - 1].weight;
      } else {
        solution.push(item);
      }
    }

    return solution;
  }

  get solutionTable() {
    this._init();
    return this._solutionTable;
  }

  get solutionItems() {
    this._init();
    return this._solutionItems;
  }

  get items() {
    return this._items;
  }

  get capacity() {
    return this._capacity;
  }

  get maxLengthItem() {
    return this._maxLengthItem;
  }

  get steps() {
    this._init();
    return this._steps;
  }

  getContributingCells(row, column) {
    this._init();
    return this._contributingCells[[row, column]];
  }
}

// Gắn vào window để dùng global
window.KnapsackAlgorithmDynamicProgramming = KnapsackAlgorithmDynamicProgramming;