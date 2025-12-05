import {
  PurchaseOrderDetailResponse,
  PurchaseOrderItemResponse,
} from '@/services/purchase/typings.d';
import type { OrderQuoteDetailResponse } from '@/services/quote';
import dayjs from 'dayjs';
import { OrderItemStatus, OrderStatus } from './constants';

export type SelectedSupplierMap = Record<
  string,
  {
    quote_no: string;
    supplier_name: string;
    inquiry_item_id?: number;
    sku_id?: number | string;
    order_item_id?: number;
  }
>;

export type QuoteCard = {
  quote_no: string;
  supplier_name: string;
  inquiry_item_id?: number;
  sku_id?: number | string;
  quote_price: number;
  total_price: number;
  expected_delivery_date?: string;
  remark: string;
};

export type ItemQuoteRow = {
  itemKey: string;
  order_item_id?: number;
  sku_id: string | number;
  sku_name: string;
  quantity: number;
  product_name?: string;
  status?: { code: number; name: string };
  quotes: QuoteCard[];
};

export const getOrderItemKey = (item: PurchaseOrderItemResponse) => {
  if (item.id) {
    return `order_${item.id}`;
  }
  const skuId =
    typeof item.sku_id === 'number' ? item.sku_id.toString() : item.sku_id;
  return `sku_${skuId}_${item.sku_name}`;
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

/**
 * 根据采购单状态码获取对应的颜色
 * @param statusCode 状态码
 * @returns Ant Design Tag 的颜色值
 */
export const getPurchaseStatusColor = (statusCode: number): string => {
  switch (statusCode) {
    case OrderStatus.DRAFT:
      return 'green';
    case OrderStatus.PENDING_APPROVAL:
      return 'blue';
    case OrderStatus.APPROVAL_REJECTED:
      return 'red';
    case OrderStatus.AWAIT_INQUIRY:
      return 'orange';
    case OrderStatus.INQUIRING:
      return 'orange';
    case OrderStatus.QUOTED:
      return 'blue';
    case OrderStatus.PRICE_PENDING_APPROVAL:
      return 'orange';
    case OrderStatus.PRICE_APPROVAL_REJECTED:
      return 'red';
    case OrderStatus.ORDERED:
      return 'purple';
    case OrderStatus.ARRIVED:
      return 'green';
    default:
      return 'default';
  }
};

export const buildSelectionsFromPurchaseItems = (
  items: PurchaseOrderItemResponse[] = [],
): SelectedSupplierMap => {
  const result: SelectedSupplierMap = {};
  items.forEach((item) => {
    if (item.supplier_name) {
      const key = getOrderItemKey(item);
      result[key] = {
        quote_no: item.quote_no ? String(item.quote_no) : '',
        supplier_name: item.supplier_name,
        inquiry_item_id: 0,
        sku_id: item.sku_id.toString(),
        order_item_id: item.id,
      };
    }
  });
  return result;
};

export const buildItemQuoteData = (
  purchase: PurchaseOrderDetailResponse | null,
  quotes: OrderQuoteDetailResponse[],
): ItemQuoteRow[] => {
  if (!purchase || !purchase.items) return [];

  // 1. 首先基于采购单商品构建基础数据
  const itemMap = new Map<string, ItemQuoteRow>();
  const orderItemIdMap = new Map<number, string>(); // order_item_id -> itemKey
  const skuMap = new Map<string, string>(); // sku_id -> itemKey

  purchase.items.forEach((item) => {
    const key = getOrderItemKey(item);
    itemMap.set(key, {
      itemKey: key,
      order_item_id: item.id,
      sku_id: item.sku_id,
      sku_name: item.sku_name,
      quantity: item.quantity,
      product_name: item.sku_name,
      status: item.status,
      quotes: [],
    });

    // 建立索引映射
    if (item.id) {
      orderItemIdMap.set(item.id, key);
    }
    if (item.sku_id) {
      skuMap.set(String(item.sku_id), key);
    }
  });

  // 2. 遍历报价数据，将报价信息关联到对应的商品
  quotes.forEach((quote) => {
    quote.items.forEach((quoteItem) => {
      let targetKey: string | undefined;

      // 通过 sku_id 匹配
      if (!targetKey && quoteItem.sku_id) {
        targetKey = skuMap.get(String(quoteItem.sku_id));
      }

      // 如果仍然找不到，创建一个新的条目（这种情况应该很少见）
      if (!targetKey) {
        const newKey = `sku_${quoteItem.sku_id}_${quoteItem.sku_name}`;

        if (!itemMap.has(newKey)) {
          itemMap.set(newKey, {
            itemKey: newKey,
            sku_id: quoteItem.sku_id,
            sku_name: quoteItem.sku_name,
            quantity: quoteItem.quantity,
            product_name: quoteItem.sku_name,
            quotes: [],
          });
        }
        targetKey = newKey;
      }

      // 将报价信息添加到对应商品
      if (targetKey) {
        const itemData = itemMap.get(targetKey);
        if (itemData) {
          // 添加报价信息（避免重复）
          const existingQuote = itemData.quotes.find(
            (q) =>
              q.quote_no === String(quoteItem.quote_no) &&
              q.sku_id === quoteItem.sku_id,
          );

          if (!existingQuote) {
            const totalPrice = quoteItem.quote_price * quoteItem.quantity;
            itemData.quotes.push({
              quote_no: String(quoteItem.quote_no),
              supplier_name: quote.supplier_name,
              inquiry_item_id: quoteItem.inquiry_item_id,
              sku_id: quoteItem.sku_id,
              quote_price: quoteItem.quote_price,
              total_price: totalPrice,
              expected_delivery_date: quoteItem.expected_delivery_date,
              remark: quoteItem.remark,
            });
          }
        }
      }
    });
  });

  return Array.from(itemMap.values());
};

export const getItemStatusColor = (statusCode: number): string => {
  switch (statusCode) {
    case OrderItemStatus.PENDING_QUOTE:
      return 'warning';
    case OrderItemStatus.SELECTED:
      return 'blue';
    case OrderItemStatus.ORDERED:
      return 'purple';
    case OrderItemStatus.ARRIVED:
      return 'success';
    default:
      return 'default';
  }
};

export const formatDate = (
  date: string | undefined | null,
  isDate: boolean = false,
): string => {
  return date && date !== '1970-01-01 00:00:00'
    ? dayjs(date).format(isDate ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss')
    : '-';
};
