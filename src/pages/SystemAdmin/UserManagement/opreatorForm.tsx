import {
  COMMON_STATUS,
  COMMON_STATUS_CODE,
  Role,
  USER_TYPE_OPTIONS,
} from '@/constants';
import { CompanyAPI } from '@/services/System/company/CompanyController';
import { RoleAPI } from '@/services/System/role/RoleController';
import { RoleInfo } from '@/services/System/role/typings';
import { StoreAPI } from '@/services/System/store/StoreController';
import { StoreItem } from '@/services/System/store/typing';
import { SupplierAPI } from '@/services/System/supplier/supplierController';
import { SupplierInfo } from '@/services/System/supplier/typings';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Select, Space } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';

interface CreateAndModifyFormProps {
  isModify: boolean;
}

export const CreateAndModifyForm: React.FC<CreateAndModifyFormProps> = ({
  isModify,
}) => {
  const [roleOptions, setRoleOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [supplierOptions, setSupplierOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [companyOptions, setCompanyOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [storeOptions, setStoreOptions] = useState<StoreItem[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const storeInitRef = useRef(false);
  const form = Form.useFormInstance();
  const userType = Form.useWatch('user_type');

  // 根据 user_type 获取角色列表
  useEffect(() => {
    const fetchRoles = async () => {
      if (!userType) {
        setRoleOptions([]);
        return;
      }

      setLoadingRoles(true);
      try {
        const response = await RoleAPI.getRoleList({
          role_type: userType as Role,
          status: COMMON_STATUS.ACTIVE,
          page: 1,
          limit: 100, // 获取所有角色
        });
        const roles = response.data.roles || [];
        setRoleOptions(
          roles.map((role: RoleInfo) => ({
            label: role.role_name,
            value: role.id,
          })),
        );
      } catch (error) {
        console.error('获取角色列表失败:', error);
        setRoleOptions([]);
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();
  }, [userType]);

  // 获取供应商列表
  useEffect(() => {
    const fetchSuppliers = async () => {
      if (userType !== Role.Supplier) {
        setSupplierOptions([]);
        form.setFieldsValue({ supplier_code: undefined });
        return;
      }
      setLoadingSuppliers(true);
      try {
        const response = await SupplierAPI.getSupplierList({
          status: COMMON_STATUS.ACTIVE,
          limit: 200,
          page: 1,
        });
        const suppliers = response.data.suppliers || [];
        setSupplierOptions(
          suppliers.map((supplier: SupplierInfo) => ({
            label: `${supplier.supplier_name}（${supplier.supplier_code}）`,
            value: supplier.supplier_code,
          })),
        );
      } catch (error) {
        console.error('获取供应商列表失败:', error);
        setSupplierOptions([]);
      } finally {
        setLoadingSuppliers(false);
      }
    };

    fetchSuppliers();
  }, [userType, form]);

  // 获取公司和门店列表
  useEffect(() => {
    const fetchStoresAndCompanies = async () => {
      if (userType !== Role.Store) {
        setCompanyOptions([]);
        setStoreOptions([]);
        form.setFieldsValue({ store_bindings: [] });
        storeInitRef.current = false;
        return;
      }
      setLoadingStores(true);
      try {
        const [companyResp, storeResp] = await Promise.all([
          CompanyAPI.getAllCompanies({ page: 1, limit: 200 } as any),
          StoreAPI.getAllStores({ page: 1, limit: 500, company_id: '' } as any),
        ]);
        const companyList = (companyResp.data.companies || []) as any[];
        const activeCompanies = companyList.filter(
          (company) => company?.status?.code === COMMON_STATUS_CODE.ACTIVE,
        );
        const storeList = (storeResp.data.stores || []) as StoreItem[];
        const activeStores = storeList.filter(
          (store: any) => store?.status?.code === COMMON_STATUS_CODE.ACTIVE,
        );
        setCompanyOptions(
          activeCompanies.map((company) => ({
            label: company.company_name,
            value: String(company.id),
          })),
        );
        setStoreOptions(activeStores as StoreItem[]);

        if (!storeInitRef.current) {
          form.setFieldsValue({ store_bindings: [{}] });
          storeInitRef.current = true;
        }
      } catch (error) {
        console.error('获取公司或门店列表失败:', error);
        setCompanyOptions([]);
        setStoreOptions([]);
      } finally {
        setLoadingStores(false);
      }
    };

    fetchStoresAndCompanies();
  }, [userType, form]);

  const storeOptionMap = useMemo(() => {
    const map = new Map<number, StoreItem[]>();
    storeOptions.forEach((store) => {
      const companyId = store.company_id;
      const list = map.get(companyId) || [];
      list.push(store);
      map.set(companyId, list);
    });
    return map;
  }, [storeOptions]);

  return (
    <>
      {isModify ? null : (
        <>
          <Form.Item
            required
            label="账号名称"
            name="username"
            rules={[{ required: true, message: '请输入账号名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item required label="密码" name="password">
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="用户类型"
            name="user_type"
            rules={[{ required: true, message: '请选择用户类型' }]}
          >
            <Select options={USER_TYPE_OPTIONS} placeholder="请选择用户类型" />
          </Form.Item>
          <Form.Item
            label="用户角色"
            name="role_id"
            rules={[{ required: true, message: '请选择用户角色' }]}
          >
            <Select
              options={roleOptions}
              placeholder="请选择用户角色"
              loading={loadingRoles}
              disabled={!userType || loadingRoles}
              notFoundContent={
                !userType
                  ? '请先选择用户类型'
                  : loadingRoles
                  ? '加载中...'
                  : '暂无角色'
              }
            />
          </Form.Item>
          {userType === Role.Supplier && (
            <Form.Item
              label="绑定供应商"
              name="supplier_code"
              rules={[{ required: true, message: '请选择供应商' }]}
            >
              <Select
                showSearch
                placeholder="请选择供应商"
                options={supplierOptions}
                loading={loadingSuppliers}
                optionFilterProp="label"
              />
            </Form.Item>
          )}
          {userType === Role.Store && (
            <>
              <Form.Item
                noStyle
                shouldUpdate={(prev, cur) =>
                  prev.store_bindings !== cur.store_bindings ||
                  prev.user_type !== cur.user_type
                }
              >
                {({ getFieldValue }) => {
                  const bindings = getFieldValue('store_bindings') || [];
                  return (
                    <Form.List
                      name="store_bindings"
                      rules={[
                        {
                          validator: async (_, value) => {
                            if (!value || value.length === 0) {
                              return Promise.reject(
                                new Error('请至少添加一个门店绑定'),
                              );
                            }
                            const invalid = value.some(
                              (item: any) =>
                                !item?.company_id || !item?.store_id,
                            );
                            if (invalid) {
                              return Promise.reject(
                                new Error('请选择公司和门店'),
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map((field, index) => {
                            const companyId = bindings?.[index]?.company_id;
                            const availableStores =
                              storeOptionMap.get(Number(companyId)) ||
                              storeOptions;
                            return (
                              <Space
                                key={field.key}
                                align="baseline"
                                style={{ display: 'flex', marginBottom: 12 }}
                              >
                                <Form.Item
                                  {...field}
                                  name={[field.name, 'company_id']}
                                  rules={[
                                    { required: true, message: '请选择公司' },
                                  ]}
                                  label={index === 0 ? '绑定公司' : undefined}
                                >
                                  <Select
                                    style={{ width: '100%' }}
                                    placeholder="请选择公司"
                                    options={companyOptions}
                                    loading={loadingStores}
                                    showSearch
                                    optionFilterProp="label"
                                  />
                                </Form.Item>
                                <Form.Item
                                  {...field}
                                  name={[field.name, 'store_id']}
                                  rules={[
                                    { required: true, message: '请选择门店' },
                                  ]}
                                  label={index === 0 ? '绑定门店' : undefined}
                                >
                                  <Select
                                    style={{ width: '100%' }}
                                    placeholder="请选择门店"
                                    loading={loadingStores}
                                    showSearch
                                    optionFilterProp="label"
                                    options={availableStores.map((store) => ({
                                      label: store.store_name,
                                      value: String(store.id),
                                    }))}
                                  />
                                </Form.Item>
                                {fields.length > 1 && (
                                  <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => remove(field.name)}
                                  />
                                )}
                              </Space>
                            );
                          })}
                          <Form.Item>
                            <Button
                              type="dashed"
                              onClick={() => add({})}
                              block
                              icon={<PlusOutlined />}
                            >
                              添加绑定门店
                            </Button>
                          </Form.Item>
                        </>
                      )}
                    </Form.List>
                  );
                }}
              </Form.Item>
            </>
          )}
        </>
      )}
      <Form.Item label="用户姓名" name="nickname">
        <Input placeholder="请输入用户姓名" />
      </Form.Item>
      <Form.Item label="手机号" name="phone">
        <Input placeholder="请输入手机号" />
      </Form.Item>
      <Form.Item label="邮箱" name="email">
        <Input placeholder="请输入邮箱" />
      </Form.Item>
      <Form.Item label="备注" name="remark">
        <Input.TextArea placeholder="请输入备注" />
      </Form.Item>
    </>
  );
};

// 保持向后兼容
export const createAndModifyForm = (isModify: boolean) => (
  <CreateAndModifyForm isModify={isModify} />
);
