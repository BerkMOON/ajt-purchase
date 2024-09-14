import { useCallback, useState } from 'react';

export interface ModalControl {
  visible: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * 模态框控制 Hook
 * @param initialVisible - 初始可见状态，默认为 false
 * @returns ModalControl - 包含可见状态和控制方法的对象
 *
 * @example
 * const modal = useModalControl();
 *
 * // 打开模态框
 * modal.open();
 *
 * // 关闭模态框
 * modal.close();
 *
 * // 切换模态框状态
 * modal.toggle();
 *
 * // 在组件中使用
 * <Modal visible={modal.visible} onCancel={modal.close}>
 *   // 模态框内容
 * </Modal>
 */
export function useModalControl(initialVisible = false): ModalControl {
  const [visible, setVisible] = useState(initialVisible);

  const open = useCallback(() => {
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
  }, []);

  const toggle = useCallback(() => {
    setVisible((prev) => !prev);
  }, []);

  return {
    visible,
    open,
    close,
    toggle,
  };
}
