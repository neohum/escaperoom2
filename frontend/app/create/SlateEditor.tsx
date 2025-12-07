import React, { useMemo, useCallback, useState, useRef } from 'react';
import {
  MdFormatBold, MdFormatItalic, MdFormatUnderlined, MdStrikethroughS, MdCode,
  MdFormatQuote, MdFormatListBulleted, MdFormatListNumbered, MdTitle, MdLink, MdImage,
  MdFormatAlignLeft, MdFormatAlignCenter, MdFormatAlignRight, MdFormatAlignJustify
} from 'react-icons/md';
import { createEditor, Editor, Transforms, Text, Element as SlateElement } from 'slate';
import { ReactEditor } from 'slate-react';
import type { ParagraphElement } from './slate.d';
import { Slate, Editable, withReact } from 'slate-react';

// ResizableImage 컴포넌트
const ResizableImage = ({ attributes, element, children, editor }: any) => {
  const [width, setWidth] = useState(element.width || 300);
  const [height, setHeight] = useState(element.height || 200);
  const [isResizing, setIsResizing] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const updateSize = (newWidth: number, newHeight: number) => {
    const clampedWidth = Math.max(50, newWidth);
    const clampedHeight = Math.max(50, newHeight);
    setWidth(clampedWidth);
    setHeight(clampedHeight);
  };

  const saveSize = () => {
    try {
      const path = ReactEditor.findPath(editor, element);
      Transforms.setNodes(editor, { width, height } as any, { at: path });
    } catch (error) {
      console.error('Failed to update image size:', error);
    }
  };

  const handleMouseDown = (direction: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = width;
    const startHeight = height;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      switch (direction) {
        case 'se': // 우하단
          newWidth = startWidth + deltaX;
          newHeight = startHeight + deltaY;
          break;
        case 'sw': // 좌하단
          newWidth = startWidth - deltaX;
          newHeight = startHeight + deltaY;
          break;
        case 'ne': // 우상단
          newWidth = startWidth + deltaX;
          newHeight = startHeight - deltaY;
          break;
        case 'nw': // 좌상단
          newWidth = startWidth - deltaX;
          newHeight = startHeight - deltaY;
          break;
      }

      updateSize(newWidth, newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      saveSize();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSelected(!isSelected);
  };

  const handleImageMouseLeave = () => {
    // 마우스가 이미지 밖으로 나가면 선택 해제 (선택 사항)
    // setIsSelected(false);
  };

  const handleDelete = () => {
    try {
      const path = ReactEditor.findPath(editor, element);
      Transforms.removeNodes(editor, { at: path });
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  return (
    <span {...attributes} style={{ position: 'relative', display: 'inline-block', margin: '0 4px' }}>
      <img
        ref={imageRef}
        src={element.url}
        alt=""
        onClick={handleImageClick}
        onMouseLeave={handleImageMouseLeave}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          maxWidth: '100%',
          display: 'block',
          border: isResizing ? '2px solid #3b82f6' : (isSelected ? '2px solid #3b82f6' : '1px solid #d1d5db'),
          borderRadius: '4px',
          cursor: 'pointer',
          pointerEvents: 'auto',
        }}
      />
      {/* 삭제 버튼 - 선택 상태일 때만 표시 */}
      {isSelected && (
        <button
          onClick={handleDelete}
          style={{
            position: 'absolute',
            top: '5px',
            right: '5px',
            width: '20px',
            height: '20px',
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            border: 'none',
            borderRadius: '50%',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 15,
          }}
          title="이미지 삭제"
        >
          ✕
        </button>
      )}
      {/* 크기 조정 핸들들 - 선택 상태일 때만 표시 */}
      {isSelected && (
        <>
          {/* 우상단 */}
          <div
            onMouseDown={handleMouseDown('ne')}
            style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              width: '10px',
              height: '10px',
              backgroundColor: '#3b82f6',
              border: '1px solid white',
              borderRadius: '50%',
              cursor: 'sw-resize',
              zIndex: 10,
            }}
          />
          {/* 좌상단 */}
          <div
            onMouseDown={handleMouseDown('nw')}
            style={{
              position: 'absolute',
              top: '-5px',
              left: '-5px',
              width: '10px',
              height: '10px',
              backgroundColor: '#3b82f6',
              border: '1px solid white',
              borderRadius: '50%',
              cursor: 'se-resize',
              zIndex: 10,
            }}
          />
          {/* 우하단 */}
          <div
            onMouseDown={handleMouseDown('se')}
            style={{
              position: 'absolute',
              bottom: '-5px',
              right: '-5px',
              width: '10px',
              height: '10px',
              backgroundColor: '#3b82f6',
              border: '1px solid white',
              borderRadius: '50%',
              cursor: 'nw-resize',
              zIndex: 10,
            }}
          />
          {/* 좌하단 */}
          <div
            onMouseDown={handleMouseDown('sw')}
            style={{
              position: 'absolute',
              bottom: '-5px',
              left: '-5px',
              width: '10px',
              height: '10px',
              backgroundColor: '#3b82f6',
              border: '1px solid white',
              borderRadius: '50%',
              cursor: 'ne-resize',
              zIndex: 10,
            }}
          />
        </>
      )}
      {children}
    </span>
  );
};

const isMarkActive = (editor: Editor, format: string) => {
  const marks = Editor.marks(editor) as any;
  return marks ? marks[format] === true : false;
};

const toggleMark = (editor: Editor, format: string) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const toggleFontSize = (editor: Editor, size: number) => {
  // 현재 선택된 텍스트의 글자 크기를 확인
  const marks = Editor.marks(editor) as any;
  const currentSize = marks?.fontSize;

  if (currentSize === size) {
    // 같은 크기면 제거 (기본 크기로)
    Editor.removeMark(editor, 'fontSize');
  } else {
    // 다른 크기면 설정
    Editor.addMark(editor, 'fontSize', size);
  }
};

const getCurrentFontSize = (editor: Editor): number => {
  const marks = Editor.marks(editor) as any;
  return marks?.fontSize || 12; // 기본 12pt
};

const LIST_TYPES = ['numbered-list', 'bulleted-list'];

const isBlockActive = (editor: Editor, format: string) => {
  const [match] = Editor.nodes(editor, {
    match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
  });
  return !!match;
};

const toggleBlock = (editor: Editor, format: string) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);
  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && LIST_TYPES.includes(n.type as string),
    split: true,
  });
  let newType: any = isActive ? 'paragraph' : format;
  Transforms.setNodes(editor, { type: newType } as any);
  if (!isActive && isList) {
    const block = { type: format, children: [] } as any;
    Transforms.wrapNodes(editor, block);
  }
};

const toggleAlign = (editor: Editor, align: 'left' | 'center' | 'right' | 'justify') => {
  const [match] = Editor.nodes(editor, {
    match: n => !Editor.isEditor(n) && SlateElement.isElement(n),
  });

  if (match) {
    const currentAlign = (match[0] as any).align;
    if (currentAlign === align) {
      // 같은 정렬이면 제거 (기본 왼쪽 정렬로)
      Transforms.setNodes(editor, { align: undefined } as any);
    } else {
      // 다른 정렬이면 설정
      Transforms.setNodes(editor, { align } as any);
    }
  }
};

const getCurrentAlign = (editor: Editor): 'left' | 'center' | 'right' | 'justify' => {
  const [match] = Editor.nodes(editor, {
    match: n => !Editor.isEditor(n) && SlateElement.isElement(n),
  });

  if (match) {
    return (match[0] as any).align || 'left';
  }
  return 'left';
};
interface SlateEditorProps {
  value: ParagraphElement[];
  onChange: (value: ParagraphElement[]) => void;
  placeholder?: string;
  height?: string;
}

export default function SlateEditor({ value, onChange, placeholder, height = "300px" }: SlateEditorProps) {
  const editor = useMemo(() => withReact(createEditor()), []);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // value가 비정상(빈 배열, null, undefined, children이 없는 노드 등)일 때 항상 최소 1개 paragraph+text가 보장되도록 방어
  const safeValue = useMemo(() => {
    const isValidSlateValue = (val: any) => {
      return (
        Array.isArray(val) &&
        val.length > 0 &&
        val.every(
          (el: any) =>
            el &&
            typeof el === 'object' &&
            Array.isArray(el.children) &&
            el.children.length > 0 &&
            el.children.every((child: any) => child && typeof child.text === 'string')
        )
      );
    };
    if (!isValidSlateValue(value)) {
      return [{ type: 'paragraph', children: [{ text: '' }] }] as ParagraphElement[];
    } else {
      return value as ParagraphElement[];
    }
  }, [value]);
  // 툴바 버튼 목록 및 핸들러
  // selection이 없을 때 isActive 계산이 오류를 내지 않도록 방어
  // 툴바 버튼의 isActive 계산을 useMemo로 분리하여 렌더링 중 selection이 없거나 Slate 내부 상태가 불안정할 때 오류가 발생하지 않도록 함
  const toolbarButtons = useMemo(() => [
    { icon: <MdFormatBold />, label: '굵게', action: () => toggleMark(editor, 'bold'), isActive: false },
    { icon: <MdFormatItalic />, label: '기울임', action: () => toggleMark(editor, 'italic'), isActive: false },
    { icon: <MdFormatUnderlined />, label: '밑줄', action: () => toggleMark(editor, 'underline'), isActive: false },
    { icon: <MdStrikethroughS />, label: '취소선', action: () => toggleMark(editor, 'strikethrough'), isActive: false },
    { icon: <MdCode />, label: '코드', action: () => toggleMark(editor, 'code'), isActive: false },
    { icon: <MdTitle />, label: '헤딩', action: () => toggleBlock(editor, 'heading'), isActive: false },
    { icon: <MdFormatListBulleted />, label: '글머리', action: () => toggleBlock(editor, 'bulleted-list'), isActive: false },
    { icon: <MdFormatListNumbered />, label: '번호', action: () => toggleBlock(editor, 'numbered-list'), isActive: false },
    { icon: <MdFormatQuote />, label: '인용구', action: () => toggleBlock(editor, 'block-quote'), isActive: false },
    { icon: <MdLink />, label: '링크', action: () => {
      const url = window.prompt('링크 주소를 입력하세요');
      if (url) {
        Editor.addMark(editor, 'link', url);
      }
    }, isActive: false },
    { icon: <MdImage />, label: '이미지', action: () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, isActive: false },
    { icon: <MdFormatAlignLeft />, label: '왼쪽 정렬', action: () => toggleAlign(editor, 'left'), isActive: false },
    { icon: <MdFormatAlignCenter />, label: '중앙 정렬', action: () => toggleAlign(editor, 'center'), isActive: false },
    { icon: <MdFormatAlignRight />, label: '오른쪽 정렬', action: () => toggleAlign(editor, 'right'), isActive: false },
    { icon: <MdFormatAlignJustify />, label: '양쪽 정렬', action: () => toggleAlign(editor, 'justify'), isActive: false },
  ], [editor]); // editor만 의존성으로

  return (
    <div className="w-full max-w-2xl mx-auto">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            try {
              // 파일을 base64로 변환
              const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
              });

              // 로컬스토리지에 저장 (고유 ID로)
              const imageId = `slate_image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              localStorage.setItem(imageId, base64);

              // 에디터에 삽입 (base64 URL 사용)
              const image = { type: 'image', url: base64, imageId, width: 300, height: 200, children: [{ text: '' }] } as any;
              Transforms.insertNodes(editor, image);
            } catch (error) {
              console.error('Image processing failed:', error);
              alert('이미지 처리에 실패했습니다.');
            }
          }
          // Reset input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }}
      />
      <Slate
        editor={editor}
        initialValue={safeValue}
        key={height} // Re-mount when height changes
        onChange={val => {
          // 빈 값이 들어오면 항상 최소 1개 paragraph+text가 보장되도록 강제
          if (!Array.isArray(val) || val.length === 0 ||
            !val[0] || typeof val[0] !== 'object' || !Array.isArray((val[0] as any).children) ||
            (val[0] as any).children.length === 0 || typeof (val[0] as any).children[0].text !== 'string') {
            onChange([{ type: 'paragraph', children: [{ text: '' }] }]);
          } else {
            onChange(val as ParagraphElement[]);
          }
        }}
      >
        <div className="sticky top-0 z-10 flex gap-1 border-b border-gray-200 p-2 bg-white/90 backdrop-blur shadow-sm rounded-t">
          {/* 글자 크기 선택 드롭다운 */}
          <select
            value={(() => {
              try {
                return editor.selection ? getCurrentFontSize(editor) : 12;
              } catch {
                return 12;
              }
            })()}
            onChange={(e) => {
              const size = parseInt(e.target.value);
              toggleFontSize(editor, size);
            }}
            className="px-2 py-1 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
            title="글자 크기"
          >
            <option value="8">8pt</option>
            <option value="10">10pt</option>
            <option value="12">12pt</option>
            <option value="14">14pt</option>
            <option value="16">16pt</option>
            <option value="18">18pt</option>
            <option value="20">20pt</option>
            <option value="30">30pt</option>
            <option value="40">40pt</option>
          </select>

          {toolbarButtons
            .filter(
              btn =>
                btn &&
                typeof btn === 'object' &&
                typeof btn.label === 'string' &&
                btn.icon &&
                typeof btn.action === 'function' &&
                typeof btn.isActive !== 'undefined'
            )
            .map(btn => {
              // 렌더링 시점에 실시간으로 isActive 계산
              const safeIsMarkActive = (format: string) => {
                try {
                  if (!editor.selection) return false;
                  return isMarkActive(editor, format);
                } catch {
                  return false;
                }
              };
              const safeIsBlockActive = (format: string) => {
                try {
                  if (!editor.selection) return false;
                  return isBlockActive(editor, format);
                } catch {
                  return false;
                }
              };

              let isActive = false;
              if (btn.label === '굵게') isActive = safeIsMarkActive('bold');
              else if (btn.label === '기울임') isActive = safeIsMarkActive('italic');
              else if (btn.label === '밑줄') isActive = safeIsMarkActive('underline');
              else if (btn.label === '취소선') isActive = safeIsMarkActive('strikethrough');
              else if (btn.label === '코드') isActive = safeIsMarkActive('code');
              else if (btn.label === '헤딩') isActive = safeIsBlockActive('heading');
              else if (btn.label === '글머리') isActive = safeIsBlockActive('bulleted-list');
              else if (btn.label === '번호') isActive = safeIsBlockActive('numbered-list');
              else if (btn.label === '인용구') isActive = safeIsBlockActive('block-quote');
              else if (btn.label === '링크') isActive = safeIsMarkActive('link');
              else if (btn.label === '왼쪽 정렬') isActive = (() => { try { return getCurrentAlign(editor) === 'left'; } catch { return false; } })();
              else if (btn.label === '중앙 정렬') isActive = (() => { try { return getCurrentAlign(editor) === 'center'; } catch { return false; } })();
              else if (btn.label === '오른쪽 정렬') isActive = (() => { try { return getCurrentAlign(editor) === 'right'; } catch { return false; } })();
              else if (btn.label === '양쪽 정렬') isActive = (() => { try { return getCurrentAlign(editor) === 'justify'; } catch { return false; } })();

              try {
                if (!btn) return null;
                return (
                  <button
                    key={btn.label}
                    type="button"
                    className={`p-1 rounded transition-colors duration-100 ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200 text-gray-700'}`}
                    title={btn.label}
                    onMouseDown={e => { e.preventDefault(); btn.action(); }}
                  >
                    {btn.icon}
                  </button>
                );
              } catch {
                return null;
              }
            })}
        </div>
        <Editable
          className={`px-4 py-2 focus:outline-none bg-white transition-shadow duration-150 text-gray-900 ${isFocused ? 'ring-2 ring-blue-300 shadow-lg' : 'ring-1 ring-gray-200'} rounded-b overflow-y-auto`}
          style={{ height }}
          placeholder={placeholder || '내용을 입력하세요...'}
          spellCheck
          autoFocus={false}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          renderElement={useCallback((props: any) => {
            try {
              const alignStyle = props.element.align ? { textAlign: props.element.align } : {};

              switch (props.element.type) {
                case 'heading':
                  return <h2 {...props.attributes} style={alignStyle} className="font-bold text-lg my-2">{props.children}</h2>;
                case 'block-quote':
                  return <blockquote {...props.attributes} style={alignStyle} className="border-l-4 pl-3 italic text-gray-600 my-2">{props.children}</blockquote>;
                case 'bulleted-list':
                  return <ul {...props.attributes} style={alignStyle} className="list-disc ml-6 my-2">{props.children}</ul>;
                case 'numbered-list':
                  return <ol {...props.attributes} style={alignStyle} className="list-decimal ml-6 my-2">{props.children}</ol>;
                case 'image':
                  return <ResizableImage {...props} editor={editor} />;
                default:
                  return <p {...props.attributes} style={alignStyle}>{props.children}</p>;
              }
            } catch {
              return <p {...props.attributes}>{props.children}</p>;
            }
          }, [editor])}
          renderLeaf={useCallback((props: any) => {
            try {
              let style: React.CSSProperties = {};
              if (props.leaf.fontSize) {
                style.fontSize = `${props.leaf.fontSize}pt`;
              }

              let el = <span {...props.attributes} style={style}>{props.children}</span>;
              if (props.leaf.bold) el = <strong {...props.attributes} style={style}>{el}</strong>;
              if (props.leaf.italic) el = <em {...props.attributes} style={style}>{el}</em>;
              if (props.leaf.underline) el = <u {...props.attributes} style={style}>{el}</u>;
              if (props.leaf.strikethrough) el = <s {...props.attributes} style={style}>{el}</s>;
              if (props.leaf.code) el = <code {...props.attributes} style={{...style, backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem', fontSize: '0.875rem'}}>{el}</code>;
              if (typeof props.leaf.link === 'string' && props.leaf.link) {
                el = <a {...props.attributes} href={props.leaf.link} style={{...style, color: '#2563eb', textDecoration: 'underline'}} target="_blank" rel="noopener noreferrer">{el}</a>;
              }
              return el;
            } catch {
              return <span {...props.attributes}>{props.children}</span>;
            }
          }, [])}
        />
      </Slate>
    </div>
  );
}
