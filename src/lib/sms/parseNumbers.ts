const VALID = /^\+?\d{7,15}$/

export function parseNumbers(raw: string) {
  const tokens = raw
    .split(/[\s,;]+/)
    .map((t) => t.replace(/[()-]/g, ''))
    .filter(Boolean)

  const seen = new Set<string>()
  const valid: string[] = []
  const invalid: string[] = []
  let duplicates = 0

  for (const t of tokens) {
    if (!VALID.test(t)) {
      invalid.push(t)
    } else if (seen.has(t)) {
      duplicates++
    } else {
      seen.add(t)
      valid.push(t)
    }
  }
  return { valid, invalid, duplicates }
}
