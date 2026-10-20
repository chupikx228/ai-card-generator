import bcrypt from 'bcryptjs';
import { GraphQLError } from 'graphql';
import { isValidObjectId } from 'mongoose';
import { createToken } from './auth.ts';
import { DeckModel, type DeckDocument, UserModel, type UserDocument } from './db.ts';

export type Context = {
  user: UserDocument | null;
};

type DeckMode = 'flip' | 'qa' | 'truefalse';

type CardInput = {
  front?: string | null;
  back?: string | null;
  statement?: string | null;
  isTrue?: boolean | null;
};

type RegisterArgs = { name: string; email: string; password: string };
type LoginArgs = { email: string; password: string };
type IdArgs = { id: string };
type CreateDeckArgs = {
  title: string;
  mode: DeckMode;
  language: 'uk' | 'en';
  topic?: string | null;
  cards: CardInput[];
};

const PASSWORD_MIN_LENGTH = 6;
const SALT_ROUNDS = 10;

const badInput = (message: string): GraphQLError =>
  new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } });

const requireUser = (context: Context): UserDocument => {
  if (!context.user) {
    throw new GraphQLError('Потрібна авторизація.', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  return context.user;
};

const isFilled = (value: string | null | undefined): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const cardMatchesMode = (card: CardInput, mode: DeckMode): boolean =>
  mode === 'truefalse' ? isFilled(card.statement) && typeof card.isTrue === 'boolean' : isFilled(card.front) && isFilled(card.back);

const toCardRecord = (card: CardInput, mode: DeckMode): CardInput =>
  mode === 'truefalse' ? { statement: card.statement, isTrue: card.isTrue } : { front: card.front, back: card.back };

const authPayload = (user: UserDocument) => ({ token: createToken(user), user });

export const resolvers = {
  Query: {
    users: () => UserModel.find().sort({ createdAt: 1 }).exec(),
    me: (_parent: unknown, _args: unknown, context: Context) => context.user,
    decks: () => DeckModel.find({ ownerId: { $exists: true } }).sort({ createdAt: -1 }).exec(),
    deck: (_parent: unknown, args: IdArgs) =>
      isValidObjectId(args.id) ? DeckModel.findOne({ _id: args.id, ownerId: { $exists: true } }).exec() : null,
  },

  Mutation: {
    register: async (_parent: unknown, args: RegisterArgs) => {
      const name = args.name.trim();
      const email = args.email.trim().toLowerCase();
      if (!name || !email) {
        throw badInput("Ім'я та email обов'язкові.");
      }
      if (args.password.length < PASSWORD_MIN_LENGTH) {
        throw badInput(`Пароль має містити щонайменше ${PASSWORD_MIN_LENGTH} символів.`);
      }
      if (await UserModel.exists({ email })) {
        throw badInput('Користувач з таким email вже існує.');
      }
      const passwordHash = await bcrypt.hash(args.password, SALT_ROUNDS);
      const user = await UserModel.create({ name, email, passwordHash });
      return authPayload(user);
    },

    login: async (_parent: unknown, args: LoginArgs) => {
      const user = await UserModel.findOne({ email: args.email.trim().toLowerCase() }).exec();
      if (!user || !(await bcrypt.compare(args.password, user.passwordHash))) {
        throw badInput('Невірний email або пароль.');
      }
      return authPayload(user);
    },

    createDeck: async (_parent: unknown, args: CreateDeckArgs, context: Context) => {
      const user = requireUser(context);
      if (!isFilled(args.title)) {
        throw badInput("Назва колоди обов'язкова.");
      }
      if (args.cards.length === 0 || !args.cards.every((card) => cardMatchesMode(card, args.mode))) {
        throw badInput('Картки мають відповідати режиму колоди і не можуть бути порожніми.');
      }
      return DeckModel.create({
        title: args.title,
        mode: args.mode,
        language: args.language,
        topic: isFilled(args.topic) ? args.topic : null,
        cards: args.cards.map((card) => toCardRecord(card, args.mode)),
        ownerId: user._id,
      });
    },

    deleteDeck: async (_parent: unknown, args: IdArgs, context: Context) => {
      const user = requireUser(context);
      if (!isValidObjectId(args.id)) {
        return false;
      }
      const deleted = await DeckModel.findOneAndDelete({ _id: args.id, ownerId: user._id }).exec();
      return deleted !== null;
    },
  },

  User: {
    decks: (user: UserDocument) => DeckModel.find({ ownerId: user._id }).sort({ createdAt: -1 }).exec(),
  },

  Deck: {
    cardCount: (deck: DeckDocument) => deck.cards.length,
    owner: (deck: DeckDocument) => UserModel.findById(deck.ownerId).exec(),
    createdAt: (deck: DeckDocument) => deck.createdAt.toISOString(),
  },
};
