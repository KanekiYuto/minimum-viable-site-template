import { DocumentViewer } from "./DocumentViewer";

interface DocumentLayoutProps {
  /** Markdown 内容 */
  content: string;
  /** 自定义类名 */
  className?: string;
  /** showNav 参数保留用于兼容性但不再使用 */
  showNav?: boolean;
}

/**
 * 文档布局组件 - 服务端渲染
 * 提供完整的文档阅读体验
 */
export function DocumentLayout({
  content,
  className = "",
}: DocumentLayoutProps) {
  return (
    <div className={`document-layout ${className}`}>
      <div className="flex min-h-screen bg-background">
        {/* 主内容区域 */}
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-6 lg:px-12 py-8 lg:py-12">
            <DocumentViewer content={content} />
          </div>
        </main>
      </div>
    </div>
  );
}
