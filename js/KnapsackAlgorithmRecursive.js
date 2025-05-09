class KnapsackAlgorithmRecursive {
    _solutionTable;
    _solutionItems;
    _maxLengthItem;
    _contributingCells;
    _memo;
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
      this._memo = new Map();
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
  
    _recursiveKnapsack(index, currentCapacity) {
      const key = `${index},${currentCapacity}`;
      if (this._memo.has(key)) {
        this._steps.push({
          description: `Trạng thái [${index}, ${currentCapacity}]: Lấy từ memo (Giá trị: ${this._memo.get(key).value})`,
          index,
          currentCapacity,
          isMemoized: true
        });
        return this._memo.get(key);
      }
  
      if (index < 0 || currentCapacity <= 0) {
        this._steps.push({
          description: `Trạng thái [${index}, ${currentCapacity}]: Cơ sở (Giá trị: 0)`,
          index,
          currentCapacity,
          isMemoized: false
        });
        return { value: 0, items: [] };
      }
  
      this._steps.push({
        description: `Trạng thái [${index}, ${currentCapacity}]: Xét vật phẩm ${index + 1} (trọng lượng: ${this._items[index].weight}, giá trị: ${this._items[index].value})`,
        index,
        currentCapacity,
        isMemoized: false
      });
  
      const withoutItem = this._recursiveKnapsack(index - 1, currentCapacity);
  
      let withItem = { value: 0, items: [] };
      if (this._items[index].weight <= currentCapacity) {
        const result = this._recursiveKnapsack(index - 1, currentCapacity - this._items[index].weight);
        withItem = {
          value: this._items[index].value + result.value,
          items: [...result.items, index]
        };
      }
  
      const best = withItem.value > withoutItem.value ? withItem : withoutItem;
      this._memo.set(key, best);
  
      this._maxLengthItem = Math.max(this._maxLengthItem, best.value);
  
      return best;
    }
  
    _knapsack() {
      const n = this._items.length;
      const result = this._recursiveKnapsack(n - 1, this._capacity);
  
      const table = [];
      for (let i = 0; i <= n; i++) {
        table.push(Array(this._capacity + 1).fill(0));
      }
      table[n][this._capacity] = result.value;
  
      const cell = new window.CellDetail(n, this._capacity);
      cell.cellValue = result.value;
      this._contributingCells[[n, this._capacity]] = cell;
  
      this._bestItems = result.items;
  
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
  
  window.KnapsackAlgorithmRecursive = KnapsackAlgorithmRecursive;