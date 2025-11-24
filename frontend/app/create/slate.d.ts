import { BaseEditor } from 'slate';
import { ReactEditor } from 'slate-react';

export type ParagraphElement = { type: 'paragraph'; align?: 'left' | 'center' | 'right' | 'justify'; children: CustomText[] };
export type HeadingElement = { type: 'heading'; align?: 'left' | 'center' | 'right' | 'justify'; children: CustomText[] };
export type BlockQuoteElement = { type: 'block-quote'; align?: 'left' | 'center' | 'right' | 'justify'; children: CustomText[] };
export type BulletedListElement = { type: 'bulleted-list'; align?: 'left' | 'center' | 'right' | 'justify'; children: CustomText[] };
export type NumberedListElement = { type: 'numbered-list'; align?: 'left' | 'center' | 'right' | 'justify'; children: CustomText[] };
export type ImageElement = { type: 'image'; url: string; imageId?: string; align?: 'left' | 'center' | 'right' | 'justify'; children: CustomText[] };
export type CustomElement = ParagraphElement | HeadingElement | BlockQuoteElement | BulletedListElement | NumberedListElement | ImageElement;

export type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  link?: string; // 링크는 URL 문자열로 저장
  fontSize?: number; // 글자 크기 (pt 단위)
};

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}
