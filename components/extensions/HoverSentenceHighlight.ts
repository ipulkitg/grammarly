// components/extensions/HoverSentenceHighlight.ts
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { charIndexToPos, getTextOffset, findSentenceBoundaries } from '@/lib/prosemirror-utils'

const key = new PluginKey('hoverSentence')

export const HoverSentenceHighlight = Extension.create({
  name: 'hoverSentenceHighlight',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key,

        /* ---------- PLUGIN STATE ---------- */
        state: {
          init: () => ({ decos: DecorationSet.empty, locked: false }),
          apply(tr, value) {
            /* clear when doc changes */
            if (tr.docChanged) return { decos: DecorationSet.empty, locked: false }

            /* lock/unlock coming from React via meta */
            if (tr.getMeta('lock-hover'))     return { ...value, locked: true  }
            if (tr.getMeta('unlock-hover'))   return { ...value, locked: false }

            /* update decos from hover */
            const newDeco = tr.getMeta('hover-deco')
            if (newDeco) return { ...value, decos: newDeco }

            return value
          },
        },

        props: {
          decorations: state => key.getState(state).decos,

          /* ---------- DOM EVENTS ---------- */
          handleDOMEvents: {
            mousemove(view, e) {
              const state = key.getState(view.state)
              if (state.locked) return false       // keep current highlight

              const pos = view.posAtCoords({
                left: (e as MouseEvent).clientX,
                top:  (e as MouseEvent).clientY,
              })
              if (!pos) return false

              // Get the text offset for the current position
              const textOffset = getTextOffset(view.state.doc, pos.pos)
              
              // Find sentence boundaries in the text
              const { start, end } = findSentenceBoundaries(
                view.state.doc.textContent,
                textOffset,
              )

              // Convert text offsets back to ProseMirror positions
              const pmStart = charIndexToPos(view.state.doc, start)
              const pmEnd   = charIndexToPos(view.state.doc, end)

              // Add different class if modifier key is held
              const className = (e as MouseEvent).metaKey || (e as MouseEvent).ctrlKey 
                ? 'sentence-hover sentence-clickable' 
                : 'sentence-hover'

              const decos = DecorationSet.create(view.state.doc, [
                Decoration.inline(pmStart, pmEnd, { class: className }),
              ])
              view.dispatch(view.state.tr.setMeta('hover-deco', decos))
              return false
            },

            mouseleave(view) {
              const state = key.getState(view.state)
              if (state.locked) return false
              view.dispatch(view.state.tr.setMeta('hover-deco',
                DecorationSet.empty))
              return false
            },
          },
        },
      }),
    ]
  },
})

