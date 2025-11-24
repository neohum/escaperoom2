import React from 'react';
import type { ParagraphElement } from '../../create/slate.d';

interface SlatePreviewProps {
  content: ParagraphElement[];
  className?: string;
}

export default function SlatePreview({ content, className = '' }: SlatePreviewProps) {
  const renderElement = (element: any, children: React.ReactNode) => {
    const alignStyle = element.align ? { textAlign: element.align } : {};

    switch (element.type) {
      case 'heading':
        return <h2 style={alignStyle} className="font-bold text-lg my-2">{children}</h2>;
      case 'block-quote':
        return <blockquote style={alignStyle} className="border-l-4 pl-3 italic text-gray-600 my-2">{children}</blockquote>;
      case 'bulleted-list':
        return <ul style={alignStyle} className="list-disc ml-6 my-2">{children}</ul>;
      case 'numbered-list':
        return <ol style={alignStyle} className="list-decimal ml-6 my-2">{children}</ol>;
      case 'image':
        return <img src={element.url} alt="" style={alignStyle} className="max-h-48 my-2 rounded shadow" />;
      default:
        return <p style={alignStyle}>{children}</p>;
    }
  };

  const renderLeaf = (leaf: any, children: React.ReactNode) => {
    let style: React.CSSProperties = {};
    if (leaf.fontSize) {
      style.fontSize = `${leaf.fontSize}pt`;
    }

    let result = <span style={style}>{children}</span>;

    if (leaf.bold) result = <strong style={style}>{result}</strong>;
    if (leaf.italic) result = <em style={style}>{result}</em>;
    if (leaf.underline) result = <u style={style}>{result}</u>;
    if (leaf.strikethrough) result = <s style={style}>{result}</s>;
    if (leaf.code) result = <code style={{...style, backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem', fontSize: '0.875rem'}}>{result}</code>;
    if (typeof leaf.link === 'string' && leaf.link) {
      result = <a href={leaf.link} style={{...style, color: '#2563eb', textDecoration: 'underline'}} target="_blank" rel="noopener noreferrer">{result}</a>;
    }

    return result;
  };

  const renderContent = (nodes: any[]): React.ReactNode => {
    return nodes.map((node, index) => {
      if ('text' in node) {
        // Leaf node
        return <React.Fragment key={index}>{renderLeaf(node, node.text)}</React.Fragment>;
      } else {
        // Element node
        const children = renderContent(node.children || []);
        return <React.Fragment key={index}>{renderElement(node, children)}</React.Fragment>;
      }
    });
  };

  return (
    <div className={`prose prose-gray max-w-none ${className}`}>
      {renderContent(content)}
    </div>
  );
}