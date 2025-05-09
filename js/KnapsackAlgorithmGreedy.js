class KnapsackAlgorithmGreedy {
  _solutionTable;
  _solutionItems;
  _maxLengthItem;
  _contributingCells;
  _bestItems;
  _steps;

  constructor(items, capacity) {
    if (!items || items.length === 0) throw new Error("Danh sách vật phẩm không được rỗng");
    if (capacity < 0) throw new Error("Dung lượng túi phải không âm");
    items.forEach((item, index) => {
      if (item.weight < 0 || item.value < 0) {
        throw new Error(`Vật phẩm ${index + 1} có trọng lượng hoặc giá trị âm`);
      }
    });

    this._items = items;
    this._capacity = Math.floor(capacity);
    this._maxLengthItem = 0;
    this._contributingCells = {};
    this._bestItems = [];
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
    const sortedItems = [...this._items].map((item, index) => ({ ...item, originalIndex: index }))
      .sort((a, b) => (b.value / b.weight) - (a.value / a.weight));

    let currentWeight = 0;
    let currentValue = 0;
    const selectedItems = [];

    this._steps.push({
      description: `Sắp xếp vật phẩm theo tỷ lệ giá trị/trọng lượng: [${sortedItems.map(item => `Vật phẩm ${item.originalIndex + 1}: ${item.value}/${item.weight}`).join(', ')}]`,
      sortedItems: sortedItems.map(item => item.originalIndex + 1)
    });

    for (const item of sortedItems) {
      if (currentWeight + item.weight <= this._capacity) {
        currentWeight += item.weight;
        currentValue += item.value;
        selectedItems.push(item.originalIndex);
        this._steps.push({
          description: `Chọn vật phẩm ${item.originalIndex + 1}: Trọng lượng ${item.weight}, Giá trị ${item.value} (Tổng: ${currentWeight}, ${currentValue})`,
          selectedItem: item.originalIndex + 1,
          currentWeight,
          currentValue
        });
      } else {
        this._steps.push({
          description: `Bỏ qua vật phẩm ${item.originalIndex + 1}: Trọng lượng ${item.weight} vượt quá dung lượng còn lại (${this._capacity - currentWeight})`,
          selectedItem: null,
          currentWeight,
          currentValue
        });
      }
    }

    this._maxLengthItem = currentValue;
    this._bestItems = selectedItems;

    const table = [];
    for (let i = 0; i <= n; i++) {
      table.push(Array(this._capacity + 1).fill(0));
    }
    table[n][this._capacity] = currentValue;

    const cell = new window.CellDetail(n, this._capacity);
    cell.cellValue = currentValue;
    this._contributingCells[[n, this._capacity]] = cell;

    return table;
  }

  _findItemsThatFit() {
    const solution = [];
    const n = this._items.length;
    let currentCapacity = this._capacity;

    for (let i = n; i > 0; i--) {
      const itemIndex = i - 1;
      const item = new window.SolutionItem(this._items[itemIndex], i, currentCapacity, false);
      if (this._bestItems.includes(itemIndex)) {
        item.inSolution = true;
        currentCapacity -= this._items[itemIndex].weight;
      }
      solution.push(item);
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

window.KnapsackAlgorithmGreedy = KnapsackAlgorithmGreedy;