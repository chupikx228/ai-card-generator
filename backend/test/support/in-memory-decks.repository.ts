import type { Deck, DecksRepository, NewDeck } from '../../src/decks/interfaces';

export class InMemoryDecksRepository implements DecksRepository {
  private readonly decks = new Map<string, Deck>();
  private sequence = 0;

  async findAll(): Promise<Deck[]> {
    return [...this.decks.values()].reverse();
  }

  async findById(id: string): Promise<Deck | null> {
    return this.decks.get(id) ?? null;
  }

  async create(deck: NewDeck): Promise<Deck> {
    const now = new Date();
    const stored = this.toDeck(this.nextId(), deck, now, now);
    this.decks.set(stored.id, stored);
    return stored;
  }

  async replace(id: string, deck: NewDeck): Promise<Deck | null> {
    const existing = this.decks.get(id);
    if (existing === undefined) {
      return null;
    }
    const stored = this.toDeck(id, deck, existing.createdAt, new Date());
    this.decks.set(id, stored);
    return stored;
  }

  async delete(id: string): Promise<boolean> {
    return this.decks.delete(id);
  }

  private nextId(): string {
    this.sequence += 1;
    return this.sequence.toString(16).padStart(24, '0');
  }

  private toDeck(id: string, deck: NewDeck, createdAt: Date, updatedAt: Date): Deck {
    const meta = { id, createdAt, updatedAt };
    if (deck.mode === 'truefalse') {
      return { ...deck, ...meta, cards: deck.cards.map((card) => ({ id: this.nextId(), ...card })) };
    }
    return { ...deck, ...meta, cards: deck.cards.map((card) => ({ id: this.nextId(), ...card })) };
  }
}
