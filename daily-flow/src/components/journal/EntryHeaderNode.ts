import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import EntryHeader from './EntryHeader';

/**
 * EntryHeader — TipTap Node extension (replaces TimestampDivider).
 * Renders as a React NodeView with per-entry metadata pills.
 * parseHTML matches the same `div[data-timestamp-divider]` selector
 * for backward compatibility with existing stored HTML.
 */
export const EntryHeaderNode = Node.create({
  name: 'entryHeader',
  group: 'block',
  atom: true,
  selectable: false,
  draggable: false,

  addAttributes() {
    return {
      entryId: { default: null },
      timestamp: { default: null },
      collapsed: { default: false },
      label: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-timestamp-divider]',
        getAttrs: (dom) => ({
          entryId: dom.getAttribute('data-entry-id'),
          timestamp: dom.getAttribute('data-timestamp'),
          collapsed: dom.getAttribute('data-collapsed') === 'true',
          label: dom.getAttribute('data-label') || null,
        }),
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const timestamp = node.attrs.timestamp as string;
    const entryId = node.attrs.entryId as string;
    const collapsed = node.attrs.collapsed as boolean;
    const customLabel = node.attrs.label as string | null;
    const displayLabel = customLabel
      ? `── ${customLabel} ──`
      : timestamp
        ? `── ${new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} ──`
        : '';
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-timestamp-divider': '',
        'data-timestamp': timestamp,
        'data-entry-id': entryId,
        'data-collapsed': String(collapsed),
        ...(customLabel ? { 'data-label': customLabel } : {}),
        contenteditable: 'false',
        class: 'timestamp-divider',
      }),
      displayLabel,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(EntryHeader);
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('entryCollapse'),
        props: {
          decorations: (state) => {
            const { doc } = state;
            const decorations: Decoration[] = [];
            let hiding = false;

            doc.forEach((node, pos) => {
              if (node.type.name === 'entryHeader') {
                hiding = node.attrs.collapsed === true;
                return;
              }
              if (hiding) {
                decorations.push(
                  Decoration.node(pos, pos + node.nodeSize, {
                    class: 'collapsed-content',
                  }),
                );
              }
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});
