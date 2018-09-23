
import {Entity, EntityState} from '../types';

export function nullEntity<T>(): {state: EntityState.Null} {
  return {state: EntityState.Null};
}

export function thunkEntity<T>(id: string): {state: EntityState.Thunk, id: string} {
  return {state: EntityState.Thunk, id};
}

export function loadingEntity<T>(id: string): {state: EntityState.Loading, id: string} {
  return {state: EntityState.Loading, id};
}

export function loadedEntity<T>(id: string, value: T): {state: EntityState.Loaded, id: string, value: T} {
  return {state: EntityState.Loaded, id, value};
}

export function reloadingEntity<T>(id: string, value: T): {state: EntityState.Reloading, id: string, value: T} {
  return {state: EntityState.Reloading, id, value};
}

export function errorEntity<T>(id: string): {state: EntityState.Error, id: string} {
  return {state: EntityState.Error, id};
}

export function updateEntity<T extends object>(entity: Entity<T>, value: T): Entity<T> {
  if ('value' in entity) {
    const newValue : T = Object.assign({}, entity.value, value);
    return {...entity, value: newValue};
  } else {
    return entity;
  }
}

export function withEntityValue<T, R>(entity: Entity<T>, func: (value: T) => R): R | undefined {
  if (entity.state !== EntityState.Loaded && entity.state !== EntityState.Reloading) {
    return undefined;
  }
  return func(entity.value);
}

export function projectEntity<T, R>(entity: Entity<T>, func: (value: T) => R): Entity<R> {
  switch (entity.state) {
    case EntityState.Null:
      return nullEntity();
    case EntityState.Thunk:
      return thunkEntity(entity.id);
    case EntityState.Loading:
      return loadingEntity(entity.id);
    case EntityState.Loaded:
      return {state: entity.state, id: entity.id, value: func(entity.value)};
    case EntityState.Reloading:
      return {state: entity.state, id: entity.id, value: func(entity.value)};
    case EntityState.Error:
      return errorEntity(entity.id);
  }
}
