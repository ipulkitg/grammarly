// /app/api/fix/spelling/route.ts
import { NextResponse } from 'next/server'
import nspell from 'nspell'
import { promises as fs } from 'fs'
import path from 'path'

let spell: ReturnType<typeof nspell> | null = null

async function loadSpell() {
  if (spell) return spell
  const dictDir = path.join(process.cwd(), 'public', 'dictionaries')
  const [aff, dic] = await Promise.all([
    fs.readFile(path.join(dictDir, 'en.aff')),
    fs.readFile(path.join(dictDir, 'en.dic')),
  ])
  spell = nspell(aff, dic)
  return spell
}

export async function POST(req: Request) {
  try {
    const { text } = await req.json()
    if (typeof text !== 'string' || !text.trim())
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })

    const sp = await loadSpell()

    /* ----------------------------------------------------------------
       Scan the whole doc once. The regex matches:
       - letters and digits (to catch things like "miss3pelled")
       - keeps apostrophes inside words (can't, apostrophe's)
    ---------------------------------------------------------------- */
    const wordRe = /\b[A-Za-z0-9]+(?:['\u2019][A-Za-z0-9]+)?\b/g
    const misspellings: {
      word: string
      from: number
      to: number
      suggestions: string[]
    }[] = []
    
    for (let match; (match = wordRe.exec(text)); ) {
      const word = match[0]
      if (/^\d+$/.test(word)) continue
      if (sp.correct(word)) continue
      misspellings.push({
        word,
        from: match.index,
        to: match.index + word.length,
        suggestions: sp.suggest(word),
      })
    }

    return NextResponse.json(misspellings, { status: 200 })
  } catch (err) {
    console.error('Spell-check error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}