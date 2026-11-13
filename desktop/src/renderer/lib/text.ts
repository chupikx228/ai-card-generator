export const cn = (...classes: Array<string | false | null | undefined>): string => classes.filter(Boolean).join(' ')

export const pluralCards = (count: number): string => {
  const mod10 = count % 10
  const mod100 = count % 100
  const value = count.toLocaleString('uk-UA')
  if (mod10 === 1 && mod100 !== 11) {
    return `${value} картка`
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${value} картки`
  }
  return `${value} карток`
}
