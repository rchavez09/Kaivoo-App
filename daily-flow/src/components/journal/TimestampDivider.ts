import { Node, mergeAttributes } from '@tiptap/core';

export const TimestampDivider = Node.create({
  name: 'timestampDivider',
  group: 'block',
  atom: true,
  selectable: false,
  draggable: false,

  addAttributes() {
    return {
      timestamp: { default: null },
      entryId: { default: null },
      label: { default: '' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-timestamp-divider]',
        getAttrs: (dom) => ({
          timestamp: dom.getAttribute('data-timestamp'),
          entryId: dom.getAttribute('data-entry-id'),
          label: dom.textContent || '',
        }),
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const timestamp: string = node.attrs.timestamp;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const entryId: string = node.attrs.entryId;
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-timestamp-divider': '',
        'data-timestamp': timestamp,
        'data-entry-id': entryId,
        contenteditable: 'false',
        class: 'timestamp-divider',
      }),
      node.attrs.label as string,
    ];
  },
});
