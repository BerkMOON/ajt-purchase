-- 采购单状态流转记录表
CREATE TABLE `tb_purchase_order_status_log` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `order_id` bigint NOT NULL DEFAULT '0' COMMENT '采购单主表ID',
  `order_no` bigint NOT NULL DEFAULT '0' COMMENT '采购单号',
  `from_status` int NOT NULL DEFAULT '0' COMMENT '变更前状态',
  `to_status` int NOT NULL DEFAULT '0' COMMENT '变更后状态',
  `operator_id` bigint NOT NULL DEFAULT '0' COMMENT '操作人ID',
  `operator_name` varchar(30) NOT NULL DEFAULT '' COMMENT '操作人姓名',
  `remark` varchar(128) NOT NULL DEFAULT '' COMMENT '操作说明/备注',
  `ctime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '状态变更时间',
  PRIMARY KEY (`id`),
  KEY `idx_posl_order_no` (`order_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='采购单状态流转记录表';

