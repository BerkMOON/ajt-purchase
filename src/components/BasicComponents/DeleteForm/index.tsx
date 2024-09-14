import BaseModalForm from '@/components/BasicComponents/BaseModalForm';
import { useRequest } from '@/hooks/useRequest';
import { ResponseInfoType } from '@/types/common';

export interface DeleteFormProps {
  modalVisible: boolean;
  onCancel: () => void;
  refresh: () => void;
  name?: string;
  params?: any;
  api: (params?: any) => Promise<ResponseInfoType<null>>;
}

const DeleteForm: React.FC<DeleteFormProps> = ({
  modalVisible,
  onCancel,
  refresh,
  params = {},
  name = '',
  api,
}) => {
  const { loading, run } = useRequest<any, null>(api, {
    successMsg: `删除${name}成功`,
    onSuccess: refresh,
  });

  const handleSubmit = async () => {
    return await run(params);
  };

  return (
    <BaseModalForm
      title={`删除${name}`}
      visible={modalVisible}
      onCancel={onCancel}
      onSubmit={handleSubmit}
      loading={loading}
    >
      <div>是否删除该{name}？删除后不可恢复，请确认。</div>
    </BaseModalForm>
  );
};

export default DeleteForm;
