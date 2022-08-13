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
    giftType: 'BetaAccess1Month' | 'BetaAccess12Months' | 'LabsAccess';
    output: string;
  };
  type: TokenTypes.Redeem;
}
