# 采购管理 API 使用文档

## 概述

本目录包含了采购管理系统的所有前端 API 接口封装，涵盖了从采购单创建到订单完成的全流程。

## API 模块

### 1. PurchaseController - 采购单管理

**主要接口：**

- `getAllPurchases` - 获取采购单列表
- `getDraftPurchases` - 获取草稿列表
- `getPurchaseDetail` - 获取采购单详情
- `createPurchase` - 创建采购单
- `submitPurchase` - 提交采购单
- `getStatusLogs` - 获取状态变更日志

**使用示例：**

```typescript
import { PurchaseAPI } from '@/services/purchase';

// 获取采购单列表
const { data } = await PurchaseAPI.getAllPurchases({
  page: 1,
  page_size: 10,
  status: 2, // 待询价
});

// 提交采购单
await PurchaseAPI.submitPurchase('PO1234567890');

// 获取状态日志
const logs = await PurchaseAPI.getStatusLogs('PO1234567890');
```

### 2. InquiryController - 询价管理

**主要接口：**

- `sendInquiry` - 发送询价
- `getInquiriesByOrder` - 查询采购单的询价列表
- `getInquiryDetail` - 查询询价单详情
- `getSupplierInquiries` - 供应商查看询价列表
- `submitNoQuoteReason` - 供应商提交未报价原因

**使用示例：**

```typescript
import { InquiryAPI } from '@/services/purchase';

// 发送询价
await InquiryAPI.sendInquiry({
  order_id: 1,
  order_no: 'PO1234567890',
  supplier_ids: [1, 2, 3],
  inquiry_deadline: '2025-12-31 23:59:59',
  operator_id: 1,
  operator_name: '张三',
  remark: '紧急询价',
});

// 查询询价列表
const inquiries = await InquiryAPI.getInquiriesByOrder('PO1234567890');

// 供应商查看自己的询价
const supplierInquiries = await InquiryAPI.getSupplierInquiries({
  supplier_id: 1,
  page: 1,
  size: 10,
  status: 1, // 待报价
});
```

### 3. QuoteController - 报价管理

**主要接口：**

- `submitQuote` - 供应商提交报价
- `getQuotesByOrder` - 查询采购单的所有报价
- `getQuoteDetail` - 查询报价详情
- `getQuoteComparison` - 获取报价比价信息

**使用示例：**

```typescript
import { QuoteAPI } from '@/services/purchase';

// 供应商提交报价
await QuoteAPI.submitQuote({
  inquiry_id: 1,
  supplier_id: 1,
  supplier_name: '某供应商',
  total_amount: 10000,
  expected_delivery_days: 7,
  submit_user_id: 1,
  submit_user_name: '李四',
  remark: '优质配件',
  items: [
    {
      inquiry_item_id: 1,
      part_id: 1,
      quote_price: 50,
      brand: '博世',
      origin: '德国',
    },
  ],
});

// 获取报价比价
const comparison = await QuoteAPI.getQuoteComparison('PO1234567890');
```

### 4. PriceApprovalController - 价格审批管理

**主要接口：**

- `checkPriceThreshold` - 检查价格阈值
- `createApproval` - 创建价格审批
- `approvePrice` - 审批通过
- `rejectPrice` - 审批驳回
- `getPendingApprovals` - 获取待审批列表
- `getApprovalDetail` - 获取审批详情
- `getApprovalByQuote` - 根据报价获取审批

**使用示例：**

```typescript
import { PriceApprovalAPI } from '@/services/purchase';

// 检查价格阈值
const checkResult = await PriceApprovalAPI.checkPriceThreshold(123);
if (checkResult.data.need_approval) {
  // 创建审批
  await PriceApprovalAPI.createApproval({
    order_id: 1,
    quote_id: 123,
    supplier_id: 1,
    supplier_name: '某供应商',
    total_amount: 10000,
    historical_avg_amount: 8000,
    over_threshold_ratio: 25,
    applicant_id: 1,
    applicant_name: '张三',
    apply_reason: '该供应商提供更优质的产品',
  });
}

// 审批通过
await PriceApprovalAPI.approvePrice({
  approval_id: 1,
  approver_id: 2,
  approver_name: '李四',
  remark: '同意',
});

// 获取待审批列表
const approvals = await PriceApprovalAPI.getPendingApprovals({
  page: 1,
  size: 10,
});
```

### 5. ContractController - 采购合同管理

**主要接口：**

- `createContract` - 创建采购合同
- `getContractList` - 获取合同列表
- `getContractDetail` - 获取合同详情
- `sendToSupplier` - 发送给供应商
- `recordReceive` - 记录收货
- `completeContract` - 完成合同
- `cancelContract` - 取消合同

**使用示例：**

```typescript
import { ContractAPI } from '@/services/purchase';

// 创建采购合同
const result = await ContractAPI.createContract({
  order_id: 1,
  quote_id: 123,
  supplier_id: 1,
  supplier_name: '某供应商',
  store_id: 1,
  store_name: '某门店',
  contract_amount: 10000,
  expected_delivery_date: '2025-12-31',
  creator_id: 1,
  creator_name: '张三',
  remark: '紧急采购',
});

// 发送给供应商
await ContractAPI.sendToSupplier({
  contract_id: 1,
  operator_id: 1,
  operator_name: '张三',
});

// 记录收货
await ContractAPI.recordReceive({
  contract_id: 1,
  operator_id: 1,
  operator_name: '张三',
  items: [
    {
      contract_item_id: 1,
      received_quantity: 100,
      arrival_certificate_urls: 'https://example.com/img1.jpg',
      arrival_exception_type: 'QUALITY',
      arrival_exception_remark: '部分产品有质量问题',
    },
  ],
});

// 完成合同
await ContractAPI.completeContract({
  contract_id: 1,
  operator_id: 1,
  operator_name: '张三',
});
```

## 完整采购流程示例

```typescript
import {
  PurchaseAPI,
  InquiryAPI,
  QuoteAPI,
  PriceApprovalAPI,
  ContractAPI,
} from '@/services/purchase';

// 1. 创建并提交采购单
const purchase = await PurchaseAPI.createPurchase({
  expected_delivery_date: '2025-12-31',
  items: [
    {
      part_code: 'P001',
      part_name: '刹车片',
      specification: '标准型',
      quantity: 100,
      unit: '个',
      category_type: 'PARTS',
    },
  ],
});
await PurchaseAPI.submitPurchase(purchase.data.order_no);

// 2. 发送询价
await InquiryAPI.sendInquiry({
  order_id: purchase.data.id,
  order_no: purchase.data.order_no,
  supplier_ids: [1, 2, 3],
  inquiry_deadline: '2025-12-31 23:59:59',
  operator_id: 1,
  operator_name: '采购员',
});

// 3. 供应商提交报价（供应商端操作）
await QuoteAPI.submitQuote({
  inquiry_id: 1,
  supplier_id: 1,
  supplier_name: '供应商A',
  total_amount: 5000,
  expected_delivery_days: 7,
  submit_user_id: 10,
  submit_user_name: '供应商用户',
  items: [
    {
      inquiry_item_id: 1,
      part_id: 1,
      quote_price: 50,
      brand: '博世',
      origin: '德国',
    },
  ],
});

// 4. 获取报价比价并选择供应商
const comparison = await QuoteAPI.getQuoteComparison(purchase.data.order_no);
const selectedQuote = comparison.data[0]; // 选择第一个供应商

// 5. 检查是否需要价格审批
const threshold = await PriceApprovalAPI.checkPriceThreshold(
  selectedQuote.quote_id,
);
if (threshold.data.need_approval) {
  await PriceApprovalAPI.createApproval({
    order_id: purchase.data.id,
    quote_id: selectedQuote.quote_id,
    supplier_id: selectedQuote.supplier_id,
    supplier_name: selectedQuote.supplier_name,
    total_amount: threshold.data.total_amount,
    historical_avg_amount: threshold.data.historical_avg_amount,
    over_threshold_ratio: threshold.data.over_threshold_ratio,
    applicant_id: 1,
    applicant_name: '采购员',
    apply_reason: '价格合理',
  });

  // 等待审批通过...
}

// 6. 创建采购合同
const contract = await ContractAPI.createContract({
  order_id: purchase.data.id,
  quote_id: selectedQuote.quote_id,
  supplier_id: selectedQuote.supplier_id,
  supplier_name: selectedQuote.supplier_name,
  store_id: 1,
  store_name: '某门店',
  contract_amount: selectedQuote.total_amount,
  expected_delivery_date: '2025-12-31',
  creator_id: 1,
  creator_name: '采购员',
});

// 7. 发送给供应商
await ContractAPI.sendToSupplier({
  contract_id: contract.data.id,
  operator_id: 1,
  operator_name: '采购员',
});

// 8. 记录收货
await ContractAPI.recordReceive({
  contract_id: contract.data.id,
  operator_id: 1,
  operator_name: '仓库管理员',
  items: [
    {
      contract_item_id: 1,
      received_quantity: 100,
    },
  ],
});

// 9. 完成订单
await ContractAPI.completeContract({
  contract_id: contract.data.id,
  operator_id: 1,
  operator_name: '采购员',
});
```

## 类型定义

所有的类型定义都在各个 Controller 文件中，可以直接导入使用：

```typescript
import type {
  PurchaseItem,
  InquiryDetail,
  QuoteDetail,
  ApprovalDetail,
  ContractDetail,
} from '@/services/purchase';
```

## 注意事项

1. **错误处理**：所有 API 调用都应该包裹在 try-catch 中
2. **权限控制**：部分接口需要特定权限，前端应根据用户角色显示/隐藏功能
3. **状态校验**：某些操作有前置状态要求，需要在调用前检查
4. **数据刷新**：操作完成后应刷新相关数据

## API 前缀配置

所有 API 的前缀都定义在各自的 Controller 文件中，如需修改后端地址，可以统一在 `.umirc.ts` 中配置代理：

```typescript
proxy: {
  '/api': {
    target: 'http://your-backend-server:8080',
    changeOrigin: true,
  },
},
```
