type CardsHeaderProps = {
  total: number
  learned: number
}

export const CardsHeader = ({ total, learned }: CardsHeaderProps) => (
  <header className="text-center">
    <h1 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">Мої картки</h1>
    <p className="mt-2 mb-6 text-[15px] text-muted">
      Усього карток: {total} · Вивчено: {learned}
    </p>
  </header>
)
