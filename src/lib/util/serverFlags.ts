const ServerFlags = {
  HAS_ECONOMY: 1 << 0,
  HAS_LEVELING: 1 << 1,
  HAS_SHOP: 1 << 2,
  HAS_CHAT_MONEY: 1 << 3,
};

function resolveServerFlags(bitField: number) {
  const flags = Object.entries(ServerFlags).reduce((acc, [key, value]) => {
    if (bitField & value) {
      acc.push(key);
    }
    return acc;
  }, []);
  return flags;
}
