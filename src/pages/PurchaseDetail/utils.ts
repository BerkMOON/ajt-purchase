import {
  PurchaseDetailItem,
  PurchaseItem,
} from '@/services/purchase/typings.d';
import { SupplierQuoteSummary } from '@/services/quote';

export type SelectedSupplierMap = Record<
  string,
  { quote_no: string; supplier_name: string; inquiry_item_id: number }
>;

export type QuoteCard = {
  quote_no: string;
  supplier_name: string;
  inquiry_item_id: number;
  quote_price: number;
  total_price: number;
  expected_delivery_days: number;
  remark: string;
};

export type ItemQuoteRow = {
  itemKey: string;
  order_item_id?: number;
  inquiry_item_id?: number;
  sku_id: string | number;
  product_name: string;
  brand: string;
  quantity: number;
  avg_price?: number;
  quotes: QuoteCard[];
};

export const getOrderItemKey = (item: PurchaseDetailItem) => {
  if (item.id) {
    return `order_${item.id}`;
  }
  return `sku_${item.sku_id}_${item.product_name}`;
};

export const getQuoteItemKey = (quoteItem: any) => {
  if (quoteItem.order_item_id) {
    return `order_${quoteItem.order_item_id}`;
  }
  if (quoteItem.sku_id && quoteItem.product_name) {
    return `sku_${quoteItem.sku_id}_${quoteItem.product_name}`;
  }
  if (quoteItem.inquiry_item_id) {
    return `inquiry_${quoteItem.inquiry_item_id}`;
  }
  return `quote_${quoteItem.quote_no}`;
};

export const formatCurrency = (val?: number | null) =>
  typeof val === 'number' ? `¥${val.toFixed(2)}` : '-';

export const buildSelectionsFromPurchaseItems = (
  items: PurchaseDetailItem[] = [],
): SelectedSupplierMap => {
  const result: SelectedSupplierMap = {};
  items.forEach((item) => {
    if (item.selected_supplier_name) {
      const key = getOrderItemKey(item);
      result[key] = {
        quote_no: '',
        supplier_name: item.selected_supplier_name,
        inquiry_item_id: 0,
      };
    }
  });
  return result;
};

export const buildItemQuoteData = (
  purchase: PurchaseItem | null,
  quotes: SupplierQuoteSummary[],
): ItemQuoteRow[] => {
  if (!purchase) return [];

  const itemMap = new Map<string, ItemQuoteRow>();
  const skuAliasMap = new Map<string, string>();

  (purchase.items || []).forEach((item) => {
    const key = getOrderItemKey(item);
    if (!itemMap.has(key)) {
      itemMap.set(key, {
        itemKey: key,
        order_item_id: item.id,
        sku_id: item.sku_id,
        product_name: item.product_name,
        brand: item.brand,
        quantity: item.quantity,
        avg_price: item.avg_price,
        quotes: [],
      });
    }
    const skuKey = `sku_${item.sku_id}_${item.product_name}`;
    skuAliasMap.set(skuKey, key);
  });

  (quotes || []).forEach((quote) => {
    if (quote.status.code < 1) return;
    quote.items.forEach((item) => {
      const orderKey = item.order_item_id
        ? `order_${item.order_item_id}`
        : undefined;
      const skuKey =
        item.sku_id && item.product_name
          ? `sku_${item.sku_id}_${item.product_name}`
          : undefined;
      const inquiryKey = item.inquiry_item_id
        ? `inquiry_${item.inquiry_item_id}`
        : undefined;

      const candidateKeys = [
        orderKey,
        skuKey ? skuAliasMap.get(skuKey) : undefined,
        skuKey,
        inquiryKey,
      ].filter(Boolean) as string[];

      let targetKey = candidateKeys.find((key) => itemMap.has(key));

      if (!targetKey) {
        targetKey = orderKey || skuKey || inquiryKey || getQuoteItemKey(item);
        if (!itemMap.has(targetKey)) {
          itemMap.set(targetKey, {
            itemKey: targetKey,
            order_item_id: item.order_item_id,
            inquiry_item_id: item.inquiry_item_id,
            sku_id: item.sku_id,
            product_name: item.product_name,
            brand: item.brand,
            quantity: item.quantity,
            avg_price: item.avg_price,
            quotes: [],
          });
        }
        if (skuKey && !skuAliasMap.has(skuKey)) {
          skuAliasMap.set(skuKey, targetKey);
        }
      }

      const itemData = itemMap.get(targetKey)!;
      if (!itemData.inquiry_item_id) {
        itemData.inquiry_item_id = item.inquiry_item_id;
      }
      itemData.quotes.push({
        quote_no: quote.quote_no,
        supplier_name: quote.supplier_name,
        inquiry_item_id: item.inquiry_item_id,
        quote_price: item.quote_price,
        total_price: item.total_price,
        expected_delivery_days: item.expected_delivery_days,
        remark: item.remark,
      });
    });
  });

  return Array.from(itemMap.values());
};
