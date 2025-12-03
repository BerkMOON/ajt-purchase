import '@wangeditor/editor/dist/css/style.css';
import React from 'react';

export interface RichTextViewerProps {
  /**
   * 富文本 HTML 内容
   */
  content?: string;
  /**
   * 空内容时显示的占位符
   * @default '-'
   */
  placeholder?: string;
  /**
   * 自定义容器类名
   */
  className?: string;
  /**
   * 自定义样式
   */
  style?: React.CSSProperties;
}

const RichTextViewer: React.FC<RichTextViewerProps> = ({
  content,
  placeholder = '-',
  className = '',
  style,
}) => {
  if (!content) {
    return <span>{placeholder}</span>;
  }

  return (
    <>
      <style>{`
        .rich-text-viewer-container table {
          width: 100%;
          border-collapse: collapse;
          margin: 12px 0;
        }
        .rich-text-viewer-container table th,
        .rich-text-viewer-container table td {
          border: 1px solid #d9d9d9;
          padding: 8px 12px;
          text-align: left;
        }
        .rich-text-viewer-container table th {
          background-color: #fafafa;
          font-weight: 600;
        }
        .rich-text-viewer-container p {
          margin: 8px 0;
        }
        .rich-text-viewer-container {
          max-width: 100%;
          padding: 12px;
          border: 1px solid #e8e8e8;
          border-radius: 4px;
          background-color: #fafafa;
        }
      `}</style>
      <div
        className={`w-e-text-container rich-text-viewer-container ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
        style={style}
      />
    </>
  );
};

export default RichTextViewer;
