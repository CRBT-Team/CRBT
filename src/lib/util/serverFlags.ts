const flags = {
  ServerFlags: {
    HasEconomy: 1 << 0,
    HasLeveling: 1 << 1,
    HasShop: 1 << 2,
    HasChatMoney: 1 << 3,
  },
  UserFlags: {
    Developer: 1 << 0,
    VeteranEconomist: 1 << 1,
  },
};

export function resolveFlags(bitField: number, namespace: keyof typeof flags) {
  return Object.entries(flags[namespace]).reduce((acc, [key, value]) => {
    if (bitField & value) {
      acc.push(key);
    }
    return acc;
  }, []);
}

export const { ServerFlags, UserFlags } = flags;
