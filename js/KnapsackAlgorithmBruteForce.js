class KnapsackAlgorithmBruteForce {
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
      const { maxValue, bestItems } = this._knapsack();
      this._maxValue = maxValue;
      this._bestItems = bestItems;
      this._solutionTable = this._createSolutionTable(maxValue);
      this._solutionItems = this._findItemsThatFit();
    }
  }

  _knapsack() {
    let maxValue = 0;
    let bestItems = [];
    const n = this._items.length;

    // Hàm tạo tổ hợp có kích thước r
    function combinations(arr, r) {
      const result = [];
      function generateCombos(start, combo) {
        if (combo.length === r) {
          result.push([...combo]);
          return;
        }
        for (let i = start; i < arr.length; i++) {
          combo.push(arr[i]);
          generateCombos(i + 1, combo);
          combo.pop();
        }
      }
      generateCombos(0, []);
      return result;
    }

    // Reset steps
    this._steps = [];

    // Duyệt qua tất cả kích thước tập hợp con từ 0 đến n
    for (let r = 0; r <= n; r++) {
      // Tạo tất cả tập hợp con có kích thước r
      const subsets = combinations([...Array(n).keys()], r);
      for (const subset of subsets) {
        let currentWeight = 0;
        let currentValue = 0;
        const selectedItems = subset;

        // Tính tổng trọng lượng và giá trị
        for (const index of subset) {
          currentWeight += this._items[index].weight;
          currentValue += this._items[index].value;
        }

        // Lưu bước cho debug/hiển thị
        this._steps.push({
          description: `Kiểm tra tập hợp [${
            selectedItems.length > 0 ? selectedItems.map(i => i + 1).join(", ") : "rỗng"
          }]: Trọng lượng ${currentWeight}, Giá trị ${currentValue}${
            currentWeight <= this._capacity && currentValue >= maxValue ? " (Cập nhật tối ưu)" : ""
          }`,
          selectedItems: selectedItems.length > 0 ? selectedItems.map(i => i + 1) : [],
          currentWeight,
          currentValue,
          isValid: currentWeight <= this._capacity,
          isOptimal: currentWeight <= this._capacity && currentValue >= maxValue
        });

        // Cập nhật nếu tập hợp hợp lệ và có giá trị tốt hơn
        if (currentWeight <= this._capacity && currentValue > maxValue) {
          maxValue = currentValue;
          bestItems = [...selectedItems];
        }
      }
    }

    return { maxValue, bestItems };
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

window.KnapsackAlgorithmBruteForce = KnapsackAlgorithmBruteForce;