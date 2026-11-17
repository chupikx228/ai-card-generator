const SIMILARITY_LIMIT = 0.6

const toWords = (text: string): Set<string> => new Set(text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [])

const isSimilar = (left: Set<string>, right: Set<string>): boolean => {
  const common = [...left].filter((word) => right.has(word)).length
  const union = left.size + right.size - common
  return union === 0 || common / union >= SIMILARITY_LIMIT
}

export const pickDistinct = <T extends { question: string }>(candidates: T[], existing: string[]): T | undefined => {
  const taken = existing.map(toWords)
  return candidates.find((candidate) => {
    const words = toWords(candidate.question)
    return !taken.some((other) => isSimilar(other, words))
  })
}
