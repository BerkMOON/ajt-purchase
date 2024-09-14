import BaseModalForm from '@/components/BasicComponents/BaseModalForm';
import { useRequest } from '@/hooks/useRequest';
import { ResponseInfoType } from '@/types/common';

export interface ChangeStatusFormProps {
  modalVisible: boolean;
  onCancel: () => void;
  refresh: () => void;
  name?: string;
  params?: any;
  api: (params?: any) => Promise<ResponseInfoType<null>>;
}

const ChangeStatusForm: React.FC<ChangeStatusFormProps> = ({
  modalVisible,
  onCancel,
  refresh,
  params = {},
  name = '',
  api,
}) => {
  const { loading, run } = useRequest<any, null>(api, {
    successMsg: `${name}状态修改成功`,
    onSuccess: refresh,
  });

  const handleSubmit = async () => {
    return await run(params);
  };

  return (
    <BaseModalForm
      title={`${name}状态修改`}
      visible={modalVisible}
      onCancel={onCancel}
      onSubmit={handleSubmit}
      loading={loading}
    >
      <div>是否修改{name}状态? 请确认。</div>
    </BaseModalForm>
  );
};

export default ChangeStatusForm;
