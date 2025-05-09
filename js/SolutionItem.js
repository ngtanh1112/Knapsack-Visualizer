class SolutionItem {
    constructor(item, index, capacity, inSolution) {
      this.weight = item.weight;
      this.value = item.value;
      this.index = index;
      this.capacity = capacity;
      this.inSolution = inSolution;
    }
  }
  
window.SolutionItem = SolutionItem;