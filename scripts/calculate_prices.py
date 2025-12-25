#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Excel价格计算脚本（多Sheet版本）
功能：
- Sheet 1: 回采最高限价 = 主机厂采购价(含税) × 0.55 (5.5折)
           无回采最高限价 = 主机厂采购价(含税) × 0.48 (4.8折)
- Sheet 2: 回采最高限价 = 主机厂采购价(含税) × 0.4 (4折)
           无回采最高限价 = 主机厂采购价(含税) × 0.3 (3折)
- 结果向下取整，只保留整数部分
"""

import pandas as pd
import sys
import os
from pathlib import Path
from typing import Dict, Tuple


def find_price_columns(df: pd.DataFrame) -> Tuple[str, str, str]:
    """
    查找价格相关的列名
    
    Returns:
        (base_price_col, recycling_max_price_col, no_recycling_max_price_col)
    """
    base_price_col = None
    recycling_max_price_col = None
    no_recycling_max_price_col = None
    
    # 查找"主机厂采购价(含税)"列
    possible_base_price_cols = [
        '主机厂采购价(含税)',
        '主机厂采购价（含税）',
        '主机厂采购价',
        '采购价',
    ]
    
    for col in df.columns:
        col_str = str(col).strip()
        if any(possible in col_str for possible in possible_base_price_cols):
            base_price_col = col
            break
    
    # 查找"回采最高限价"列
    possible_recycling_cols = [
        '回采最高限价',
        '回采限价',
    ]
    
    for col in df.columns:
        col_str = str(col).strip()
        if any(possible in col_str for possible in possible_recycling_cols):
            recycling_max_price_col = col
            break
    
    # 查找"无回采最高限价"列
    possible_no_recycling_cols = [
        '无回采最高限价',
        '无回采限价',
    ]
    
    for col in df.columns:
        col_str = str(col).strip()
        if any(possible in col_str for possible in possible_no_recycling_cols):
            no_recycling_max_price_col = col
            break
    
    return base_price_col, recycling_max_price_col, no_recycling_max_price_col


def calculate_sheet_prices(
    df: pd.DataFrame,
    sheet_name: str,
    recycling_discount: float,
    no_recycling_discount: float,
) -> pd.DataFrame:
    """
    计算单个Sheet的价格
    
    Args:
        df: DataFrame数据
        sheet_name: Sheet名称（用于日志）
        recycling_discount: 回采限价折扣率（如 0.55 表示5.5折）
        no_recycling_discount: 无回采限价折扣率（如 0.48 表示4.8折）
    
    Returns:
        处理后的DataFrame
    """
    # 查找列名
    base_price_col, recycling_max_price_col, no_recycling_max_price_col = find_price_columns(df)
    
    # 检查必要的列是否存在
    if base_price_col is None:
        print(f"  警告: Sheet '{sheet_name}' 未找到'主机厂采购价(含税)'列，跳过处理")
        return df
    
    if recycling_max_price_col is None:
        print(f"  提示: Sheet '{sheet_name}' 未找到'回采最高限价'列，将创建新列")
        recycling_max_price_col = '回采最高限价'
        df[recycling_max_price_col] = None
    
    if no_recycling_max_price_col is None:
        print(f"  提示: Sheet '{sheet_name}' 未找到'无回采最高限价'列，将创建新列")
        no_recycling_max_price_col = '无回采最高限价'
        df[no_recycling_max_price_col] = None
    
    # 转换基础价格为数值类型
    df[base_price_col] = pd.to_numeric(df[base_price_col], errors='coerce')
    
    # 统计有效数据行数
    valid_rows = df[base_price_col].notna()
    valid_count = valid_rows.sum()
    total_count = len(df)
    
    print(f"  - 共 {total_count} 行，其中 {valid_count} 行有有效的采购价格")
    
    # 计算回采最高限价
    df[recycling_max_price_col] = df[base_price_col] * recycling_discount
    
    # 计算无回采最高限价
    df[no_recycling_max_price_col] = df[base_price_col] * no_recycling_discount
    
    # 向下取整，只保留整数部分（抹掉小数部分）
    df[recycling_max_price_col] = (df[recycling_max_price_col] // 1).astype('Int64')
    df[no_recycling_max_price_col] = (df[no_recycling_max_price_col] // 1).astype('Int64')
    
    return df


def calculate_prices(input_file: str, output_file: str = None):
    """
    计算Excel文件中的价格字段（支持多Sheet）
    
    Args:
        input_file: 输入Excel文件路径
        output_file: 输出Excel文件路径，如果为None则自动生成
    """
    try:
        # 检查输入文件是否存在
        if not os.path.exists(input_file):
            print(f"错误: 输入文件不存在: {input_file}")
            return False
        
        # 读取Excel文件的所有Sheet
        print(f"正在读取文件: {input_file}")
        excel_file = pd.ExcelFile(input_file)
        sheet_names = excel_file.sheet_names
        
        if len(sheet_names) < 2:
            print(f"\n警告: Excel文件只有 {len(sheet_names)} 个Sheet，期望至少2个")
            print(f"检测到的Sheet: {sheet_names}")
        
        print(f"\n检测到 {len(sheet_names)} 个Sheet: {sheet_names}")
        
        # 定义每个Sheet的折扣率
        # Sheet 1 (索引0): 回采5.5折, 无回采4.8折
        # Sheet 2 (索引1): 回采4折, 无回采3折
        discount_config = {
            0: {
                'recycling': 0.55,  # 5.5折
                'no_recycling': 0.48,  # 4.8折
                'name': 'Sheet 1 (回采5.5折, 无回采4.8折)'
            },
            1: {
                'recycling': 0.4,  # 4折
                'no_recycling': 0.3,  # 3折
                'name': 'Sheet 2 (回采4折, 无回采3折)'
            }
        }
        
        # 处理每个Sheet
        processed_sheets: Dict[str, pd.DataFrame] = {}
        
        for idx, sheet_name in enumerate(sheet_names):
            print(f"\n处理 Sheet {idx + 1}: {sheet_name}")
            
            # 读取Sheet数据
            df = pd.read_excel(excel_file, sheet_name=sheet_name)
            
            # 根据Sheet索引选择折扣率（如果超出配置范围，使用默认值）
            if idx in discount_config:
                config = discount_config[idx]
                print(f"  使用折扣率: {config['name']}")
                df = calculate_sheet_prices(
                    df,
                    sheet_name,
                    config['recycling'],
                    config['no_recycling']
                )
            else:
                print(f"  警告: Sheet {idx + 1} 未配置折扣率，跳过价格计算")
            
            processed_sheets[sheet_name] = df
        
        # 生成输出文件名
        if output_file is None:
            input_path = Path(input_file)
            output_file = input_path.parent / f"{input_path.stem}_已计算{input_path.suffix}"
        
        # 保存到Excel文件（保留所有Sheet）
        print(f"\n正在保存到: {output_file}")
        with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
            for sheet_name, df in processed_sheets.items():
                df.to_excel(writer, sheet_name=sheet_name, index=False)
        
        print(f"\n✓ 处理完成！")
        print(f"  - 输入文件: {input_file}")
        print(f"  - 输出文件: {output_file}")
        print(f"  - 处理Sheet数: {len(processed_sheets)}")
        
        return True
        
    except Exception as e:
        print(f"\n错误: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("使用方法:")
        print("  python calculate_prices.py <输入Excel文件> [输出Excel文件]")
        print("\n说明:")
        print("  - Sheet 1: 回采限价5.5折, 无回采限价4.8折")
        print("  - Sheet 2: 回采限价4折, 无回采限价3折")
        print("  - 结果向下取整，只保留整数部分")
        print("\n示例:")
        print("  python calculate_prices.py input.xlsx")
        print("  python calculate_prices.py input.xlsx output.xlsx")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    success = calculate_prices(input_file, output_file)
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
