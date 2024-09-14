import BaseModalForm from '@/components/BasicComponents/BaseModalForm';
import { useRequest } from '@/hooks/useRequest';
import { BaseCreateModalFormProps } from '@/types/common';

const CreateOrModifyForm: React.FC<BaseCreateModalFormProps> = ({
  modalVisible,
  onCancel,
  refresh,
  children,
  text,
  api,
  record,
  idMapKey = 'id',
  idMapValue = 'id',
  ownForm,
  operatorFields,
  width,
}) => {
  const { loading, run } = useRequest(api, {
    successMsg: text.successMsg,
    onSuccess: refresh,
  });

  const handleSubmit = async (values: Record<string, any>) => {
    const processedValues = operatorFields ? operatorFields(values) : values;

    return await run(
      record
        ? {
            [idMapKey]: record[idMapValue],
            ...processedValues,
          }
        : {
            ...processedValues,
          }, // 有些额外的参数
    );
  };

  return (
    <BaseModalForm
      title={text.title}
      visible={modalVisible}
      onCancel={onCancel}
      onSubmit={handleSubmit}
      loading={loading}
      initialValues={record}
      ownForm={ownForm}
      width={width}
    >
      {children}
    </BaseModalForm>
  );
};

export default CreateOrModifyForm;
