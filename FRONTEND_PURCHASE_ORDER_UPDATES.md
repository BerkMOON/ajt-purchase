# 前端采购单模块完善文档

## 📋 概述

根据重新设计的后端接口，完善了前端采购单相关页面的所有功能，使其与后端 API 完全匹配。

## 🔧 修改文件列表

### 1. 类型定义文件

- **文件**: `src/services/purchase/typings.d.ts`
- **修改内容**:
  - 更新 `PurchaseItem` 接口，匹配后端返回的字段结构
  - 更新 `PurchaseDetailItem` 接口，使用新的字段（`sku_id`, `brand`, `product_name`, `avg_price` 等）
  - 更新 `PurchaseParams` 接口，支持新的筛选参数（`order_no`, `limit`, `statuses` 等）
  - 新增 `CreatePurchaseItemParams` 接口
  - 更新 `CreatePurchaseParams` 和 `UpdatePurchaseParams` 接口
  - 新增 `DraftListResponse` 和 `PurchaseDraftItem` 接口
  - 更新 `PurchaseStatusMap`，匹配新的 9 种状态：
    - 0: 草稿
    - 1: 待审核
    - 2: 审核驳回
    - 3: 询价中
    - 4: 已报价
    - 5: 价格待审批
    - 6: 价格审批驳回
    - 7: 已下单
    - 8: 已到货

### 2. API 控制器

- **文件**: `src/services/purchase/PurchaseController.ts`
- **修改内容**:
  - 重构 `getAllPurchases`：支持新的筛选参数
  - 重构 `getDraftPurchases`：从 Redis 获取草稿列表
  - 新增 `getDraftDetail`：获取单个草稿详情
  - 新增 `createDraft`：创建草稿（存入 Redis）
  - 新增 `updateDraft`：更新草稿
  - 新增 `deleteDraft`：删除草稿
  - 新增 `submitDraft`：提交草稿（触发审核和询价流程）
  - 移除旧的 `createPurchase`, `updatePurchase`, `deletePurchase`, `submitPurchase` 等方法
  - 所有 API 路径使用驼峰命名：`/api/v1/purchaseOrder`

### 3. 筛选表单

- **文件**: `src/pages/PurchaseList/searchForm.tsx`
- **修改内容**:
  - 字段名从 `purchase_no` 改为 `order_no`
  - 字段名从 `status` 改为 `statuses`（多选）
  - 支持多选门店（`store_ids`）
  - 支持多选状态（`statuses`），并过滤掉草稿状态（草稿不在正式列表中显示）
  - 更新提示文字

### 4. 列定义

- **文件**: `src/pages/PurchaseList/colums.tsx`
- **修改内容**:
  - 更新状态颜色映射，匹配新的 9 种状态
  - 字段名从 `create_time` 改为 `ctime`
  - 状态显示从对象 `{code, name}` 改为数字 `status` + 字符串 `status_name`

### 5. 采购单列表页面

- **文件**: `src/pages/PurchaseList/index.tsx`
- **修改内容**:
  - **提交逻辑**: 从 `submitPurchase` 改为 `submitDraft`，提示信息更新为"提交后将进入审核流程"
  - **草稿列表数据获取**: 简化为无参数调用 `getDraftPurchases()`
  - **正式列表数据获取**: 重构筛选参数处理逻辑
    - 支持多选门店（逗号分隔）
    - 支持多选状态（逗号分隔）
    - 分页参数从 `page_size` 改为 `limit`
  - **草稿保存时间**: 从"1 天"改为"3 天"
  - **删除操作**: 从 `deletePurchase` 改为 `deleteDraft`，参数从 `purchase_id` 改为 `order_no`
  - **创建/编辑操作**: 从 `createPurchase/updatePurchase` 改为 `createDraft/updateDraft`
  - **主键**: 从 `purchase_id` 改为 `order_no`

### 6. 操作表单（创建/编辑）

- **文件**: `src/pages/PurchaseList/opreatorForm.tsx`
- **修改内容**:
  - **采购门店**: 从 `InputNumber` 改为 `Select` 下拉选择
  - **询价截止时间**: 设为必填项
  - **配件清单**:
    - 移除字段：`part_type`, `part_id`, `part_code`, `specification`, `unit`
    - 保留字段：`brand`（品牌）, `sku_id`（SKU ID）, `product_name`（配件名称）, `quantity`（采购数量）, `avg_price`（采购均价）
    - 采购均价字段设为禁用状态（自动从商品表获取）
    - 添加表单列表验证：至少添加一个配件
    - 添加提示文字说明采购均价的用途

### 7. 采购单详情页面

- **文件**: `src/pages/PurchaseDetail/index.tsx`
- **修改内容**:
  - **状态枚举更新**: 从 6 种状态改为 9 种状态，匹配新的 PRD
  - **字段名称更新**:
    - `create_time` -> `ctime`
    - `modify_time` -> `mtime`
    - `status.code` -> `status`（从对象改为数字）
    - `status.name` -> `status_name`
  - **移除字段**: `total_amount`（总金额）
  - **新增字段显示**: `inquiry_deadline`（询价截止时间）, `item_count`（配件数量）
  - **配件清单表格**: 根据新 PRD 简化
    - 移除列：`part_type`, `part_code`, `specification`, `unit`
    - 新增列：`brand`（品牌）, `sku_id`（SKU ID）, `product_name`（配件名称）, `avg_price`（采购均价）, `actual_price`（实际价格）, `actual_total_price`（实际总价）, `remark`（备注）
  - **状态流水**: 增加"待审核"和"询价中"环节，更新提示文字
  - **操作按钮**:
    - 增加"待审核"、"审核驳回"、"价格审批驳回"状态的按钮
    - 移除草稿状态下的"提交审核"按钮（草稿仅在列表页提交）
  - **状态颜色**: 更新为 9 种状态对应的颜色

## 📂 文件修改汇总

| 序号 | 文件路径                                      | 修改内容         |
| ---- | --------------------------------------------- | ---------------- |
| 1    | `src/services/purchase/typings.d.ts`          | 类型定义更新     |
| 2    | `src/services/purchase/PurchaseController.ts` | API 控制器重构   |
| 3    | `src/pages/PurchaseList/searchForm.tsx`       | 筛选表单优化     |
| 4    | `src/pages/PurchaseList/colums.tsx`           | 列定义更新       |
| 5    | `src/pages/PurchaseList/index.tsx`            | 列表页面逻辑重构 |
| 6    | `src/pages/PurchaseList/opreatorForm.tsx`     | 操作表单简化     |
| 7    | `src/pages/PurchaseDetail/index.tsx`          | 详情页面字段更新 |

## 🎯 功能变更亮点

### 草稿 vs 正式采购单

- **草稿**（存储在 Redis，保留 3 天）:
  - 可以创建、编辑、删除
  - 可以提交（触发审核流程）
  - 不受状态筛选影响
- **正式采购单**（存储在 MySQL）:
  - 只读查看
  - 支持多维度筛选：采购单号、门店、状态、日期范围
  - 状态流转：待审核 → 询价中 → 已报价 → 价格待审批 → 已下单 → 已到货

### 采购单创建流程

1. 用户创建草稿（填写门店、期望到货日期、询价截止时间、配件清单）
2. 草稿保存在 Redis（保留 3 天）
3. 用户提交草稿
4. 进入审核流程（第一版自动审核）
5. 审核通过后，系统自动向能提供相应商品的供应商发起询价
6. 后续流程：报价 → 价格审批 → 下单 → 到货

### 配件清单简化

根据 PRD 要求，配件清单区域只保留核心字段：

- **品牌**：手动输入
- **SKU ID**：手动输入
- **配件名称**：手动输入
- **采购数量**：手动输入
- **采购均价**：自动从商品表获取（禁用编辑），用于后续价格审批

不再支持批量导入配件。

## 📊 API 端点映射

| 功能 | 前端调用 | 后端端点 | 方法 |
| --- | --- | --- | --- |
| 获取草稿列表 | `getDraftPurchases()` | `/api/v1/purchaseOrder/draft/list` | GET |
| 获取草稿详情 | `getDraftDetail(storeId)` | `/api/v1/purchaseOrder/draft/detail?store_id=xxx` | GET |
| 创建草稿 | `createDraft(params)` | `/api/v1/purchaseOrder/draft/create` | POST |
| 更新草稿 | `updateDraft(params)` | `/api/v1/purchaseOrder/draft/update` | POST |
| 删除草稿 | `deleteDraft(storeId)` | `/api/v1/purchaseOrder/draft/delete?store_id=xxx` | DELETE |
| 提交草稿 | `submitDraft(storeId)` | `/api/v1/purchaseOrder/draft/submit` | POST |
| 获取采购单列表 | `getAllPurchases(params)` | `/api/v1/purchaseOrder/list` | GET |
| 获取采购单详情 | `getPurchaseDetail(orderNo)` | `/api/v1/purchaseOrder/detail?order_no=xxx` | GET |

## 🔄 状态流转

```
草稿(0)
  ↓ [提交]
待审核(1)
  ↓ [审核通过(第一版自动)] / [审核驳回(2)]
询价中(3)
  ↓ [供应商报价]
已报价(4)
  ↓ [价格审批]
价格待审批(5)
  ↓ [审批通过] / [价格审批驳回(6)]
已下单(7)
  ↓ [确认到货]
已到货(8)
```

## ✅ 验证检查

所有修改的文件均已通过 Linter 检查，无错误：

- ✅ `src/services/purchase/typings.d.ts`
- ✅ `src/services/purchase/PurchaseController.ts`
- ✅ `src/pages/PurchaseList/searchForm.tsx`
- ✅ `src/pages/PurchaseList/colums.tsx`
- ✅ `src/pages/PurchaseList/index.tsx`
- ✅ `src/pages/PurchaseList/opreatorForm.tsx`
- ✅ `src/pages/PurchaseDetail/index.tsx`

## 🚀 待完善功能（TODO）

1. **门店数据动态加载**: 当前门店选择器使用硬编码数据，需要对接门店列表 API
2. **配件均价自动获取**: 当用户输入 SKU ID 后，应该自动查询商品表并填充均价
3. **配件搜索功能**: 添加配件搜索弹窗，用户可以搜索并选择配件，而不是手动输入所有字段
4. **采购单详情页**: 完善详情页的显示（状态日志、配件明细、询价记录、报价对比等）
5. **权限控制**: 根据用户角色显示不同的操作按钮

## 📝 注意事项

1. 草稿保存在 Redis，有效期 3 天，请提醒用户及时提交
2. 提交草稿后，草稿将从 Redis 中移除，正式采购单将存储在 MySQL
3. 正式采购单不支持编辑和删除（只能查看）
4. 状态筛选仅在正式采购单列表中可用，草稿列表不受状态筛选影响
5. 所有日期时间格式统一使用 `YYYY-MM-DD HH:mm:ss`（期望到货日期为 `YYYY-MM-DD`）

## 🎉 完成情况

✅ 类型定义更新  
✅ API 控制器重构  
✅ 筛选表单优化  
✅ 列定义更新  
✅ 列表页面逻辑重构  
✅ 操作表单简化  
✅ 详情页面字段更新  
✅ Linter 检查通过

---

**更新时间**: 2025-11-21  
**文档版本**: v1.0
