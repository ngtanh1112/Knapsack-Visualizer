class KnapsackAlgorithmBruteForce {
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
      let maxValue = 0;
      let bestItems = [];
  
      for (let i = 0; i < (1 << n); i++) {
        let currentWeight = 0;
        let currentValue = 0;
        let selectedItems = [];
  
        for (let j = 0; j < n; j++) {
          if (i & (1 << j)) {
            currentWeight += this._items[j].weight;
            currentValue += this._items[j].value;
            selectedItems.push(j + 1);
          }
        }
  
        // Lưu bước trực quan hóa
        this._steps.push({
          description: `Kiểm tra tập hợp [${selectedItems.join(', ')}]: Trọng lượng ${currentWeight}, Giá trị ${currentValue}${currentWeight <= this._capacity && currentValue > maxValue ? ' (Cập nhật tối ưu)' : ''}`,
          selectedItems: selectedItems,
          currentWeight,
          currentValue,
          isValid: currentWeight <= this._capacity,
          isOptimal: currentWeight <= this._capacity && currentValue > maxValue
        });
  
        if (currentWeight <= this._capacity && currentValue > maxValue) {
          maxValue = currentValue;
          bestItems = selectedItems.map(idx => idx - 1);
        }
  
        this._maxLengthItem = Math.max(this._maxLengthItem, currentValue);
      }
  
      const table = [];
      for (let i = 0; i <= n; i++) {
        table.push(Array(this._capacity + 1).fill(0));
      }
      table[n][this._capacity] = maxValue;
  
      const cell = new window.CellDetail(n, this._capacity);
      cell.cellValue = maxValue;
      this._contributingCells[[n, this._capacity]] = cell;
  
      this._bestItems = bestItems;
  
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
  
  window.KnapsackAlgorithmBruteForce = KnapsackAlgorithmBruteForce;