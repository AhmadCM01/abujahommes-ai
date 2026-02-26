declare module 'ml-regression' {
  export class SimpleLinearRegression {
    constructor(x: number[][], y: number[]);
    predict(x: number[]): number;
    score(x: number[][], y: number[]): number;
    get coefficients(): [number, number];
    get intercept(): number;
    get slope(): number;
  }
  
  export class PolynomialRegression {
    constructor(x: number[], y: number[], degree: number);
    predict(x: number): number;
    score(x: number[], y: number[]): number;
    get coefficients(): number[];
    get degree(): number;
  }
}
