class KnapsackAlgorithmGreedy {
  constructor(items, capacity) {
    // Kiểm tra input
    if (!items || items.length === 0) throw new Error("Danh sách vật phẩm không được rỗng");
    if (capacity < 0) throw new Error("Dung lượng túi phải không âm");
    items.forEach((item, index) => {
      if (item.weight < 0 || item.value < 0) {
        throw new Error(`Vật phẩm ${index + 1} có trọng lượng hoặc giá trị âm`);
      }
    });

    this._items = items;
    this._capacity = Math.floor(capacity);
    this._solutionTable = null;
    this._solutionItems = null;
    this._maxValue = 0;
    this._contributingCells = {};
    this._bestItems = [];
    this._steps = [];
  }

  _init() {
    if (!this._solutionTable || !this._solutionItems) {
      const { maxValue, selectedItems } = this._knapsack();
      this._maxValue = maxValue;
      this._bestItems = selectedItems;
      this._solutionTable = this._createSolutionTable(maxValue);
      this._solutionItems = this._findItemsThatFit();
    }
  }

  _knapsack() {
    // Sắp xếp vật phẩm theo tỷ lệ giá trị/trọng lượng giảm dần
    const sortedItems = [...this._items]
      .map((item, index) => ({ ...item, originalIndex: index }))
      .sort((a, b) => b.value / b.weight - a.value / a.weight);

    let currentWeight = 0;
    let currentValue = 0;
    const selectedItems = [];

    // Duyệt và chọn vật phẩm
    for (const item of sortedItems) {
      if (currentWeight + item.weight <= this._capacity) {
        currentWeight += item.weight;
        currentValue += item.value;
        selectedItems.push(item.originalIndex);
      }
    }

    return { maxValue: currentValue, selectedItems };
  }

  _createSolutionTable(maxValue) {
    const n = this._items.length;
    // Tạo bảng 2D với tất cả giá trị là 0
    const table = [];
    for (let i = 0; i <= n; i++) {
      table.push(Array(this._capacity + 1).fill(0));
    }
    // Gán giá trị tối đa tại ô (n, capacity)
    table[n][this._capacity] = maxValue;

    // Lưu thông tin ô đóng góp
    const cell = new window.CellDetail(n, this._capacity);
    cell.cellValue = maxValue;
    this._contributingCells[[n, this._capacity]] = cell;

    // Lưu các bước để debug/hiển thị
    this._steps.push({
      description: `Sắp xếp vật phẩm theo tỷ lệ giá trị/trọng lượng: [${this._items.map(
        (item, index) => `Vật phẩm ${index + 1}: ${item.value}/${item.weight} = ${(item.value / item.weight).toFixed(2)}`
      ).join(", ")}]`,
      sortedItems: this._items.map((_, index) => index + 1)
    });

    for (const item of this._items.map((item, index) => ({ ...item, originalIndex: index }))) {
      if (this._bestItems.includes(item.originalIndex)) {
        this._steps.push({
          description: `Chọn vật phẩm ${item.originalIndex + 1}: Trọng lượng ${item.weight}, Giá trị ${item.value}`,
          selectedItem: item.originalIndex + 1
        });
      } else {
        this._steps.push({
          description: `Bỏ qua vật phẩm ${item.originalIndex + 1}: Trọng lượng ${item.weight} vượt quá dung lượng còn lại`,
          selectedItem: null
        });
      }
    }

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

  get maxValue() {
    return this._maxValue;
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