CREATE TABLE `tb_purchase_order_item` (
    id bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    order_no bigint DEFAULT NULL COMMENT '采购单号',
    status int NOT NULL DEFAULT 1 COMMENT '状态: 1: 待报价, 2: 已选中, 3: 已到货',
    delivery_date datetime DEFAULT NULL COMMENT '实际交货日期',
    supplier_id bigint DEFAULT NULL COMMENT '供应商ID',
    quote_no bigint NOT NULL DEFAULT 0 COMMENT '报价单no',
    sku_id bigint NOT NULL DEFAULT 0 COMMENT '商品SKU ID',
    quantity int NOT NULL DEFAULT 0 COMMENT '采购数量',
    remark varchar(128) NOT NULL DEFAULT '' COMMENT '明细备注',
    ctime datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    mtime datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY idx_poi_order_no (order_no)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '采购单明细表';