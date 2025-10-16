// extensions/SentenceRange.ts
import { Extension } from "@tiptap/core";
import { Plugin } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import { charIndexToPos, getTextOffset, findSentenceBoundaries } from "@/lib/prosemirror-utils";

export const SentenceRange = Extension.create({
  name: "sentenceRange",

  addOptions() {
    return {
      sentenceRegex: /[^.!?]*[.!?]+/g, // crude but works; tweak later
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleClick: (view: EditorView, pos: number, event: MouseEvent) => {
            // Only trigger on Cmd/Ctrl + Click
            if (!event.metaKey && !event.ctrlKey) return false;
            
            // Don't trigger on spell errors
            const target = event.target as HTMLElement;
            if (target.closest('.spell-error')) return false;
            
            const text = view.state.doc.textContent;
            
            // Get text offset from position
            const textOffset = getTextOffset(view.state.doc, pos);
            
            const { start, end } = findSentenceBoundaries(text, textOffset);

            if (start === end) return false;
            
            // Convert text offsets back to positions
            const pmStart = charIndexToPos(view.state.doc, start);
            const pmEnd = charIndexToPos(view.state.doc, end);

            /* Pass range & text through a DOM CustomEvent so the React side can
               fetch rewrites & open tooltip. */
            const detail = {
              from: pmStart,
              to: pmEnd,
              sentence: text.slice(start, end),
              domEvent: event,
            };

            const el = (event.target as HTMLElement).closest(
              '[data-type="text"]'
            );
            el?.classList.add("sentence-interactive");
            setTimeout(
              () => el?.classList.remove("sentence-interactive"),
              2000
            );
            view.dom.dispatchEvent(
              new CustomEvent("sentence-click", { detail })
            );
            return true;
          },
        },
      }),
    ];
  },
});

