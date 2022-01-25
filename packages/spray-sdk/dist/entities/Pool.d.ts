import { ChainId, CurrencyAmount, Token } from '@champagneswap/core-sdk';
import { Fee } from '../enums/Fee';
export declare abstract class Pool {
    abstract readonly liquidityToken: Token;
    abstract get chainId(): ChainId;
    abstract get fee(): Fee;
    abstract get assets(): Token[];
    abstract get reserves(): CurrencyAmount<Token>[];
    abstract getLiquidityMinted(totalSupply: CurrencyAmount<Token>, tokenAmountA: CurrencyAmount<Token>, tokenAmountB: CurrencyAmount<Token>): CurrencyAmount<Token>;
    abstract getLiquidityValue(token: Token, totalSupply: CurrencyAmount<Token>, liquidity: CurrencyAmount<Token>): CurrencyAmount<Token>;
    abstract involvesToken(token: Token): boolean;
}
