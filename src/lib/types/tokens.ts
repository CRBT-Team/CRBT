export interface BaseToken {
  token: string;
}

export type TokenData = APITokenData | RedeemTokenData;

export enum TokenTypes {
  API = 'API',
  Redeem = 'REDEEM',
}

export interface APITokenData extends BaseToken {
  data: {
    userId: string;
    guildId?: string;
  };
  type: TokenTypes.API;
}

export enum RedeemableProduct {
  PREMIUM,
}

export interface RedeemTokenData extends BaseToken {
  data: {
    product: RedeemableProduct;
    monthsValue?: number;
    redeemed: boolean;
  };
  type: TokenTypes.Redeem;
}
