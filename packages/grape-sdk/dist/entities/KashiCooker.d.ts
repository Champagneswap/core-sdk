import { ChainId } from '@champagneswap/core-sdk';
import JSBI from 'jsbi';
import { KashiAction } from '../enums';
import { KashiPermit } from '../interfaces';
import { Web3Provider } from '@ethersproject/providers';
export declare class KashiCooker {
    private pair;
    private account;
    private library;
    private chainId;
    private actions;
    private values;
    private datas;
    constructor(pair: any, account: string | null | undefined, library: Web3Provider | undefined, chainId: ChainId | undefined);
    add(action: KashiAction, data: string, value?: JSBI): void;
    approve(permit: KashiPermit): void;
    updateExchangeRate(mustUpdate?: boolean, minRate?: JSBI, maxRate?: JSBI): KashiCooker;
    bentoDepositCollateral(amount: JSBI): KashiCooker;
    bentoWithdrawCollateral(amount: JSBI, share: JSBI): KashiCooker;
    bentoTransferCollateral(share: JSBI, toAddress: string): KashiCooker;
    repayShare(part: JSBI): KashiCooker;
    addCollateral(amount: JSBI, fromBento: boolean): KashiCooker;
    addAsset(amount: JSBI, fromBento: boolean): KashiCooker;
    removeAsset(fraction: JSBI, toBento: boolean): KashiCooker;
    removeCollateral(share: JSBI, toBento: boolean): KashiCooker;
    removeCollateralFraction(fraction: JSBI, toBento: boolean): KashiCooker;
    borrow(amount: JSBI, toBento: boolean, toAddress?: string): KashiCooker;
    repay(amount: JSBI, fromBento: boolean): KashiCooker;
    repayPart(part: JSBI, fromBento: boolean): KashiCooker;
    action(address: string, value: JSBI, data: string, useValue1: boolean, useValue2: boolean, returnValues: number): void;
    cook(): Promise<{
        success: boolean;
        tx?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        tx: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        tx?: undefined;
    }>;
}
