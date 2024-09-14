import { Form, FormInstance, Modal, Spin } from 'antd';
import { ReactNode, useEffect } from 'react';

interface BaseModalFormProps {
  title: string;
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<any>;
  children: ReactNode;
  width?: number;
  loading?: boolean;
  initialValues?: Record<string, any>;
  ownForm?: FormInstance<any>;
}

const BaseModalForm: React.FC<BaseModalFormProps> = ({
  title,
  visible,
  onCancel,
  onSubmit,
  children,
  width = 420,
  loading = false,
  initialValues,
  ownForm,
}) => {
  let [form] = Form.useForm();

  if (ownForm) {
    form = ownForm;
  }

  // 监听 visible 和 initialValues 的变化
  useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [visible, initialValues, form]);

  // 模态框关闭时重置表单
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  // 提交成功后才触发刷新
  const handleSubmit = async (values: any) => {
    try {
      await onSubmit(values);
      form.resetFields();
      onCancel();
    } catch (error) {
      // 提交失败时不关闭模态框，不重置表单
      console.error(error);
    }
  };

  return (
    <Modal
      destroyOnClose
      title={title}
      width={width}
      open={visible}
      onCancel={handleCancel}
      okButtonProps={{
        htmlType: 'submit',
        loading,
      }}
      modalRender={(modal) => (
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            preserve={false}
          >
            {modal}
          </Form>
        </Spin>
      )}
    >
      {children}
    </Modal>
  );
};

export default BaseModalForm;
