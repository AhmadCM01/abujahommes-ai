declare module 'ml-matrix' {
  export class Matrix {
    constructor(data: number[][]);
    static ones(rows: number, cols: number): Matrix;
    static zeros(rows: number, cols: number): Matrix;
    static identity(size: number): Matrix;
    get rows(): number;
    get columns(): number;
    get(row: number, col: number): number;
    set(row: number, col: number, value: number): void;
    transpose(): Matrix;
    multiply(other: Matrix): Matrix;
    inverse(): Matrix;
    determinant(): number;
    to2DArray(): number[][];
  }
}
