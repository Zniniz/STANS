/**
 * Union-Find (Disjoint Set Union) Data Structure
 * Used for cycle detection in Kruskal's algorithm
 */
export class UnionFind {
  private parent: Map<string, string>;
  private rank: Map<string, number>;

  constructor(nodes: string[]) {
    this.parent = new Map();
    this.rank = new Map();

    // Initialize: each node is its own parent (separate set)
    nodes.forEach(node => {
      this.parent.set(node, node);
      this.rank.set(node, 0);
    });
  }

  /**
   * Find the root of the set containing node x
   * Uses path compression for optimization
   */
  find(x: string): string {
    if (this.parent.get(x) !== x) {
      // Path compression: make every node point directly to root
      this.parent.set(x, this.find(this.parent.get(x)!));
    }
    return this.parent.get(x)!;
  }

  /**
   * Union two sets containing nodes x and y
   * Uses union by rank for optimization
   * Returns true if union was performed, false if nodes were already in same set
   */
  union(x: string, y: string): boolean {
    const rootX = this.find(x);
    const rootY = this.find(y);

    // Already in same set - would create cycle
    if (rootX === rootY) {
      return false;
    }

    // Union by rank: attach smaller tree under larger tree
    const rankX = this.rank.get(rootX)!;
    const rankY = this.rank.get(rootY)!;

    if (rankX < rankY) {
      this.parent.set(rootX, rootY);
    } else if (rankX > rankY) {
      this.parent.set(rootY, rootX);
    } else {
      this.parent.set(rootY, rootX);
      this.rank.set(rootX, rankX + 1);
    }

    return true;
  }

  /**
   * Check if two nodes are in the same set
   */
  isConnected(x: string, y: string): boolean {
    return this.find(x) === this.find(y);
  }

  /**
   * Get all current sets as a map of root -> members
   */
  getSets(): Map<string, string[]> {
    const sets = new Map<string, string[]>();
    
    this.parent.forEach((_, node) => {
      const root = this.find(node);
      if (!sets.has(root)) {
        sets.set(root, []);
      }
      sets.get(root)!.push(node);
    });

    return sets;
  }
}
