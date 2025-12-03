import BaseModalForm from '@/components/BasicComponents/BaseModalForm';
import { COMMON_STATUS, COMMON_STATUS_CODE, Role } from '@/constants';
import { CompanyAPI } from '@/services/system/company/CompanyController';
import { StoreAPI } from '@/services/system/store/StoreController';
import { StoreItem } from '@/services/system/store/typing';
import { SupplierAPI } from '@/services/system/supplier/supplierController';
import { SupplierInfo } from '@/services/system/supplier/typings';
import { UserAPI } from '@/services/system/user/UserController';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Select, Space, Typography, message } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';

interface ChangeUserBindingFormProps {
  modalVisible: boolean;
  onCancel: () => void;
  refresh: () => void;
  userId?: number;
  username?: string;
  userType?: Role | string;
}

const ChangeUserBindingForm: React.FC<ChangeUserBindingFormProps> = ({
  modalVisible,
  onCancel,
  refresh,
  userId,
  username,
  userType,
}) => {
  const [form] = Form.useForm();
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

  const isSupplierUser = userType === Role.Supplier;
  const isStoreUser = userType === Role.Store;

  useEffect(() => {
    if (!modalVisible) {
      form.resetFields();
      storeInitRef.current = false;
      return;
    }

    if (isSupplierUser) {
      const fetchSuppliers = async () => {
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
    }
  }, [modalVisible, isSupplierUser, form]);

  useEffect(() => {
    if (!modalVisible || !isStoreUser) {
      return;
    }

    const fetchStoresAndCompanies = async () => {
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
        setStoreOptions(activeStores);

        if (!storeInitRef.current) {
          form.setFieldsValue({
            store_bindings: [{}],
          });
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
  }, [modalVisible, isStoreUser, form]);

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

  const handleSubmit = async (values: any) => {
    if (!userId) {
      throw new Error('用户ID不能为空');
    }

    if (isSupplierUser) {
      if (!values.supplier_code) {
        throw new Error('请选择供应商');
      }
      await UserAPI.bindSupplier({
        user_id: userId,
        supplier_code: values.supplier_code,
      });
      message.success(`已调整${username || '用户'}的供应商绑定`);
    }

    if (isStoreUser) {
      if (
        !Array.isArray(values.store_bindings) ||
        values.store_bindings.length === 0
      ) {
        throw new Error('请至少添加一个门店绑定');
      }
      const storePairs = values.store_bindings
        .filter((item: any) => item?.company_id && item?.store_id)
        .map((item: any) => ({
          company_id: Number(item.company_id),
          store_id: Number(item.store_id),
        }));

      if (storePairs.length === 0) {
        throw new Error('请选择完整的公司与门店');
      }

      await UserAPI.bindStore({
        user_id: userId,
        store_pairs: storePairs,
      });
      message.success(`已调整${username || '用户'}的门店绑定`);
    }

    refresh();
  };

  return (
    <BaseModalForm
      title={`调整${username || '用户'}绑定关系`}
      visible={modalVisible}
      onCancel={() => {
        form.resetFields();
        storeInitRef.current = false;
        onCancel();
      }}
      onSubmit={handleSubmit}
      ownForm={form}
      width={isStoreUser ? 640 : 420}
    >
      {!isSupplierUser && !isStoreUser ? (
        <Typography.Text type="secondary">
          该用户类型无需绑定信息。
        </Typography.Text>
      ) : null}

      {isSupplierUser ? (
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
      ) : null}

      {isStoreUser ? (
        <Form.List
          name="store_bindings"
          rules={[
            {
              validator: async (_, value) => {
                if (!value || value.length === 0) {
                  return Promise.reject(new Error('请至少添加一个门店绑定'));
                }
                const invalid = value.some(
                  (item: any) => !item?.company_id || !item?.store_id,
                );
                if (invalid) {
                  return Promise.reject(new Error('请选择公司和门店'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => {
                const bindings = form.getFieldValue('store_bindings') || [];
                const companyId = bindings?.[index]?.company_id;
                const availableStores =
                  storeOptionMap.get(Number(companyId)) || storeOptions;
                return (
                  <Space
                    key={field.key}
                    align="baseline"
                    style={{ display: 'flex', marginBottom: 12 }}
                  >
                    <Form.Item
                      {...field}
                      name={[field.name, 'company_id']}
                      rules={[{ required: true, message: '请选择公司' }]}
                      label={index === 0 ? '绑定公司' : undefined}
                    >
                      <Select
                        style={{ width: '100%' }}
                        placeholder="请选择公司"
                        options={companyOptions}
                        loading={loadingStores}
                        showSearch
                        optionFilterProp="label"
                        onChange={() => {
                          const currentBindings =
                            form.getFieldValue('store_bindings') || [];
                          if (currentBindings[index]) {
                            currentBindings[index].store_id = undefined;
                            form.setFieldsValue({
                              store_bindings: [...currentBindings],
                            });
                          }
                        }}
                      />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, 'store_id']}
                      rules={[{ required: true, message: '请选择门店' }]}
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
      ) : null}
    </BaseModalForm>
  );
};

export default ChangeUserBindingForm;
