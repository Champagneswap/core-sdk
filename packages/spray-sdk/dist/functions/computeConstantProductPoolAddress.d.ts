import { Token } from '@champagneswap/core-sdk';
import { Fee } from '../enums/Fee';
export declare const computeConstantProductPoolAddress: ({ factoryAddress, tokenA, tokenB, fee, twap, }: {
    factoryAddress: string;
    tokenA: Token;
    tokenB: Token;
    fee: Fee;
    twap: boolean;
}) => string;
