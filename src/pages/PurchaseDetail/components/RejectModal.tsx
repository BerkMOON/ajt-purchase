import { Input, Modal } from 'antd';
import React from 'react';

const { TextArea } = Input;

interface RejectModalProps {
  visible: boolean;
  reason: string;
  onChange: (value: string) => void;
  onOk: () => void;
  onCancel: () => void;
}

const RejectModal: React.FC<RejectModalProps> = ({
  visible,
  reason,
  onChange,
  onOk,
  onCancel,
}) => (
  <Modal
    title="价格审批驳回"
    open={visible}
    onOk={onOk}
    onCancel={onCancel}
    width={500}
  >
    <div style={{ marginBottom: 16 }}>
      <label>驳回原因：</label>
    </div>
    <TextArea
      rows={4}
      placeholder="请输入驳回原因"
      value={reason}
      onChange={(e) => onChange(e.target.value)}
    />
  </Modal>
);

export default RejectModal;
