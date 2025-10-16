// components/extensions/FlashHighlight.ts
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'

const key = new PluginKey('flashHighlight')

export const FlashHighlight = Extension.create({
  name: 'flashHighlight',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key,
        state: {
          init: () => DecorationSet.empty,
          apply(tr, old) {
            /* Remove on explicit meta or when doc changed */
            if (tr.getMeta('flash-sentence-remove') || tr.docChanged) {
              return DecorationSet.empty
            }

            /* Add new flash decoration when meta present */
            const meta = tr.getMeta('flash-sentence')
            if (meta) {
              const deco = Decoration.inline(meta.from, meta.to, {
                class: 'flash-bg',
              })
              return DecorationSet.create(tr.doc, [deco])
            }
            return old
          },
        },
        props: {
          decorations: state => key.getState(state),
        },
      }),
    ]
  },
})