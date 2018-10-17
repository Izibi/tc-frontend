
//  {state: EntityState.Thunk, id: string} |
//  {state: EntityState.Loading, id: string} |
//  {state: EntityState.Loaded, id: string, value: T} |
//  {state: EntityState.Reloading, id: string, value: T} |
//  {state: EntityState.Error, id: string}

export enum EntityState {
  Null,
  Thunk,
  Loading,
  Loaded,
  Reloading,
  Error
}

export interface Entity<T> {
  readonly state: EntityState,
  readonly id: string,
  readonly value: T,
  readonly hasId: boolean,
  readonly isLoading: boolean,
  readonly isLoaded: boolean,
  readonly isError: boolean,
  check: () => void,
  assign: (e: Entity<T>) => void,
}

class EntityImpl<T> implements Entity<T> {
  constructor() {
    this.state = EntityState.Null;
    this.hasId = false;
    this.isLoading = false;
    this.isLoaded = false;
    this.isError = false;
  }
  _id: string | undefined;
  _value: T | undefined;
  state: EntityState;
  get id(): string {
    if (this._id === undefined) {
      throw new Error("entity has no id");
    }
    return this._id;
  }
  get value(): T {
    if (this._value === undefined) {
      throw new Error("entity has no value");
    }
    return this._value;
  }
  isLoading: boolean;
  isLoaded: boolean;
  isError: boolean;
  hasId: boolean;
  check() {
    switch (this.state) {
      case EntityState.Null:
        assert(this._id === undefined && this._value === undefined &&
          !this.isLoading && !this.isLoaded && !this.isError && !this.hasId);
        break;
      case EntityState.Thunk:
        assert(this._id !== undefined && this._value === undefined &&
          !this.isLoading && !this.isLoaded && !this.isError && this.hasId);
        break;
      case EntityState.Loading:
        assert(this._id !== undefined && this._value === undefined &&
          this.isLoading && !this.isLoaded && !this.isError && this.hasId);
        break;
      case EntityState.Loaded:
        assert(this._id !== undefined && this._value !== undefined &&
          !this.isLoading && this.isLoaded && !this.isError && this.hasId);
        break;
      case EntityState.Reloading:
        assert(this._id !== undefined && this._value !== undefined &&
          this.isLoading && this.isLoaded && !this.isError && this.hasId);
        break;
      case EntityState.Error:
        assert(this._id !== undefined && this._value === undefined &&
          !this.isLoading && !this.isLoaded && this.isError && this.hasId);
        break;
      default:
        assert(false);
    }
  }
  assign(e: Entity<T>) {
    e.check();
    this.state = e.state;
    this._id = e.hasId ? e.id : undefined;
    this._value = e.isLoaded ? e.value : undefined;
    this.hasId = e.hasId;
    this.isLoading = e.isLoading;
    this.isLoaded = e.isLoaded;
    this.isError = e.isError;
    this.check();
  }
}

function assert(cond: boolean) {
  if (!cond) { throw new Error("assertion failed"); }
}

export function nullEntity<T>(): Entity<T> {
  return new EntityImpl<T>();
}

export function thunkEntity<T>(id: string): Entity<T> {
  var e = new EntityImpl<T>();
  e.state = EntityState.Thunk;
  if (id === undefined) {
    throw new Error("thunk entity must have a valid id");
  }
  e._id = id;
  e.hasId = true;
  e.check();
  return e;
}

export function loadingEntity<T>(id: string): Entity<T> {
  var e = new EntityImpl<T>();
  e.state = EntityState.Loading;
  e._id = id;
  e.hasId = true;
  e.isLoading = true;
  e.check();
  return e;
}

export function loadedEntity<T>(id: string, value: T): Entity<T> {
  var e = new EntityImpl<T>();
  e.state = EntityState.Loaded;
  e._id = id;
  e.hasId = true;
  e._value = value;
  e.isLoaded = true;
  e.check();
  return e;
}

export function reloadingEntity<T>(id: string, value: T): Entity<T> {
  var e = new EntityImpl<T>();
  e.state = EntityState.Reloading;
  e._id = id;
  e.hasId = true;
  e._value = value;
  e.isLoaded = true;
  e.isLoading = true;
  e.check();
  return e;
}

export function errorEntity<T>(id: string): Entity<T> {
  var e = new EntityImpl<T>();
  e.state = EntityState.Error;
  e._id = id;
  e.hasId = true;
  e.isError = true;
  e.check();
  return e;
}

export function modifiedEntity<T extends object>(entity: Entity<T>, value: T): Entity<T> {
  switch (entity.state) {
    case EntityState.Null:
      return nullEntity();
    case EntityState.Thunk:
      return thunkEntity(entity.id);
    case EntityState.Loading:
      return loadingEntity(entity.id);
    case EntityState.Loaded:
      return loadedEntity(entity.id, value);
    case EntityState.Reloading:
      return reloadingEntity(entity.id, value);
    case EntityState.Error:
      return errorEntity(entity.id);
  }
}

export function withEntityValue<T, R>(entity: Entity<T>, func: (value: T) => R): R | undefined {
  return entity.isLoaded ? func(entity.value) : undefined;
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
      return loadedEntity(entity.id, func(entity.value));
    case EntityState.Reloading:
      return reloadingEntity(entity.id, func(entity.value));
    case EntityState.Error:
      return errorEntity(entity.id);
  }
}
