import { Node, mergeAttributes, InputRule } from '@tiptap/core';

/**
 * WikiLink — TipTap inline Node extension (Sprint 33 P3).
 * Renders [[Topic]] and [[Topic/Page]] as styled, clickable links.
 * Stores the path text as an attribute, renders as a span with data-wiki-link.
 *
 * InputRule: when user types `]]`, if preceded by `[[text`, converts to wiki-link node.
 * parseHTML: matches `<span data-wiki-link="...">` for round-trip persistence.
 */
export const WikiLinkNode = Node.create({
  name: 'wikiLink',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      path: { default: '' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-wiki-link]',
        getAttrs: (dom) => ({
          path: (dom as HTMLElement).getAttribute('data-wiki-link') || '',
        }),
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-wiki-link': node.attrs.path as string,
        class: 'wiki-link',
        role: 'link',
        tabindex: '0',
      }),
      `[[${node.attrs.path as string}]]`,
    ];
  },

  addInputRules() {
    return [
      new InputRule({
        // Match [[some/path]] at the end of input
        find: /\[\[([^\]]+)\]\]$/,
        handler: ({ state, range, match }) => {
          const path = match[1];
          const { tr } = state;
          tr.replaceWith(range.from, range.to, this.type.create({ path }));
        },
      }),
    ];
  },
});
