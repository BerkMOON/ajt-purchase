import { useRequest } from '@/hooks/useRequest';
import { AccessAPI } from '@/services/System/access/AcessController';
import { Form, Input, Select } from 'antd';
import React, { useEffect, useState } from 'react';

const OperatorForm: React.FC = () => {
  const form = Form.useFormInstance();
  const selectedModule = Form.useWatch('module');

  const [moduleOptions, setModuleOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [levelOptions, setLevelOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const { loading: loadingModules, run: runGetModules } = useRequest(
    AccessAPI.getModuleList,
    { immediate: true },
  );
  const { loading: loadingLevels, run: runGetLevels } = useRequest(
    AccessAPI.getLevelList as any,
    {},
  );

  // 初始化加载模块列表
  useEffect(() => {
    (async () => {
      const data = await runGetModules(undefined as any);
      const opts = (data?.module_list || []).map((m: any) => ({
        label: m.name,
        value: m.code,
      }));
      setModuleOptions(opts);
    })();
  }, []);

  // 监听模块变化，加载对应层级列表
  useEffect(() => {
    (async () => {
      if (!selectedModule) {
        setLevelOptions([]);
        return;
      }
      // 切换模块时清空层级
      form?.setFieldsValue({ level: undefined });
      const data = await runGetLevels({ module: selectedModule } as any);
      const opts = (data?.level_list || []).map((lv: any) => ({
        label: lv.name,
        value: lv.code,
      }));
      setLevelOptions(opts);
    })();
  }, [selectedModule]);

  return (
    <>
      <Form.Item
        label="所属模块"
        name="module"
        rules={[{ required: true, message: '请选择所属模块' }]}
      >
        <Select
          placeholder="请选择所属模块"
          options={moduleOptions}
          loading={loadingModules}
          allowClear
        />
      </Form.Item>
      <Form.Item
        label="接口层级"
        name="level"
        rules={[{ required: true, message: '请选择接口层级' }]}
      >
        <Select
          placeholder="请选择接口层级"
          options={levelOptions}
          loading={loadingLevels}
          allowClear
          disabled={!selectedModule}
        />
      </Form.Item>
      <Form.Item
        label="接口code"
        name="api_code"
        rules={[{ required: true, message: '请输入接口code' }]}
      >
        <Input placeholder="例如：platform:company:list" />
      </Form.Item>
      <Form.Item
        label="接口名称"
        name="name"
        rules={[{ required: true, message: '请输入接口名称' }]}
      >
        <Input placeholder="请输入接口名称" />
      </Form.Item>
      <Form.Item
        label="路径匹配"
        name="path"
        rules={[{ required: true, message: '请输入路径匹配规则' }]}
      >
        <Input placeholder="例如：/api/v1/order/*" />
      </Form.Item>
    </>
  );
};

export default OperatorForm;
