import { CurrencyAmount, Price, Token } from '@champagneswap/core-sdk';
import { Fee } from '../enums';
import JSBI from 'jsbi';
import { Pool } from './Pool';
export declare class HybridPool implements Pool {
    readonly liquidityToken: Token;
    readonly fee: Fee;
    readonly a: JSBI;
    private readonly tokenAmounts;
    static getAddress(tokenA: Token, tokenB: Token, fee?: Fee, a?: JSBI): string;
    constructor(currencyAmountA: CurrencyAmount<Token>, currencyAmountB: CurrencyAmount<Token>, fee?: Fee, a?: JSBI);
    /**
     * Returns true if the token is either token0 or token1
     * @param token to check
     */
    involvesToken(token: Token): boolean;
    /**
     * Returns the current mid price of the pair in terms of token0, i.e. the ratio of reserve1 to reserve0
     */
    get token0Price(): Price<Token, Token>;
    /**
     * Returns the current mid price of the pair in terms of token1, i.e. the ratio of reserve0 to reserve1
     */
    get token1Price(): Price<Token, Token>;
    /**
     * Return the price of the given token in terms of the other token in the pair.
     * @param token token to return price of
     */
    priceOf(token: Token): Price<Token, Token>;
    /**
     * Returns the chain ID of the tokens in the pair.
     */
    get chainId(): number;
    get token0(): Token;
    get token1(): Token;
    get assets(): Token[];
    get reserves(): CurrencyAmount<Token>[];
    get reserve0(): CurrencyAmount<Token>;
    get reserve1(): CurrencyAmount<Token>;
    reserveOf(token: Token): CurrencyAmount<Token>;
    getNonOptimalMintFee(amount0: JSBI, amount1: JSBI, reserve0: JSBI, reserve1: JSBI): [JSBI, JSBI];
    getLiquidityMinted(totalSupply: CurrencyAmount<Token>, tokenAmountA: CurrencyAmount<Token>, tokenAmountB: CurrencyAmount<Token>): CurrencyAmount<Token>;
    getLiquidityValue(token: Token, totalSupply: CurrencyAmount<Token>, liquidity: CurrencyAmount<Token>): CurrencyAmount<Token>;
}
