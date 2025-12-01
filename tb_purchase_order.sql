-- 采购单主表
CREATE TABLE `tb_purchase_order` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `order_no` bigint NOT NULL DEFAULT '0' COMMENT '采购单号',
  `store_id` bigint NOT NULL DEFAULT '0' COMMENT '采购门店ID',
  `creator_id` bigint NOT NULL DEFAULT '0' COMMENT '创建人ID',
  `expected_delivery_date` datetime NOT NULL DEFAULT '1970-01-01 00:00:00' COMMENT '期望到货日期',
  `inquiry_deadline` datetime NOT NULL DEFAULT '1970-01-01 00:00:00' COMMENT '询价截止时间',
  `remark` varchar(500) NOT NULL DEFAULT '' COMMENT '备注说明',
  `status` int NOT NULL DEFAULT '0' COMMENT '采购单状态',
  `order_type` tinyint NOT NULL DEFAULT '0' COMMENT '订单类型',
  `is_deleted` tinyint NOT NULL DEFAULT '0' COMMENT '是否删除',
  `ctime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `mtime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_po_order_no` (`order_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='采购单主表';

