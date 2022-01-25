import { BigNumber } from "@ethersproject/bignumber";
export declare function ASSERT(f: () => boolean, t?: string): void;
export declare function closeValues(a: number, b: number, accuracy: number): boolean;
export declare function calcSquareEquation(a: number, b: number, c: number): [number, number];
export declare function revertPositive(f: (x: number) => number, out: number, hint?: number): number;
export declare function getBigNumber(value: number): BigNumber;
