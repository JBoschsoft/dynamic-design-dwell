
// Helper functions for the onboarding process
export const calculateTokenPrice = (quantity: number) => {
  if (quantity >= 150) return 5;
  if (quantity >= 100) return 6;
  if (quantity >= 50) return 7;
  return 8;
};

export const getDiscountPercentage = (quantity: number) => {
  const basePrice = 8;
  const currentPrice = calculateTokenPrice(quantity);
  return Math.round(((basePrice - currentPrice) / basePrice) * 100);
};

export const calculateTotalPrice = (amount: number) => {
  const tokenPrice = calculateTokenPrice(amount);
  return amount * tokenPrice;
};

export const formatTokenValue = (value: number[]) => {
  const amount = value[0];
  const price = calculateTokenPrice(amount);
  return `${amount} tokenów (${price} PLN/token)`;
};

export const getPriceTierDescription = (amount: number) => {
  if (amount < 50) {
    return "Standardowa cena";
  } else if (amount < 100) {
    return "Oszczędzasz 12.5%";
  } else if (amount < 150) {
    return "Oszczędzasz 25%";
  } else {
    return "Oszczędzasz 37.5% - Najlepsza oferta!";
  }
};
