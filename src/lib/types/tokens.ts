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

export interface RedeemTokenData extends BaseToken {
  data: {
    codeType: 'Subscription1Month' | 'LabsAccess';
    output: string;
    redeemed: boolean;
  };
  type: TokenTypes.Redeem;
}
