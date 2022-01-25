import { Currency, Pair, Route } from '@champagneswap/core-sdk';
import { MultiRoute } from '@champagneswap/castle';
export declare function convertTinesSingleRouteToLegacyRoute<TInput extends Currency, TOutput extends Currency>(route: MultiRoute, allPairs: Pair[], input: TInput, output: TOutput): Route<TInput, TOutput>;
