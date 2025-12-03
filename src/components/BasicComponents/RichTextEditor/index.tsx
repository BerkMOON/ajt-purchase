import type {
  IDomEditor,
  IEditorConfig,
  IToolbarConfig,
} from '@wangeditor/editor';
import { Boot } from '@wangeditor/editor';
import { Editor, Toolbar } from '@wangeditor/editor-for-react';
import '@wangeditor/editor/dist/css/style.css';
import tableModule from '@wangeditor/table-module';
import React, { useEffect, useState } from 'react';

// 确保表格模块只注册一次（使用模块级变量）
let tableModuleRegistered = false;

// 在模块加载时注册表格模块
if (typeof window !== 'undefined' && !tableModuleRegistered) {
  try {
    Boot.registerModule(tableModule);
    tableModuleRegistered = true;
    console.log('表格模块注册成功');
  } catch (error) {
    // 如果注册失败，可能是已经注册过了
    console.warn('Table module registration:', error);
    tableModuleRegistered = true; // 标记为已注册，避免重复尝试
  }
}

export interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  height?: number;
  disabled?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = '请输入内容...',
  height = 400,
  disabled = false,
}) => {
  const [editor, setEditor] = useState<IDomEditor | null>(null);
  const [html, setHtml] = useState(value || '');

  // 工具栏配置
  // 表格模块注册后会自动添加表格相关的菜单项
  // 如果遇到重复键错误，可能需要排除默认的 insertTable
  const toolbarConfig: Partial<IToolbarConfig> = {
    excludeKeys: ['group-video'],
    // 注意：如果出现重复键错误，可以尝试添加 'insertTable' 到 excludeKeys
  };

  // 编辑器配置
  const editorConfig: Partial<IEditorConfig> = {
    placeholder,
    readOnly: disabled,
    MENU_CONF: {
      // 表格相关配置
      insertTable: {
        // 插入表格的默认配置
      },
    },
  };

  // 监听外部 value 变化，同步到编辑器
  useEffect(() => {
    if (editor && value !== undefined) {
      const currentValue = value || '';
      const editorHtml = editor.getHtml();
      // 只有当编辑器内容与外部值不同时才更新
      if (editorHtml !== currentValue) {
        editor.setHtml(currentValue);
        setHtml(currentValue);
      }
    } else if (!editor && value !== undefined) {
      // 编辑器还未创建时，先更新内部状态
      setHtml(value || '');
    }
  }, [value, editor]);

  // 编辑器创建时，设置初始值
  const handleEditorCreated = (editor: IDomEditor) => {
    setEditor(editor);
    // 如果外部有值，设置到编辑器
    if (value) {
      editor.setHtml(value);
      setHtml(value);
    }
  };

  // 编辑器内容变化时，同步到外部
  const handleEditorChange = (editor: IDomEditor) => {
    const newHtml = editor.getHtml();
    setHtml(newHtml);
    onChange?.(newHtml);
  };

  // 组件销毁时，及时销毁编辑器
  useEffect(() => {
    return () => {
      if (editor === null) return;
      editor.destroy();
      setEditor(null);
    };
  }, [editor]);

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: '4px' }}>
      <Toolbar
        editor={editor}
        defaultConfig={toolbarConfig}
        mode="default"
        style={{ borderBottom: '1px solid #d9d9d9' }}
      />
      <Editor
        defaultConfig={editorConfig}
        value={html}
        onCreated={handleEditorCreated}
        onChange={handleEditorChange}
        mode="default"
        style={{ height: `${height}px`, overflowY: 'hidden' }}
      />
    </div>
  );
};

export default RichTextEditor;
