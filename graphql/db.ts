import mongoose, { type HydratedDocument, type InferSchemaType } from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    passwordHash: { type: String, required: true },
  },
  { collection: 'users', timestamps: true },
);

const cardSchema = new mongoose.Schema({
  front: { type: String, trim: true },
  back: { type: String, trim: true },
  statement: { type: String, trim: true },
  isTrue: { type: Boolean },
});

const deckSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    mode: { type: String, required: true, enum: ['flip', 'qa', 'truefalse'] },
    language: { type: String, required: true, enum: ['uk', 'en'] },
    topic: { type: String, trim: true, default: null },
    cards: { type: [cardSchema], required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { collection: 'decks', timestamps: true },
);

export type UserDocument = HydratedDocument<InferSchemaType<typeof userSchema>>;
export type DeckDocument = HydratedDocument<InferSchemaType<typeof deckSchema>>;

export const UserModel = mongoose.model('User', userSchema);
export const DeckModel = mongoose.model('Deck', deckSchema);

export const connectDB = async (uri: string): Promise<void> => {
  await mongoose.connect(uri);
  console.log('Підключено до MongoDB');
};
