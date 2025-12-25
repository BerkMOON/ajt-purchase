import { ResponseInfoType } from '@/types/common';
import { request } from '@umijs/max';
import { ImportPartExcelParams, OssConfig, UploadFileParams } from './typings';

export const OssAPI = {
  /**
   * 文件上传
   * POST /api/v1/file/upload
   * 接口ID：396100295
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-396100295
   */
  getOSSConfig: (params: UploadFileParams) =>
    request<ResponseInfoType<OssConfig>>(`/api/v1/file/upload`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 备件excel导入
   * POST /api/v1/platform/part/import
   * 接口ID：395733812
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-395733812
   */
  importPartExcel: (params: ImportPartExcelParams) =>
    request<ResponseInfoType<null>>(`/api/v1/platform/part/import`, {
      method: 'POST',
      data: params,
    }),
};
