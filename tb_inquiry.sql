-- 询价单主表
CREATE TABLE `tb_inquiry` (
    id bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    inquiry_no bigint NOT NULL DEFAULT '0' COMMENT '询价单号',
    order_no bigint NOT NULL DEFAULT '0' COMMENT '采购单号',
    supplier_id bigint NOT NULL DEFAULT '0' COMMENT '供应商ID',
    deadline datetime NOT NULL DEFAULT '1970-01-01 00:00:00' COMMENT '报价截止时间',
    status int NOT NULL DEFAULT '0' COMMENT '询价状态',
    is_deleted tinyint NOT NULL DEFAULT '0' COMMENT '是否删除',
    ctime datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    mtime datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_inquiry_no (inquiry_no),
    KEY idx_inquiry_order_no (order_no)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '询价单主表';