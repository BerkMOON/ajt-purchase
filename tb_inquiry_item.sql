-- 询价单明细表
CREATE TABLE `tb_inquiry_item` (
    id bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    inquiry_no bigint NOT NULL DEFAULT '0' COMMENT '询价单号',
    order_no bigint NOT NULL DEFAULT '0' COMMENT '采购单号',
    sku_id bigint NOT NULL DEFAULT '0' COMMENT '商品SKU ID',
    quantity int NOT NULL DEFAULT '0' COMMENT '采购数量',
    ctime datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    mtime datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY idx_ii_inquiry_no (inquiry_no)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '询价单明细表';