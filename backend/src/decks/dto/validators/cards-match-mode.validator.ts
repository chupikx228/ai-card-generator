import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';
import { DECK_LIMITS, DECK_MODES, type DeckMode } from '../../interfaces';
import { isStatementCardInput, isTextCardInput } from '../card-input';

const CARD_GUARD_BY_MODE: Record<DeckMode, (value: unknown) => boolean> = {
  flip: isTextCardInput,
  qa: isTextCardInput,
  truefalse: isStatementCardInput,
};

const CARD_SHAPE_BY_MODE: Record<DeckMode, string> = {
  flip: '{ front: string, back: string }',
  qa: '{ front: string, back: string }',
  truefalse: '{ statement: string, isTrue: boolean }',
};

const readMode = (object: object): DeckMode | null => {
  const mode: unknown = Reflect.get(object, 'mode');
  return DECK_MODES.find((candidate) => candidate === mode) ?? null;
};

@ValidatorConstraint({ name: 'cardsMatchMode' })
class CardsMatchModeConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const mode = readMode(args.object);
    if (mode === null || !Array.isArray(value)) {
      return true;
    }
    return value.every(CARD_GUARD_BY_MODE[mode]);
  }

  defaultMessage(args: ValidationArguments): string {
    const mode = readMode(args.object);
    if (mode === null || !Array.isArray(args.value)) {
      return `${args.property} must match the deck mode`;
    }
    const index = args.value.findIndex((card: unknown) => !CARD_GUARD_BY_MODE[mode](card));
    return `${args.property}.${index} must be ${CARD_SHAPE_BY_MODE[mode]} with text of 1-${DECK_LIMITS.cardTextMaxLength} characters and no other fields`;
  }
}

export const CardsMatchMode =
  (options?: ValidationOptions): PropertyDecorator =>
  (target: object, propertyName: string | symbol): void => {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName.toString(),
      options,
      validator: CardsMatchModeConstraint,
    });
  };
