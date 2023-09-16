import { None, Nullable } from 'types';

export const isSome = <T>(value: Nullable<T>): value is T =>
  value !== null && value !== undefined;

export const isNone = <T>(value: Nullable<T>): value is None =>
  value === null || value === undefined;
