import {
  PurchaseOrderDetailResponse,
  PurchaseOrderItemResponse,
  QuoteItem,
  SkuList,
} from '@/services/purchase/typings.d';
import dayjs from 'dayjs';
import { OrderStatus } from './constants';

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
  tracking_info?: {
    tracking_no_list: string[];
    remark: string;
  };
};

export type ItemQuoteRow = {
  itemKey: string;
  order_item_id?: number;
  sku_id: string | number;
  sku_name: string;
  quantity: number;
  product_name?: string;
  status: { code: number; name: string };
  supplier_name?: string; // 已选中的供应商名称
  third_code?: string; // 产品编码
  limit_price?: number; // 采购最高限价
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
  typeof val === 'number' && val ? `¥${val.toFixed(2)}` : '-';

export const PurchaseStatusColorMap = {
  [OrderStatus.DRAFT]: 'green',
  [OrderStatus.PENDING_APPROVAL]: 'blue',
  [OrderStatus.APPROVAL_REJECTED]: 'red',
  [OrderStatus.AWAIT_INQUIRY]: 'orange',
  [OrderStatus.INQUIRING]: 'orange',
  [OrderStatus.INQUIRY_COMPLETED]: 'blue',
  [OrderStatus.QUOTED]: 'blue',
  [OrderStatus.PRICE_PENDING_APPROVAL]: 'orange',
  [OrderStatus.PRICE_APPROVAL_REJECTED]: 'red',
  [OrderStatus.ORDERED]: 'purple',
  [OrderStatus.ARRIVED]: 'green',
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
  quotes: SkuList[],
): ItemQuoteRow[] => {
  if (!purchase || !purchase.items) return [];
  if (!quotes || quotes.length === 0) return [];

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
      supplier_name: item.supplier_name, // 保存供应商名称
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
  quotes.forEach((skuQuote: SkuList) => {
    const targetKey = skuMap.get(String(skuQuote.sku_id));

    if (targetKey) {
      const itemData = itemMap.get(targetKey);
      if (itemData) {
        // 保存 third_code（产品编码）
        itemData.third_code = skuQuote.third_code;
        // 保存 limit_price（采购最高限价）
        itemData.limit_price = skuQuote.limit_price;

        // 遍历该 SKU 的所有报价项
        skuQuote.quote_items.forEach((quoteItem: QuoteItem) => {
          // 检查是否已存在相同的报价（避免重复）
          const existingQuote = itemData.quotes.find(
            (q) => q.quote_no === String(quoteItem.quote_no),
          );

          if (!existingQuote) {
            const totalPrice = quoteItem.quote_price * skuQuote.quantity;
            itemData.quotes.push({
              quote_no: String(quoteItem.quote_no),
              supplier_name: quoteItem.supplier_name,
              inquiry_item_id: quoteItem.inquiry_no, // 使用 inquiry_no 作为 inquiry_item_id
              sku_id: skuQuote.sku_id,
              quote_price: quoteItem.quote_price,
              total_price: totalPrice,
              expected_delivery_date: quoteItem.expected_delivery_date,
              remark: quoteItem.remark || '',
              tracking_info: quoteItem.tracking_info,
            });
          }
        });
      }
    }
  });

  return Array.from(itemMap.values());
};

export const formatDate = (
  date: string | undefined | null,
  isDate: boolean = false,
): string => {
  return date &&
    date !== '1970-01-01 00:00:00' &&
    date !== '0001-01-01 00:00:00' &&
    date !== '0001-01-01'
    ? dayjs(date).format(isDate ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss')
    : '-';
};
