export type Rating = 'again' | 'hard' | 'good' | 'easy'

export type Card = {
  id: string
  front: string
  back: string
}

export type TrueFalseCard = {
  id: string
  statement: string
  isTrue: boolean
}
