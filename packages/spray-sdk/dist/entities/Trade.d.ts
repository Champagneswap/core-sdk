import { Currency, CurrencyAmount, Percent, Price, TradeType } from '@champagneswap/core-sdk';
import { MultiRoute } from '@champagneswap/castle';
/**
 * Represents a trade executed against a list of pools.
 * Does not account for slippage, i.e. trades that front run this trade and move the price.
 */
export declare class Trade<TInput extends Currency, TOutput extends Currency, TTradeType extends TradeType> {
    /**
     * The route of the trade, i.e. which pools the trade goes through and the input/output currencies.
     */
    readonly route: MultiRoute;
    /**
     * The type of the trade, either exact in or exact out.
     */
    readonly tradeType: TTradeType;
    /**
     * The input amount for the trade assuming no slippage.
     */
    readonly inputAmount: CurrencyAmount<TInput>;
    /**
     * The output amount for the trade assuming no slippage.
     */
    readonly outputAmount: CurrencyAmount<TOutput>;
    /**
     * The price expressed in terms of output amount/input amount.
     */
    readonly executionPrice: Price<TInput, TOutput>;
    /**
     * Constructs an exact in trade with the given amount in and route
     * @param route route of the exact in trade
     * @param amountIn the amount being passed in
     */
    static exactIn<TInput extends Currency, TOutput extends Currency>(route: MultiRoute): Trade<TInput, TOutput, TradeType.EXACT_INPUT>;
    /**
     * Constructs an exact out trade with the given amount out and route
     * @param route route of the exact out trade
     * @param amountOut the amount returned by the trade
     */
    static exactOut<TInput extends Currency, TOutput extends Currency>(route: MultiRoute): Trade<TInput, TOutput, TradeType.EXACT_OUTPUT>;
    /**
     * The percent difference between the mid price before the trade and the trade execution price.
     */
    readonly priceImpact: Percent;
    constructor(route: MultiRoute, tradeType: TTradeType);
    /**
     * Get the minimum amount that must be received from this trade for the given slippage tolerance
     * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
     */
    minimumAmountOut(slippageTolerance: Percent): CurrencyAmount<TOutput>;
    /**
     * Get the maximum amount in that can be spent via this trade for the given slippage tolerance
     * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
     */
    maximumAmountIn(slippageTolerance: Percent): CurrencyAmount<TInput>;
    static bestTradeExactIn<TInput extends Currency, TOutput extends Currency>(route: MultiRoute, currencyAmountIn: CurrencyAmount<TInput>, currencyOut: TOutput): Trade<TInput, TOutput, TradeType.EXACT_INPUT>;
    static bestTradeExactOut<TInput extends Currency, TOutput extends Currency>(route: MultiRoute, currencyIn: TInput, currencyAmountOut: CurrencyAmount<TOutput>): Trade<TInput, TOutput, TradeType.EXACT_OUTPUT>;
}
