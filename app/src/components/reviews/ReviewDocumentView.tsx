import React from 'react';
import type { components } from '../../../../contract/generated/schema';

export type ReviewDocument = components['schemas']['ReviewDocument'];
export type RichTextRun = components['schemas']['RichTextRun'];
export type ReviewBlock = ReviewDocument['blocks'][number];

function renderRuns(runs: readonly RichTextRun[]) {
  return runs.map((run, runIndex) => {
    const parts = (run.text ?? '').split('\n');
    const children = parts.map((part, partIndex) => (
      <React.Fragment key={partIndex}>
        {partIndex > 0 && <br />}
        {part}
      </React.Fragment>
    ));

    let element: React.ReactNode = <React.Fragment key={runIndex}>{children}</React.Fragment>;
    if (run.italic) {
      element = <em key={runIndex}>{element}</em>;
    }
    if (run.bold) {
      element = <strong key={runIndex}>{element}</strong>;
    }
    return element;
  });
}

export interface ReviewDocumentViewProps {
  document?: ReviewDocument | null;
  fallbackText?: string | null;
  className?: string;
}

export function ReviewDocumentView({
  document,
  fallbackText,
  className = 'review-body',
}: ReviewDocumentViewProps) {
  const blocks = document?.blocks ?? [];

  if (blocks.length === 0) {
    return (
      <div className={className}>
        {fallbackText ? <p style={{ margin: 0 }}>{fallbackText}</p> : null}
      </div>
    );
  }

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {blocks.map((block, index) => {
        if (block.type === 'paragraph') {
          return (
            <p key={index} style={{ margin: 0, color: 'var(--foreground)', lineHeight: 1.6 }}>
              {renderRuns(block.content)}
            </p>
          );
        }
        if (block.type === 'bullet_list') {
          return (
            <ul key={index} style={{ margin: '4px 0', paddingLeft: '22px', color: 'var(--foreground)' }}>
              {block.items.map((itemRuns, itemIdx) => (
                <li key={itemIdx} style={{ margin: '2px 0' }}>
                  {renderRuns(itemRuns)}
                </li>
              ))}
            </ul>
          );
        }
        if (block.type === 'ordered_list') {
          return (
            <ol key={index} style={{ margin: '4px 0', paddingLeft: '22px', color: 'var(--foreground)' }}>
              {block.items.map((itemRuns, itemIdx) => (
                <li key={itemIdx} style={{ margin: '2px 0' }}>
                  {renderRuns(itemRuns)}
                </li>
              ))}
            </ol>
          );
        }
        return null;
      })}
    </div>
  );
}
