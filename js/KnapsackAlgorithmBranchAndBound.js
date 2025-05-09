class KnapsackAlgorithmBranchAndBound {
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
  
    _getUpperBound(index, currentWeight, currentValue, capacity) {
      let bound = currentValue;
      let weight = currentWeight;
  
      for (let i = index + 1; i < this._items.length; i++) {
        if (weight + this._items[i].weight <= capacity) {
          weight += this._items[i].weight;
          bound += this._items[i].value;
        } else {
          let remaining = capacity - weight;
          bound += (remaining / this._items[i].weight) * this._items[i].value;
          break;
        }
      }
  
      return bound;
    }
  
    _knapsack() {
      const sortedItems = [...this._items].map((item, index) => ({ ...item, originalIndex: index }))
        .sort((a, b) => (b.value / b.weight) - (a.value / a.weight));
      const n = sortedItems.length;
  
      let bestValue = 0;
      let bestItems = [];
  
      const queue = [{
        index: -1,
        value: 0,
        weight: 0,
        items: []
      }];
  
      while (queue.length > 0) {
        const node = queue.shift();
  
        const index = node.index + 1;
        if (index >= n) continue;
  
        const bound = this._getUpperBound(node.index, node.weight, node.value, this._capacity);
        this._steps.push({
          description: `Xét nút [${node.items.join(', ')}]: Giá trị ${node.value}, Trọng lượng ${node.weight}, Bound ${bound.toFixed(2)}${bound <= bestValue ? ' (Cắt tỉa)' : ''}`,
          value: node.value,
          weight: node.weight,
          bound,
          items: node.items,
          isPruned: bound <= bestValue
        });
  
        if (bound <= bestValue) continue;
  
        queue.push({
          index: index,
          value: node.value,
          weight: node.weight,
          items: [...node.items]
        });
  
        if (node.weight + sortedItems[index].weight <= this._capacity) {
          const newValue = node.value + sortedItems[index].value;
          const newWeight = node.weight + sortedItems[index].weight;
          const newItems = [...node.items, index];
  
          this._steps.push({
            description: `Thêm vật phẩm ${index + 1}: Giá trị ${newValue}, Trọng lượng ${newWeight}${newValue > bestValue ? ' (Cập nhật tối ưu)' : ''}`,
            value: newValue,
            weight: newWeight,
            bound: this._getUpperBound(index, newWeight, newValue, this._capacity),
            items: newItems,
            isPruned: false,
            isOptimal: newValue > bestValue
          });
  
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
  
        this._maxLengthItem = Math.max(this._maxLengthItem, bestValue);
      }
  
      const table = [];
      for (let i = 0; i <= n; i++) {
        table.push(Array(this._capacity + 1).fill(0));
      }
      table[n][this._capacity] = bestValue;
  
      const cell = new window.CellDetail(n, this._capacity);
      cell.cellValue = bestValue;
      this._contributingCells[[n, this._capacity]] = cell;
  
      this._bestItems = bestItems.map(idx => sortedItems[idx].originalIndex);
  
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
  
  window.KnapsackAlgorithmBranchAndBound = KnapsackAlgorithmBranchAndBound;