// Shared ProseMirror utility functions

/**
 * Convert a character index (text offset) to a ProseMirror document position
 */
export function charIndexToPos(doc: any, charIdx: number): number {
  let textOffset = 0;
  let result = 0;
  let found = false;
  
  // Walk through all text nodes to find where charIdx falls
  doc.descendants((node: any, pos: number) => {
    if (found) return false;
    
    if (node.isText) {
      // Check if the target position is within this text node
      if (charIdx >= textOffset && charIdx < textOffset + node.text!.length) {
        // pos is the position before the text node content
        // For inline decorations, we need the exact position of each character
        // So for charIdx 0, we return pos (start of first char)
        // For charIdx 1, we return pos + 1 (start of second char)
        result = pos + (charIdx - textOffset);
        found = true;
        return false;
      }
      
      textOffset += node.text!.length;
    }
  });
  
  if (!found && charIdx === textOffset) {
    // Special case: position at the very end of the document
    result = doc.content.size;
  } else if (!found) {
    result = doc.content.size;
  }
  
  return result;
}

/**
 * Get the text offset from a ProseMirror document position
 */
export function getTextOffset(doc: any, pos: number): number {
  let textOffset = 0;
  let result = 0;
  let found = false;
  
  doc.descendants((node: any, nodePos: number) => {
    if (found) return false;
    
    if (node.isText) {
      const nodeStart = nodePos + 1; // Text content starts at pos+1
      const nodeEnd = nodePos + node.nodeSize;
      
      
      // Check if position is within this text node
      if (pos >= nodeStart && pos <= nodeEnd) {
        result = textOffset + (pos - nodeStart);
        found = true;
        return false;
      }
      
      // Position is after this text node, add its length to offset
      if (nodeEnd <= pos) {
        textOffset += node.text!.length;
      }
    }
  });
  
  if (!found) {
    result = textOffset;
  }
  
  return result;
}

/**
 * Find sentence boundaries in text
 */
export function findSentenceBoundaries(text: string, idx: number): { start: number; end: number } {
  // Handle edge cases
  if (idx < 0 || idx >= text.length) return { start: 0, end: 0 };
  
  
  let start = idx;
  
  // Move backwards to find the start of the sentence
  while (start > 0 && !'.!?'.includes(text[start - 1])) {
    start--;
  }
  
  
  // Skip any whitespace after punctuation
  while (start < text.length && /\s/.test(text[start])) {
    start++;
  }
  

  // Find sentence end
  let end = idx;
  
  // Move forward to find the end punctuation
  while (end < text.length) {
    const char = text[end];
    
    if ('.!?'.includes(char)) {
      // Include the punctuation
      end++;
      
      // Include any additional punctuation (like "..." or "!!")
      while (end < text.length && '.!?'.includes(text[end])) {
        end++;
      }
      
      // Check if there's a quote or parenthesis after punctuation
      while (end < text.length && '"\')'.includes(text[end])) {
        end++;
      }
      
      break;
    }
    end++;
  }

  // If we didn't find end punctuation, extend to end of text
  if (end === idx || (end < text.length && !'.!?"\''.includes(text[end - 1]))) {
    while (end < text.length && text[end] !== '\n') {
      end++;
    }
  }

  return { start, end };
}