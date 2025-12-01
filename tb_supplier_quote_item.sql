-- 供应商报价明细表
CREATE TABLE `tb_supplier_quote_item` (
    id bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    quote_no bigint NOT NULL DEFAULT '0' COMMENT '报价单号',
    inquiry_no bigint NOT NULL DEFAULT '0' COMMENT '询价单no',
    order_no bigint NOT NULL DEFAULT '0' COMMENT '采购单no',
    sku_id bigint NOT NULL DEFAULT '0' COMMENT '商品SKU ID',
    quantity int NOT NULL DEFAULT '0' COMMENT '采购数量',
    quote_price decimal(10, 2) NOT NULL DEFAULT '0.00' COMMENT '报价单价',
    total_price decimal(10, 2) NOT NULL DEFAULT '0.00' COMMENT '报价总价',
    avg_price decimal(10, 2) NOT NULL DEFAULT '0.00' COMMENT '采购均价',
    price_diff_percent int NOT NULL DEFAULT 0 COMMENT '与采购均价的差异百分比',
    expected_delivery_date datetime NOT NULL DEFAULT '1970-01-01 00:00:00' COMMENT '预计交货日期',
    remark varchar(500) NOT NULL DEFAULT '' COMMENT '报价备注',
    submit_user_id bigint NOT NULL DEFAULT '0' COMMENT '提交人ID',
    submit_time datetime NOT NULL DEFAULT '1970-01-01 00:00:00' COMMENT '提交报价时间',
    ctime datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    mtime datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY `idx_sqi_quote_no` (`quote_no`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '供应商报价明细表';