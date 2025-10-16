// SpellcheckHighlight.ts
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'
import type { Node as ProseMirrorNode } from 'prosemirror-model'

export const spellcheckKey = new PluginKey('spellcheckHighlight')

export const SpellcheckHighlight = Extension.create({
  name: 'spellcheckHighlight',

  addProseMirrorPlugins() {
    const makeDecos = (
      doc: ProseMirrorNode,
      errors: { from: number; to: number; suggestions?: string[] }[] = [],
    ) => {
      const decos = errors.map(err =>
        Decoration.inline(
          err.from,
          err.to,
          {
            class: 'spell-error',
            'data-suggestions': JSON.stringify(err.suggestions || []),
            'data-pm-from': String(err.from),
            'data-pm-to': String(err.to),
          },
          {
            original: doc.textBetween(err.from, err.to, ""),
          },
        ),
      )
      return DecorationSet.create(doc, decos)
    }

    return [
      new Plugin({
        key: spellcheckKey,
        state: {
          init() {
            return DecorationSet.empty
          },
          apply(tr, old) {
            /** Meta payload = array<{from, to, suggestions}> */
            const meta = tr.getMeta(spellcheckKey)

            // 1) If the transaction explicitly passes a new error list we rebuild
            //    the decorations from scratch.
            if (meta) {
              return makeDecos(tr.doc, meta)
            }

            // 2) Otherwise we preserve the existing decoration set, remapping
            //    its positions through the transaction so that highlights stay
            //    aligned with the underlying text as it changes.
            const mapped = old.map(tr.mapping, tr.doc)

            // Filter out any highlight whose underlying text no longer matches the
            // original misspelling (for example after the user clicked a
            // suggestion and replaced the word).
            const toKeep: Decoration[] = []
            mapped.find().forEach(dec => {
              const spec = dec.spec as { original?: string } | null | undefined
              const orig = spec?.original
              if (!orig) {
                toKeep.push(dec)
                return
              }
              const current = tr.doc.textBetween(dec.from, dec.to, "")
              if (current === orig) {
                toKeep.push(dec)
              }
            })

            if (toKeep.length === mapped.find().length) {
              return mapped
            }

            return DecorationSet.create(tr.doc, toKeep)
          },
        },
        props: {
          decorations(state) {
            return this.getState(state)
          },
        },
      }),
    ]
  },
})