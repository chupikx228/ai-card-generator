export type ClassValue = string | number | false | null | undefined

export const cn = (...values: ClassValue[]): string =>
  values.filter((value): value is string | number => Boolean(value)).join(' ')
