export const formatPriceToYuan = (price: number | undefined) => {
  if (!price) return '-';
  return (price / 100).toFixed(2) + '元';
};

export const formatPriceToFen = (price: number | undefined) => {
  if (!price) return undefined;
  return Number((price * 100).toFixed(0));
};

export const formatPriceToYuanNumber = (price: number) => {
  return Number(price / 100);
};

export const formatPriceToDiscount = (
  originPrice: number | undefined,
  price: number | undefined,
) => {
  if (!originPrice || !price) return undefined;
  return ((price / originPrice) * 10).toFixed(1) + '折';
};
