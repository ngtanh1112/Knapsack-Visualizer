class KnapsackAlgorithmBranchAndBound {
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
      const { maxValue, bestItems, sortedItems } = this._knapsack();
      this._maxValue = maxValue;
      this._bestItems = bestItems;
      this._solutionTable = this._createSolutionTable(maxValue, sortedItems);
      this._solutionItems = this._findItemsThatFit();
    }
  }

  _getUpperBound(index, currentWeight, currentValue, capacity, sortedItems) {
    let bound = currentValue;
    let weight = currentWeight;

    for (let i = index + 1; i < sortedItems.length; i++) {
      if (weight + sortedItems[i].weight <= capacity) {
        weight += sortedItems[i].weight;
        bound += sortedItems[i].value;
      } else {
        let remaining = capacity - weight;
        bound += (remaining / sortedItems[i].weight) * sortedItems[i].value;
        break;
      }
    }

    return bound;
  }

  _knapsack() {
    // Sắp xếp vật phẩm theo tỷ lệ giá trị/trọng lượng giảm dần
    const sortedItems = [...this._items]
      .map((item, index) => ({ ...item, originalIndex: index }))
      .sort((a, b) => b.value / b.weight - a.value / a.weight);

    let bestValue = 0;
    let bestItems = [];

    // Khởi tạo hàng đợi cho nhánh và cận
    const queue = [{
      index: -1,
      value: 0,
      weight: 0,
      items: []
    }];

    while (queue.length > 0) {
      const node = queue.shift();
      const index = node.index + 1;

      if (index >= sortedItems.length) continue;

      // Tính cận trên cho nút hiện tại
      const bound = this._getUpperBound(node.index, node.weight, node.value, this._capacity, sortedItems);

      // Cắt tỉa nếu cận trên không hứa hẹn
      if (bound <= bestValue) continue;

      // Thêm nhánh không chọn vật phẩm hiện tại
      queue.push({
        index: index,
        value: node.value,
        weight: node.weight,
        items: [...node.items]
      });

      // Thêm nhánh chọn vật phẩm hiện tại nếu khả thi
      if (node.weight + sortedItems[index].weight <= this._capacity) {
        const newValue = node.value + sortedItems[index].value;
        const newWeight = node.weight + sortedItems[index].weight;
        const newItems = [...node.items, index];

        if (newValue > bestValue) {
          bestValue = newValue;
          bestItems = newItems;
        }

        queue.push({
          index: index,
          value: newValue,
          weight: newWeight,
          items: newItems
        });
      }
    }

    // Chuyển chỉ số vật phẩm về chỉ số gốc
    const originalBestItems = bestItems.map(idx => sortedItems[idx].originalIndex);

    return { maxValue: bestValue, bestItems: originalBestItems, sortedItems };
  }

  _createSolutionTable(maxValue, sortedItems) {
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
    this._steps = []; // Reset _steps để đảm bảo không có dữ liệu cũ
    this._steps.push({
      description: `Sắp xếp vật phẩm theo tỷ lệ giá trị/trọng lượng: [${sortedItems.map(
        item => `Vật phẩm ${item.originalIndex + 1}: ${item.value}/${item.weight} = ${(item.value / item.weight).toFixed(2)}`
      ).join(", ")}]`,
      sortedItems: sortedItems.map(item => item.originalIndex + 1),
      items: [], // Đảm bảo items là mảng rỗng
      value: 0,
      weight: 0,
      bound: null,
      isPruned: false
    });

    // Tái hiện các bước dựa trên kết quả của _knapsack
    let currentWeight = 0;
    let currentValue = 0;
    for (let i = 0; i < sortedItems.length; i++) {
      const itemIndex = sortedItems[i].originalIndex;
      const bound = this._getUpperBound(i - 1, currentWeight, currentValue, this._capacity, sortedItems);
      const currentItems = this._bestItems.slice(0, this._bestItems.indexOf(itemIndex) + 1); // Lấy danh sách vật phẩm đến thời điểm hiện tại

      if (this._bestItems.includes(itemIndex)) {
        currentWeight += sortedItems[i].weight;
        currentValue += sortedItems[i].value;
        this._steps.push({
          description: `Chọn vật phẩm ${itemIndex + 1}: Giá trị ${currentValue}, Trọng lượng ${currentWeight}${currentValue >= maxValue ? ' (Cập nhật tối ưu)' : ''}`,
          value: currentValue,
          weight: currentWeight,
          bound: this._getUpperBound(i, currentWeight, currentValue, this._capacity, sortedItems),
          items: currentItems.length > 0 ? currentItems : [], // Đảm bảo items là mảng
          isPruned: false,
          isOptimal: currentValue >= maxValue
        });
      } else {
        this._steps.push({
          description: `Xét nút [${currentItems.join(", ") || 'rỗng'}]: Bỏ qua vật phẩm ${itemIndex + 1}, Bound ${bound.toFixed(2)}${bound <= maxValue ? ' (Cắt tỉa)' : ''}`,
          value: currentValue,
          weight: currentWeight,
          bound,
          items: currentItems.length > 0 ? currentItems : [], // Đảm bảo items là mảng
          isPruned: bound <= maxValue
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

window.KnapsackAlgorithmBranchAndBound = KnapsackAlgorithmBranchAndBound;