
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Customer
 * 
 */
export type Customer = $Result.DefaultSelection<Prisma.$CustomerPayload>
/**
 * Model DailyBook
 * 
 */
export type DailyBook = $Result.DefaultSelection<Prisma.$DailyBookPayload>
/**
 * Model DailyBookItem
 * 
 */
export type DailyBookItem = $Result.DefaultSelection<Prisma.$DailyBookItemPayload>
/**
 * Model Ledger
 * 
 */
export type Ledger = $Result.DefaultSelection<Prisma.$LedgerPayload>
/**
 * Model AdminSession
 * 
 */
export type AdminSession = $Result.DefaultSelection<Prisma.$AdminSessionPayload>
/**
 * Model AuditLog
 * 
 */
export type AuditLog = $Result.DefaultSelection<Prisma.$AuditLogPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Role: {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER'
};

export type Role = (typeof Role)[keyof typeof Role]


export const LedgerType: {
  PRODUCT: 'PRODUCT',
  PAYMENT: 'PAYMENT',
  ADJUSTMENT: 'ADJUSTMENT'
};

export type LedgerType = (typeof LedgerType)[keyof typeof LedgerType]

}

export type Role = $Enums.Role

export const Role: typeof $Enums.Role

export type LedgerType = $Enums.LedgerType

export const LedgerType: typeof $Enums.LedgerType

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.customer`: Exposes CRUD operations for the **Customer** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Customers
    * const customers = await prisma.customer.findMany()
    * ```
    */
  get customer(): Prisma.CustomerDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.dailyBook`: Exposes CRUD operations for the **DailyBook** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DailyBooks
    * const dailyBooks = await prisma.dailyBook.findMany()
    * ```
    */
  get dailyBook(): Prisma.DailyBookDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.dailyBookItem`: Exposes CRUD operations for the **DailyBookItem** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DailyBookItems
    * const dailyBookItems = await prisma.dailyBookItem.findMany()
    * ```
    */
  get dailyBookItem(): Prisma.DailyBookItemDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ledger`: Exposes CRUD operations for the **Ledger** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ledgers
    * const ledgers = await prisma.ledger.findMany()
    * ```
    */
  get ledger(): Prisma.LedgerDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.adminSession`: Exposes CRUD operations for the **AdminSession** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AdminSessions
    * const adminSessions = await prisma.adminSession.findMany()
    * ```
    */
  get adminSession(): Prisma.AdminSessionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.auditLog`: Exposes CRUD operations for the **AuditLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AuditLogs
    * const auditLogs = await prisma.auditLog.findMany()
    * ```
    */
  get auditLog(): Prisma.AuditLogDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.2.0
   * Query Engine version: 0c8ef2ce45c83248ab3df073180d5eda9e8be7a3
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Customer: 'Customer',
    DailyBook: 'DailyBook',
    DailyBookItem: 'DailyBookItem',
    Ledger: 'Ledger',
    AdminSession: 'AdminSession',
    AuditLog: 'AuditLog'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "customer" | "dailyBook" | "dailyBookItem" | "ledger" | "adminSession" | "auditLog"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Customer: {
        payload: Prisma.$CustomerPayload<ExtArgs>
        fields: Prisma.CustomerFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CustomerFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CustomerFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          findFirst: {
            args: Prisma.CustomerFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CustomerFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          findMany: {
            args: Prisma.CustomerFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>[]
          }
          create: {
            args: Prisma.CustomerCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          createMany: {
            args: Prisma.CustomerCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CustomerCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>[]
          }
          delete: {
            args: Prisma.CustomerDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          update: {
            args: Prisma.CustomerUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          deleteMany: {
            args: Prisma.CustomerDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CustomerUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CustomerUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>[]
          }
          upsert: {
            args: Prisma.CustomerUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          aggregate: {
            args: Prisma.CustomerAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCustomer>
          }
          groupBy: {
            args: Prisma.CustomerGroupByArgs<ExtArgs>
            result: $Utils.Optional<CustomerGroupByOutputType>[]
          }
          count: {
            args: Prisma.CustomerCountArgs<ExtArgs>
            result: $Utils.Optional<CustomerCountAggregateOutputType> | number
          }
        }
      }
      DailyBook: {
        payload: Prisma.$DailyBookPayload<ExtArgs>
        fields: Prisma.DailyBookFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DailyBookFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyBookPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DailyBookFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyBookPayload>
          }
          findFirst: {
            args: Prisma.DailyBookFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyBookPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DailyBookFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyBookPayload>
          }
          findMany: {
            args: Prisma.DailyBookFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyBookPayload>[]
          }
          create: {
            args: Prisma.DailyBookCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyBookPayload>
          }
          createMany: {
            args: Prisma.DailyBookCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DailyBookCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyBookPayload>[]
          }
          delete: {
            args: Prisma.DailyBookDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyBookPayload>
          }
          update: {
            args: Prisma.DailyBookUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyBookPayload>
          }
          deleteMany: {
            args: Prisma.DailyBookDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DailyBookUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DailyBookUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyBookPayload>[]
          }
          upsert: {
            args: Prisma.DailyBookUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyBookPayload>
          }
          aggregate: {
            args: Prisma.DailyBookAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDailyBook>
          }
          groupBy: {
            args: Prisma.DailyBookGroupByArgs<ExtArgs>
            result: $Utils.Optional<DailyBookGroupByOutputType>[]
          }
          count: {
            args: Prisma.DailyBookCountArgs<ExtArgs>
            result: $Utils.Optional<DailyBookCountAggregateOutputType> | number
          }
        }
      }
      DailyBookItem: {
        payload: Prisma.$DailyBookItemPayload<ExtArgs>
        fields: Prisma.DailyBookItemFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DailyBookItemFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyBookItemPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DailyBookItemFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyBookItemPayload>
          }
          findFirst: {
            args: Prisma.DailyBookItemFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyBookItemPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DailyBookItemFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyBookItemPayload>
          }
          findMany: {
            args: Prisma.DailyBookItemFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyBookItemPayload>[]
          }
          create: {
            args: Prisma.DailyBookItemCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyBookItemPayload>
          }
          createMany: {
            args: Prisma.DailyBookItemCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DailyBookItemCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyBookItemPayload>[]
          }
          delete: {
            args: Prisma.DailyBookItemDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyBookItemPayload>
          }
          update: {
            args: Prisma.DailyBookItemUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyBookItemPayload>
          }
          deleteMany: {
            args: Prisma.DailyBookItemDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DailyBookItemUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DailyBookItemUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyBookItemPayload>[]
          }
          upsert: {
            args: Prisma.DailyBookItemUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyBookItemPayload>
          }
          aggregate: {
            args: Prisma.DailyBookItemAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDailyBookItem>
          }
          groupBy: {
            args: Prisma.DailyBookItemGroupByArgs<ExtArgs>
            result: $Utils.Optional<DailyBookItemGroupByOutputType>[]
          }
          count: {
            args: Prisma.DailyBookItemCountArgs<ExtArgs>
            result: $Utils.Optional<DailyBookItemCountAggregateOutputType> | number
          }
        }
      }
      Ledger: {
        payload: Prisma.$LedgerPayload<ExtArgs>
        fields: Prisma.LedgerFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LedgerFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LedgerPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LedgerFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LedgerPayload>
          }
          findFirst: {
            args: Prisma.LedgerFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LedgerPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LedgerFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LedgerPayload>
          }
          findMany: {
            args: Prisma.LedgerFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LedgerPayload>[]
          }
          create: {
            args: Prisma.LedgerCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LedgerPayload>
          }
          createMany: {
            args: Prisma.LedgerCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LedgerCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LedgerPayload>[]
          }
          delete: {
            args: Prisma.LedgerDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LedgerPayload>
          }
          update: {
            args: Prisma.LedgerUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LedgerPayload>
          }
          deleteMany: {
            args: Prisma.LedgerDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LedgerUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.LedgerUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LedgerPayload>[]
          }
          upsert: {
            args: Prisma.LedgerUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LedgerPayload>
          }
          aggregate: {
            args: Prisma.LedgerAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLedger>
          }
          groupBy: {
            args: Prisma.LedgerGroupByArgs<ExtArgs>
            result: $Utils.Optional<LedgerGroupByOutputType>[]
          }
          count: {
            args: Prisma.LedgerCountArgs<ExtArgs>
            result: $Utils.Optional<LedgerCountAggregateOutputType> | number
          }
        }
      }
      AdminSession: {
        payload: Prisma.$AdminSessionPayload<ExtArgs>
        fields: Prisma.AdminSessionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AdminSessionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminSessionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AdminSessionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminSessionPayload>
          }
          findFirst: {
            args: Prisma.AdminSessionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminSessionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AdminSessionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminSessionPayload>
          }
          findMany: {
            args: Prisma.AdminSessionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminSessionPayload>[]
          }
          create: {
            args: Prisma.AdminSessionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminSessionPayload>
          }
          createMany: {
            args: Prisma.AdminSessionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AdminSessionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminSessionPayload>[]
          }
          delete: {
            args: Prisma.AdminSessionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminSessionPayload>
          }
          update: {
            args: Prisma.AdminSessionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminSessionPayload>
          }
          deleteMany: {
            args: Prisma.AdminSessionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AdminSessionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AdminSessionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminSessionPayload>[]
          }
          upsert: {
            args: Prisma.AdminSessionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminSessionPayload>
          }
          aggregate: {
            args: Prisma.AdminSessionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAdminSession>
          }
          groupBy: {
            args: Prisma.AdminSessionGroupByArgs<ExtArgs>
            result: $Utils.Optional<AdminSessionGroupByOutputType>[]
          }
          count: {
            args: Prisma.AdminSessionCountArgs<ExtArgs>
            result: $Utils.Optional<AdminSessionCountAggregateOutputType> | number
          }
        }
      }
      AuditLog: {
        payload: Prisma.$AuditLogPayload<ExtArgs>
        fields: Prisma.AuditLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AuditLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AuditLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          findFirst: {
            args: Prisma.AuditLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AuditLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          findMany: {
            args: Prisma.AuditLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[]
          }
          create: {
            args: Prisma.AuditLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          createMany: {
            args: Prisma.AuditLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AuditLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[]
          }
          delete: {
            args: Prisma.AuditLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          update: {
            args: Prisma.AuditLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          deleteMany: {
            args: Prisma.AuditLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AuditLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AuditLogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[]
          }
          upsert: {
            args: Prisma.AuditLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          aggregate: {
            args: Prisma.AuditLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAuditLog>
          }
          groupBy: {
            args: Prisma.AuditLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<AuditLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.AuditLogCountArgs<ExtArgs>
            result: $Utils.Optional<AuditLogCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    customer?: CustomerOmit
    dailyBook?: DailyBookOmit
    dailyBookItem?: DailyBookItemOmit
    ledger?: LedgerOmit
    adminSession?: AdminSessionOmit
    auditLog?: AuditLogOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type CustomerCountOutputType
   */

  export type CustomerCountOutputType = {
    daily_items: number
    ledger_items: number
  }

  export type CustomerCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    daily_items?: boolean | CustomerCountOutputTypeCountDaily_itemsArgs
    ledger_items?: boolean | CustomerCountOutputTypeCountLedger_itemsArgs
  }

  // Custom InputTypes
  /**
   * CustomerCountOutputType without action
   */
  export type CustomerCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerCountOutputType
     */
    select?: CustomerCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CustomerCountOutputType without action
   */
  export type CustomerCountOutputTypeCountDaily_itemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DailyBookItemWhereInput
  }

  /**
   * CustomerCountOutputType without action
   */
  export type CustomerCountOutputTypeCountLedger_itemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LedgerWhereInput
  }


  /**
   * Count Type DailyBookCountOutputType
   */

  export type DailyBookCountOutputType = {
    items: number
  }

  export type DailyBookCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    items?: boolean | DailyBookCountOutputTypeCountItemsArgs
  }

  // Custom InputTypes
  /**
   * DailyBookCountOutputType without action
   */
  export type DailyBookCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyBookCountOutputType
     */
    select?: DailyBookCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * DailyBookCountOutputType without action
   */
  export type DailyBookCountOutputTypeCountItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DailyBookItemWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    username: string | null
    name: string | null
    password: string | null
    role: $Enums.Role | null
    is_active: boolean | null
    gender: string | null
    phone: string | null
    avatar_url: string | null
    created_at: Date | null
    updated_at: Date | null
    deleted_at: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    username: string | null
    name: string | null
    password: string | null
    role: $Enums.Role | null
    is_active: boolean | null
    gender: string | null
    phone: string | null
    avatar_url: string | null
    created_at: Date | null
    updated_at: Date | null
    deleted_at: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    username: number
    name: number
    password: number
    role: number
    is_active: number
    gender: number
    phone: number
    avatar_url: number
    assigned_customer_ids: number
    created_at: number
    updated_at: number
    deleted_at: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    username?: true
    name?: true
    password?: true
    role?: true
    is_active?: true
    gender?: true
    phone?: true
    avatar_url?: true
    created_at?: true
    updated_at?: true
    deleted_at?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    username?: true
    name?: true
    password?: true
    role?: true
    is_active?: true
    gender?: true
    phone?: true
    avatar_url?: true
    created_at?: true
    updated_at?: true
    deleted_at?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    username?: true
    name?: true
    password?: true
    role?: true
    is_active?: true
    gender?: true
    phone?: true
    avatar_url?: true
    assigned_customer_ids?: true
    created_at?: true
    updated_at?: true
    deleted_at?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    username: string
    name: string | null
    password: string
    role: $Enums.Role
    is_active: boolean
    gender: string | null
    phone: string | null
    avatar_url: string | null
    assigned_customer_ids: string[]
    created_at: Date
    updated_at: Date
    deleted_at: Date | null
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    username?: boolean
    name?: boolean
    password?: boolean
    role?: boolean
    is_active?: boolean
    gender?: boolean
    phone?: boolean
    avatar_url?: boolean
    assigned_customer_ids?: boolean
    created_at?: boolean
    updated_at?: boolean
    deleted_at?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    username?: boolean
    name?: boolean
    password?: boolean
    role?: boolean
    is_active?: boolean
    gender?: boolean
    phone?: boolean
    avatar_url?: boolean
    assigned_customer_ids?: boolean
    created_at?: boolean
    updated_at?: boolean
    deleted_at?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    username?: boolean
    name?: boolean
    password?: boolean
    role?: boolean
    is_active?: boolean
    gender?: boolean
    phone?: boolean
    avatar_url?: boolean
    assigned_customer_ids?: boolean
    created_at?: boolean
    updated_at?: boolean
    deleted_at?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    username?: boolean
    name?: boolean
    password?: boolean
    role?: boolean
    is_active?: boolean
    gender?: boolean
    phone?: boolean
    avatar_url?: boolean
    assigned_customer_ids?: boolean
    created_at?: boolean
    updated_at?: boolean
    deleted_at?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "username" | "name" | "password" | "role" | "is_active" | "gender" | "phone" | "avatar_url" | "assigned_customer_ids" | "created_at" | "updated_at" | "deleted_at", ExtArgs["result"]["user"]>

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      username: string
      name: string | null
      password: string
      role: $Enums.Role
      is_active: boolean
      gender: string | null
      phone: string | null
      avatar_url: string | null
      assigned_customer_ids: string[]
      created_at: Date
      updated_at: Date
      deleted_at: Date | null
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly username: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'Role'>
    readonly is_active: FieldRef<"User", 'Boolean'>
    readonly gender: FieldRef<"User", 'String'>
    readonly phone: FieldRef<"User", 'String'>
    readonly avatar_url: FieldRef<"User", 'String'>
    readonly assigned_customer_ids: FieldRef<"User", 'String[]'>
    readonly created_at: FieldRef<"User", 'DateTime'>
    readonly updated_at: FieldRef<"User", 'DateTime'>
    readonly deleted_at: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
  }


  /**
   * Model Customer
   */

  export type AggregateCustomer = {
    _count: CustomerCountAggregateOutputType | null
    _min: CustomerMinAggregateOutputType | null
    _max: CustomerMaxAggregateOutputType | null
  }

  export type CustomerMinAggregateOutputType = {
    id: string | null
    customer_code: string | null
    name: string | null
    avatar_url: string | null
    created_at: Date | null
    deleted_at: Date | null
  }

  export type CustomerMaxAggregateOutputType = {
    id: string | null
    customer_code: string | null
    name: string | null
    avatar_url: string | null
    created_at: Date | null
    deleted_at: Date | null
  }

  export type CustomerCountAggregateOutputType = {
    id: number
    customer_code: number
    name: number
    avatar_url: number
    created_at: number
    deleted_at: number
    _all: number
  }


  export type CustomerMinAggregateInputType = {
    id?: true
    customer_code?: true
    name?: true
    avatar_url?: true
    created_at?: true
    deleted_at?: true
  }

  export type CustomerMaxAggregateInputType = {
    id?: true
    customer_code?: true
    name?: true
    avatar_url?: true
    created_at?: true
    deleted_at?: true
  }

  export type CustomerCountAggregateInputType = {
    id?: true
    customer_code?: true
    name?: true
    avatar_url?: true
    created_at?: true
    deleted_at?: true
    _all?: true
  }

  export type CustomerAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Customer to aggregate.
     */
    where?: CustomerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Customers to fetch.
     */
    orderBy?: CustomerOrderByWithRelationInput | CustomerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CustomerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Customers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Customers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Customers
    **/
    _count?: true | CustomerCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CustomerMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CustomerMaxAggregateInputType
  }

  export type GetCustomerAggregateType<T extends CustomerAggregateArgs> = {
        [P in keyof T & keyof AggregateCustomer]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCustomer[P]>
      : GetScalarType<T[P], AggregateCustomer[P]>
  }




  export type CustomerGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CustomerWhereInput
    orderBy?: CustomerOrderByWithAggregationInput | CustomerOrderByWithAggregationInput[]
    by: CustomerScalarFieldEnum[] | CustomerScalarFieldEnum
    having?: CustomerScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CustomerCountAggregateInputType | true
    _min?: CustomerMinAggregateInputType
    _max?: CustomerMaxAggregateInputType
  }

  export type CustomerGroupByOutputType = {
    id: string
    customer_code: string
    name: string
    avatar_url: string | null
    created_at: Date
    deleted_at: Date | null
    _count: CustomerCountAggregateOutputType | null
    _min: CustomerMinAggregateOutputType | null
    _max: CustomerMaxAggregateOutputType | null
  }

  type GetCustomerGroupByPayload<T extends CustomerGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CustomerGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CustomerGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CustomerGroupByOutputType[P]>
            : GetScalarType<T[P], CustomerGroupByOutputType[P]>
        }
      >
    >


  export type CustomerSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    customer_code?: boolean
    name?: boolean
    avatar_url?: boolean
    created_at?: boolean
    deleted_at?: boolean
    daily_items?: boolean | Customer$daily_itemsArgs<ExtArgs>
    ledger_items?: boolean | Customer$ledger_itemsArgs<ExtArgs>
    _count?: boolean | CustomerCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["customer"]>

  export type CustomerSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    customer_code?: boolean
    name?: boolean
    avatar_url?: boolean
    created_at?: boolean
    deleted_at?: boolean
  }, ExtArgs["result"]["customer"]>

  export type CustomerSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    customer_code?: boolean
    name?: boolean
    avatar_url?: boolean
    created_at?: boolean
    deleted_at?: boolean
  }, ExtArgs["result"]["customer"]>

  export type CustomerSelectScalar = {
    id?: boolean
    customer_code?: boolean
    name?: boolean
    avatar_url?: boolean
    created_at?: boolean
    deleted_at?: boolean
  }

  export type CustomerOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "customer_code" | "name" | "avatar_url" | "created_at" | "deleted_at", ExtArgs["result"]["customer"]>
  export type CustomerInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    daily_items?: boolean | Customer$daily_itemsArgs<ExtArgs>
    ledger_items?: boolean | Customer$ledger_itemsArgs<ExtArgs>
    _count?: boolean | CustomerCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CustomerIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type CustomerIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CustomerPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Customer"
    objects: {
      daily_items: Prisma.$DailyBookItemPayload<ExtArgs>[]
      ledger_items: Prisma.$LedgerPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      customer_code: string
      name: string
      avatar_url: string | null
      created_at: Date
      deleted_at: Date | null
    }, ExtArgs["result"]["customer"]>
    composites: {}
  }

  type CustomerGetPayload<S extends boolean | null | undefined | CustomerDefaultArgs> = $Result.GetResult<Prisma.$CustomerPayload, S>

  type CustomerCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CustomerFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CustomerCountAggregateInputType | true
    }

  export interface CustomerDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Customer'], meta: { name: 'Customer' } }
    /**
     * Find zero or one Customer that matches the filter.
     * @param {CustomerFindUniqueArgs} args - Arguments to find a Customer
     * @example
     * // Get one Customer
     * const customer = await prisma.customer.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CustomerFindUniqueArgs>(args: SelectSubset<T, CustomerFindUniqueArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Customer that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CustomerFindUniqueOrThrowArgs} args - Arguments to find a Customer
     * @example
     * // Get one Customer
     * const customer = await prisma.customer.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CustomerFindUniqueOrThrowArgs>(args: SelectSubset<T, CustomerFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Customer that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerFindFirstArgs} args - Arguments to find a Customer
     * @example
     * // Get one Customer
     * const customer = await prisma.customer.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CustomerFindFirstArgs>(args?: SelectSubset<T, CustomerFindFirstArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Customer that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerFindFirstOrThrowArgs} args - Arguments to find a Customer
     * @example
     * // Get one Customer
     * const customer = await prisma.customer.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CustomerFindFirstOrThrowArgs>(args?: SelectSubset<T, CustomerFindFirstOrThrowArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Customers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Customers
     * const customers = await prisma.customer.findMany()
     * 
     * // Get first 10 Customers
     * const customers = await prisma.customer.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const customerWithIdOnly = await prisma.customer.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CustomerFindManyArgs>(args?: SelectSubset<T, CustomerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Customer.
     * @param {CustomerCreateArgs} args - Arguments to create a Customer.
     * @example
     * // Create one Customer
     * const Customer = await prisma.customer.create({
     *   data: {
     *     // ... data to create a Customer
     *   }
     * })
     * 
     */
    create<T extends CustomerCreateArgs>(args: SelectSubset<T, CustomerCreateArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Customers.
     * @param {CustomerCreateManyArgs} args - Arguments to create many Customers.
     * @example
     * // Create many Customers
     * const customer = await prisma.customer.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CustomerCreateManyArgs>(args?: SelectSubset<T, CustomerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Customers and returns the data saved in the database.
     * @param {CustomerCreateManyAndReturnArgs} args - Arguments to create many Customers.
     * @example
     * // Create many Customers
     * const customer = await prisma.customer.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Customers and only return the `id`
     * const customerWithIdOnly = await prisma.customer.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CustomerCreateManyAndReturnArgs>(args?: SelectSubset<T, CustomerCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Customer.
     * @param {CustomerDeleteArgs} args - Arguments to delete one Customer.
     * @example
     * // Delete one Customer
     * const Customer = await prisma.customer.delete({
     *   where: {
     *     // ... filter to delete one Customer
     *   }
     * })
     * 
     */
    delete<T extends CustomerDeleteArgs>(args: SelectSubset<T, CustomerDeleteArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Customer.
     * @param {CustomerUpdateArgs} args - Arguments to update one Customer.
     * @example
     * // Update one Customer
     * const customer = await prisma.customer.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CustomerUpdateArgs>(args: SelectSubset<T, CustomerUpdateArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Customers.
     * @param {CustomerDeleteManyArgs} args - Arguments to filter Customers to delete.
     * @example
     * // Delete a few Customers
     * const { count } = await prisma.customer.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CustomerDeleteManyArgs>(args?: SelectSubset<T, CustomerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Customers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Customers
     * const customer = await prisma.customer.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CustomerUpdateManyArgs>(args: SelectSubset<T, CustomerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Customers and returns the data updated in the database.
     * @param {CustomerUpdateManyAndReturnArgs} args - Arguments to update many Customers.
     * @example
     * // Update many Customers
     * const customer = await prisma.customer.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Customers and only return the `id`
     * const customerWithIdOnly = await prisma.customer.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CustomerUpdateManyAndReturnArgs>(args: SelectSubset<T, CustomerUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Customer.
     * @param {CustomerUpsertArgs} args - Arguments to update or create a Customer.
     * @example
     * // Update or create a Customer
     * const customer = await prisma.customer.upsert({
     *   create: {
     *     // ... data to create a Customer
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Customer we want to update
     *   }
     * })
     */
    upsert<T extends CustomerUpsertArgs>(args: SelectSubset<T, CustomerUpsertArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Customers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerCountArgs} args - Arguments to filter Customers to count.
     * @example
     * // Count the number of Customers
     * const count = await prisma.customer.count({
     *   where: {
     *     // ... the filter for the Customers we want to count
     *   }
     * })
    **/
    count<T extends CustomerCountArgs>(
      args?: Subset<T, CustomerCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CustomerCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Customer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CustomerAggregateArgs>(args: Subset<T, CustomerAggregateArgs>): Prisma.PrismaPromise<GetCustomerAggregateType<T>>

    /**
     * Group by Customer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CustomerGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CustomerGroupByArgs['orderBy'] }
        : { orderBy?: CustomerGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CustomerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCustomerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Customer model
   */
  readonly fields: CustomerFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Customer.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CustomerClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    daily_items<T extends Customer$daily_itemsArgs<ExtArgs> = {}>(args?: Subset<T, Customer$daily_itemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DailyBookItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    ledger_items<T extends Customer$ledger_itemsArgs<ExtArgs> = {}>(args?: Subset<T, Customer$ledger_itemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LedgerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Customer model
   */
  interface CustomerFieldRefs {
    readonly id: FieldRef<"Customer", 'String'>
    readonly customer_code: FieldRef<"Customer", 'String'>
    readonly name: FieldRef<"Customer", 'String'>
    readonly avatar_url: FieldRef<"Customer", 'String'>
    readonly created_at: FieldRef<"Customer", 'DateTime'>
    readonly deleted_at: FieldRef<"Customer", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Customer findUnique
   */
  export type CustomerFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter, which Customer to fetch.
     */
    where: CustomerWhereUniqueInput
  }

  /**
   * Customer findUniqueOrThrow
   */
  export type CustomerFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter, which Customer to fetch.
     */
    where: CustomerWhereUniqueInput
  }

  /**
   * Customer findFirst
   */
  export type CustomerFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter, which Customer to fetch.
     */
    where?: CustomerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Customers to fetch.
     */
    orderBy?: CustomerOrderByWithRelationInput | CustomerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Customers.
     */
    cursor?: CustomerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Customers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Customers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Customers.
     */
    distinct?: CustomerScalarFieldEnum | CustomerScalarFieldEnum[]
  }

  /**
   * Customer findFirstOrThrow
   */
  export type CustomerFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter, which Customer to fetch.
     */
    where?: CustomerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Customers to fetch.
     */
    orderBy?: CustomerOrderByWithRelationInput | CustomerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Customers.
     */
    cursor?: CustomerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Customers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Customers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Customers.
     */
    distinct?: CustomerScalarFieldEnum | CustomerScalarFieldEnum[]
  }

  /**
   * Customer findMany
   */
  export type CustomerFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter, which Customers to fetch.
     */
    where?: CustomerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Customers to fetch.
     */
    orderBy?: CustomerOrderByWithRelationInput | CustomerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Customers.
     */
    cursor?: CustomerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Customers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Customers.
     */
    skip?: number
    distinct?: CustomerScalarFieldEnum | CustomerScalarFieldEnum[]
  }

  /**
   * Customer create
   */
  export type CustomerCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * The data needed to create a Customer.
     */
    data: XOR<CustomerCreateInput, CustomerUncheckedCreateInput>
  }

  /**
   * Customer createMany
   */
  export type CustomerCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Customers.
     */
    data: CustomerCreateManyInput | CustomerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Customer createManyAndReturn
   */
  export type CustomerCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * The data used to create many Customers.
     */
    data: CustomerCreateManyInput | CustomerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Customer update
   */
  export type CustomerUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * The data needed to update a Customer.
     */
    data: XOR<CustomerUpdateInput, CustomerUncheckedUpdateInput>
    /**
     * Choose, which Customer to update.
     */
    where: CustomerWhereUniqueInput
  }

  /**
   * Customer updateMany
   */
  export type CustomerUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Customers.
     */
    data: XOR<CustomerUpdateManyMutationInput, CustomerUncheckedUpdateManyInput>
    /**
     * Filter which Customers to update
     */
    where?: CustomerWhereInput
    /**
     * Limit how many Customers to update.
     */
    limit?: number
  }

  /**
   * Customer updateManyAndReturn
   */
  export type CustomerUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * The data used to update Customers.
     */
    data: XOR<CustomerUpdateManyMutationInput, CustomerUncheckedUpdateManyInput>
    /**
     * Filter which Customers to update
     */
    where?: CustomerWhereInput
    /**
     * Limit how many Customers to update.
     */
    limit?: number
  }

  /**
   * Customer upsert
   */
  export type CustomerUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * The filter to search for the Customer to update in case it exists.
     */
    where: CustomerWhereUniqueInput
    /**
     * In case the Customer found by the `where` argument doesn't exist, create a new Customer with this data.
     */
    create: XOR<CustomerCreateInput, CustomerUncheckedCreateInput>
    /**
     * In case the Customer was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CustomerUpdateInput, CustomerUncheckedUpdateInput>
  }

  /**
   * Customer delete
   */
  export type CustomerDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter which Customer to delete.
     */
    where: CustomerWhereUniqueInput
  }

  /**
   * Customer deleteMany
   */
  export type CustomerDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Customers to delete
     */
    where?: CustomerWhereInput
    /**
     * Limit how many Customers to delete.
     */
    limit?: number
  }

  /**
   * Customer.daily_items
   */
  export type Customer$daily_itemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyBookItem
     */
    select?: DailyBookItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyBookItem
     */
    omit?: DailyBookItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyBookItemInclude<ExtArgs> | null
    where?: DailyBookItemWhereInput
    orderBy?: DailyBookItemOrderByWithRelationInput | DailyBookItemOrderByWithRelationInput[]
    cursor?: DailyBookItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DailyBookItemScalarFieldEnum | DailyBookItemScalarFieldEnum[]
  }

  /**
   * Customer.ledger_items
   */
  export type Customer$ledger_itemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ledger
     */
    select?: LedgerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ledger
     */
    omit?: LedgerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LedgerInclude<ExtArgs> | null
    where?: LedgerWhereInput
    orderBy?: LedgerOrderByWithRelationInput | LedgerOrderByWithRelationInput[]
    cursor?: LedgerWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LedgerScalarFieldEnum | LedgerScalarFieldEnum[]
  }

  /**
   * Customer without action
   */
  export type CustomerDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
  }


  /**
   * Model DailyBook
   */

  export type AggregateDailyBook = {
    _count: DailyBookCountAggregateOutputType | null
    _min: DailyBookMinAggregateOutputType | null
    _max: DailyBookMaxAggregateOutputType | null
  }

  export type DailyBookMinAggregateOutputType = {
    id: string | null
    date: Date | null
    is_closed: boolean | null
    created_at: Date | null
    deleted_at: Date | null
  }

  export type DailyBookMaxAggregateOutputType = {
    id: string | null
    date: Date | null
    is_closed: boolean | null
    created_at: Date | null
    deleted_at: Date | null
  }

  export type DailyBookCountAggregateOutputType = {
    id: number
    date: number
    is_closed: number
    created_at: number
    deleted_at: number
    _all: number
  }


  export type DailyBookMinAggregateInputType = {
    id?: true
    date?: true
    is_closed?: true
    created_at?: true
    deleted_at?: true
  }

  export type DailyBookMaxAggregateInputType = {
    id?: true
    date?: true
    is_closed?: true
    created_at?: true
    deleted_at?: true
  }

  export type DailyBookCountAggregateInputType = {
    id?: true
    date?: true
    is_closed?: true
    created_at?: true
    deleted_at?: true
    _all?: true
  }

  export type DailyBookAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DailyBook to aggregate.
     */
    where?: DailyBookWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailyBooks to fetch.
     */
    orderBy?: DailyBookOrderByWithRelationInput | DailyBookOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DailyBookWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailyBooks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailyBooks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DailyBooks
    **/
    _count?: true | DailyBookCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DailyBookMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DailyBookMaxAggregateInputType
  }

  export type GetDailyBookAggregateType<T extends DailyBookAggregateArgs> = {
        [P in keyof T & keyof AggregateDailyBook]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDailyBook[P]>
      : GetScalarType<T[P], AggregateDailyBook[P]>
  }




  export type DailyBookGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DailyBookWhereInput
    orderBy?: DailyBookOrderByWithAggregationInput | DailyBookOrderByWithAggregationInput[]
    by: DailyBookScalarFieldEnum[] | DailyBookScalarFieldEnum
    having?: DailyBookScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DailyBookCountAggregateInputType | true
    _min?: DailyBookMinAggregateInputType
    _max?: DailyBookMaxAggregateInputType
  }

  export type DailyBookGroupByOutputType = {
    id: string
    date: Date
    is_closed: boolean
    created_at: Date
    deleted_at: Date | null
    _count: DailyBookCountAggregateOutputType | null
    _min: DailyBookMinAggregateOutputType | null
    _max: DailyBookMaxAggregateOutputType | null
  }

  type GetDailyBookGroupByPayload<T extends DailyBookGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DailyBookGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DailyBookGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DailyBookGroupByOutputType[P]>
            : GetScalarType<T[P], DailyBookGroupByOutputType[P]>
        }
      >
    >


  export type DailyBookSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    is_closed?: boolean
    created_at?: boolean
    deleted_at?: boolean
    items?: boolean | DailyBook$itemsArgs<ExtArgs>
    _count?: boolean | DailyBookCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["dailyBook"]>

  export type DailyBookSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    is_closed?: boolean
    created_at?: boolean
    deleted_at?: boolean
  }, ExtArgs["result"]["dailyBook"]>

  export type DailyBookSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    is_closed?: boolean
    created_at?: boolean
    deleted_at?: boolean
  }, ExtArgs["result"]["dailyBook"]>

  export type DailyBookSelectScalar = {
    id?: boolean
    date?: boolean
    is_closed?: boolean
    created_at?: boolean
    deleted_at?: boolean
  }

  export type DailyBookOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "date" | "is_closed" | "created_at" | "deleted_at", ExtArgs["result"]["dailyBook"]>
  export type DailyBookInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    items?: boolean | DailyBook$itemsArgs<ExtArgs>
    _count?: boolean | DailyBookCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type DailyBookIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type DailyBookIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $DailyBookPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DailyBook"
    objects: {
      items: Prisma.$DailyBookItemPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      date: Date
      is_closed: boolean
      created_at: Date
      deleted_at: Date | null
    }, ExtArgs["result"]["dailyBook"]>
    composites: {}
  }

  type DailyBookGetPayload<S extends boolean | null | undefined | DailyBookDefaultArgs> = $Result.GetResult<Prisma.$DailyBookPayload, S>

  type DailyBookCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DailyBookFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DailyBookCountAggregateInputType | true
    }

  export interface DailyBookDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DailyBook'], meta: { name: 'DailyBook' } }
    /**
     * Find zero or one DailyBook that matches the filter.
     * @param {DailyBookFindUniqueArgs} args - Arguments to find a DailyBook
     * @example
     * // Get one DailyBook
     * const dailyBook = await prisma.dailyBook.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DailyBookFindUniqueArgs>(args: SelectSubset<T, DailyBookFindUniqueArgs<ExtArgs>>): Prisma__DailyBookClient<$Result.GetResult<Prisma.$DailyBookPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DailyBook that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DailyBookFindUniqueOrThrowArgs} args - Arguments to find a DailyBook
     * @example
     * // Get one DailyBook
     * const dailyBook = await prisma.dailyBook.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DailyBookFindUniqueOrThrowArgs>(args: SelectSubset<T, DailyBookFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DailyBookClient<$Result.GetResult<Prisma.$DailyBookPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DailyBook that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyBookFindFirstArgs} args - Arguments to find a DailyBook
     * @example
     * // Get one DailyBook
     * const dailyBook = await prisma.dailyBook.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DailyBookFindFirstArgs>(args?: SelectSubset<T, DailyBookFindFirstArgs<ExtArgs>>): Prisma__DailyBookClient<$Result.GetResult<Prisma.$DailyBookPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DailyBook that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyBookFindFirstOrThrowArgs} args - Arguments to find a DailyBook
     * @example
     * // Get one DailyBook
     * const dailyBook = await prisma.dailyBook.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DailyBookFindFirstOrThrowArgs>(args?: SelectSubset<T, DailyBookFindFirstOrThrowArgs<ExtArgs>>): Prisma__DailyBookClient<$Result.GetResult<Prisma.$DailyBookPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DailyBooks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyBookFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DailyBooks
     * const dailyBooks = await prisma.dailyBook.findMany()
     * 
     * // Get first 10 DailyBooks
     * const dailyBooks = await prisma.dailyBook.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const dailyBookWithIdOnly = await prisma.dailyBook.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DailyBookFindManyArgs>(args?: SelectSubset<T, DailyBookFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DailyBookPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DailyBook.
     * @param {DailyBookCreateArgs} args - Arguments to create a DailyBook.
     * @example
     * // Create one DailyBook
     * const DailyBook = await prisma.dailyBook.create({
     *   data: {
     *     // ... data to create a DailyBook
     *   }
     * })
     * 
     */
    create<T extends DailyBookCreateArgs>(args: SelectSubset<T, DailyBookCreateArgs<ExtArgs>>): Prisma__DailyBookClient<$Result.GetResult<Prisma.$DailyBookPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DailyBooks.
     * @param {DailyBookCreateManyArgs} args - Arguments to create many DailyBooks.
     * @example
     * // Create many DailyBooks
     * const dailyBook = await prisma.dailyBook.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DailyBookCreateManyArgs>(args?: SelectSubset<T, DailyBookCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DailyBooks and returns the data saved in the database.
     * @param {DailyBookCreateManyAndReturnArgs} args - Arguments to create many DailyBooks.
     * @example
     * // Create many DailyBooks
     * const dailyBook = await prisma.dailyBook.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DailyBooks and only return the `id`
     * const dailyBookWithIdOnly = await prisma.dailyBook.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DailyBookCreateManyAndReturnArgs>(args?: SelectSubset<T, DailyBookCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DailyBookPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DailyBook.
     * @param {DailyBookDeleteArgs} args - Arguments to delete one DailyBook.
     * @example
     * // Delete one DailyBook
     * const DailyBook = await prisma.dailyBook.delete({
     *   where: {
     *     // ... filter to delete one DailyBook
     *   }
     * })
     * 
     */
    delete<T extends DailyBookDeleteArgs>(args: SelectSubset<T, DailyBookDeleteArgs<ExtArgs>>): Prisma__DailyBookClient<$Result.GetResult<Prisma.$DailyBookPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DailyBook.
     * @param {DailyBookUpdateArgs} args - Arguments to update one DailyBook.
     * @example
     * // Update one DailyBook
     * const dailyBook = await prisma.dailyBook.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DailyBookUpdateArgs>(args: SelectSubset<T, DailyBookUpdateArgs<ExtArgs>>): Prisma__DailyBookClient<$Result.GetResult<Prisma.$DailyBookPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DailyBooks.
     * @param {DailyBookDeleteManyArgs} args - Arguments to filter DailyBooks to delete.
     * @example
     * // Delete a few DailyBooks
     * const { count } = await prisma.dailyBook.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DailyBookDeleteManyArgs>(args?: SelectSubset<T, DailyBookDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DailyBooks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyBookUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DailyBooks
     * const dailyBook = await prisma.dailyBook.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DailyBookUpdateManyArgs>(args: SelectSubset<T, DailyBookUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DailyBooks and returns the data updated in the database.
     * @param {DailyBookUpdateManyAndReturnArgs} args - Arguments to update many DailyBooks.
     * @example
     * // Update many DailyBooks
     * const dailyBook = await prisma.dailyBook.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DailyBooks and only return the `id`
     * const dailyBookWithIdOnly = await prisma.dailyBook.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DailyBookUpdateManyAndReturnArgs>(args: SelectSubset<T, DailyBookUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DailyBookPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DailyBook.
     * @param {DailyBookUpsertArgs} args - Arguments to update or create a DailyBook.
     * @example
     * // Update or create a DailyBook
     * const dailyBook = await prisma.dailyBook.upsert({
     *   create: {
     *     // ... data to create a DailyBook
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DailyBook we want to update
     *   }
     * })
     */
    upsert<T extends DailyBookUpsertArgs>(args: SelectSubset<T, DailyBookUpsertArgs<ExtArgs>>): Prisma__DailyBookClient<$Result.GetResult<Prisma.$DailyBookPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DailyBooks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyBookCountArgs} args - Arguments to filter DailyBooks to count.
     * @example
     * // Count the number of DailyBooks
     * const count = await prisma.dailyBook.count({
     *   where: {
     *     // ... the filter for the DailyBooks we want to count
     *   }
     * })
    **/
    count<T extends DailyBookCountArgs>(
      args?: Subset<T, DailyBookCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DailyBookCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DailyBook.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyBookAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DailyBookAggregateArgs>(args: Subset<T, DailyBookAggregateArgs>): Prisma.PrismaPromise<GetDailyBookAggregateType<T>>

    /**
     * Group by DailyBook.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyBookGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DailyBookGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DailyBookGroupByArgs['orderBy'] }
        : { orderBy?: DailyBookGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DailyBookGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDailyBookGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DailyBook model
   */
  readonly fields: DailyBookFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DailyBook.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DailyBookClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    items<T extends DailyBook$itemsArgs<ExtArgs> = {}>(args?: Subset<T, DailyBook$itemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DailyBookItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DailyBook model
   */
  interface DailyBookFieldRefs {
    readonly id: FieldRef<"DailyBook", 'String'>
    readonly date: FieldRef<"DailyBook", 'DateTime'>
    readonly is_closed: FieldRef<"DailyBook", 'Boolean'>
    readonly created_at: FieldRef<"DailyBook", 'DateTime'>
    readonly deleted_at: FieldRef<"DailyBook", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DailyBook findUnique
   */
  export type DailyBookFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyBook
     */
    select?: DailyBookSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyBook
     */
    omit?: DailyBookOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyBookInclude<ExtArgs> | null
    /**
     * Filter, which DailyBook to fetch.
     */
    where: DailyBookWhereUniqueInput
  }

  /**
   * DailyBook findUniqueOrThrow
   */
  export type DailyBookFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyBook
     */
    select?: DailyBookSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyBook
     */
    omit?: DailyBookOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyBookInclude<ExtArgs> | null
    /**
     * Filter, which DailyBook to fetch.
     */
    where: DailyBookWhereUniqueInput
  }

  /**
   * DailyBook findFirst
   */
  export type DailyBookFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyBook
     */
    select?: DailyBookSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyBook
     */
    omit?: DailyBookOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyBookInclude<ExtArgs> | null
    /**
     * Filter, which DailyBook to fetch.
     */
    where?: DailyBookWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailyBooks to fetch.
     */
    orderBy?: DailyBookOrderByWithRelationInput | DailyBookOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DailyBooks.
     */
    cursor?: DailyBookWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailyBooks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailyBooks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DailyBooks.
     */
    distinct?: DailyBookScalarFieldEnum | DailyBookScalarFieldEnum[]
  }

  /**
   * DailyBook findFirstOrThrow
   */
  export type DailyBookFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyBook
     */
    select?: DailyBookSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyBook
     */
    omit?: DailyBookOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyBookInclude<ExtArgs> | null
    /**
     * Filter, which DailyBook to fetch.
     */
    where?: DailyBookWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailyBooks to fetch.
     */
    orderBy?: DailyBookOrderByWithRelationInput | DailyBookOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DailyBooks.
     */
    cursor?: DailyBookWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailyBooks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailyBooks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DailyBooks.
     */
    distinct?: DailyBookScalarFieldEnum | DailyBookScalarFieldEnum[]
  }

  /**
   * DailyBook findMany
   */
  export type DailyBookFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyBook
     */
    select?: DailyBookSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyBook
     */
    omit?: DailyBookOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyBookInclude<ExtArgs> | null
    /**
     * Filter, which DailyBooks to fetch.
     */
    where?: DailyBookWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailyBooks to fetch.
     */
    orderBy?: DailyBookOrderByWithRelationInput | DailyBookOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DailyBooks.
     */
    cursor?: DailyBookWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailyBooks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailyBooks.
     */
    skip?: number
    distinct?: DailyBookScalarFieldEnum | DailyBookScalarFieldEnum[]
  }

  /**
   * DailyBook create
   */
  export type DailyBookCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyBook
     */
    select?: DailyBookSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyBook
     */
    omit?: DailyBookOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyBookInclude<ExtArgs> | null
    /**
     * The data needed to create a DailyBook.
     */
    data: XOR<DailyBookCreateInput, DailyBookUncheckedCreateInput>
  }

  /**
   * DailyBook createMany
   */
  export type DailyBookCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DailyBooks.
     */
    data: DailyBookCreateManyInput | DailyBookCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DailyBook createManyAndReturn
   */
  export type DailyBookCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyBook
     */
    select?: DailyBookSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DailyBook
     */
    omit?: DailyBookOmit<ExtArgs> | null
    /**
     * The data used to create many DailyBooks.
     */
    data: DailyBookCreateManyInput | DailyBookCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DailyBook update
   */
  export type DailyBookUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyBook
     */
    select?: DailyBookSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyBook
     */
    omit?: DailyBookOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyBookInclude<ExtArgs> | null
    /**
     * The data needed to update a DailyBook.
     */
    data: XOR<DailyBookUpdateInput, DailyBookUncheckedUpdateInput>
    /**
     * Choose, which DailyBook to update.
     */
    where: DailyBookWhereUniqueInput
  }

  /**
   * DailyBook updateMany
   */
  export type DailyBookUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DailyBooks.
     */
    data: XOR<DailyBookUpdateManyMutationInput, DailyBookUncheckedUpdateManyInput>
    /**
     * Filter which DailyBooks to update
     */
    where?: DailyBookWhereInput
    /**
     * Limit how many DailyBooks to update.
     */
    limit?: number
  }

  /**
   * DailyBook updateManyAndReturn
   */
  export type DailyBookUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyBook
     */
    select?: DailyBookSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DailyBook
     */
    omit?: DailyBookOmit<ExtArgs> | null
    /**
     * The data used to update DailyBooks.
     */
    data: XOR<DailyBookUpdateManyMutationInput, DailyBookUncheckedUpdateManyInput>
    /**
     * Filter which DailyBooks to update
     */
    where?: DailyBookWhereInput
    /**
     * Limit how many DailyBooks to update.
     */
    limit?: number
  }

  /**
   * DailyBook upsert
   */
  export type DailyBookUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyBook
     */
    select?: DailyBookSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyBook
     */
    omit?: DailyBookOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyBookInclude<ExtArgs> | null
    /**
     * The filter to search for the DailyBook to update in case it exists.
     */
    where: DailyBookWhereUniqueInput
    /**
     * In case the DailyBook found by the `where` argument doesn't exist, create a new DailyBook with this data.
     */
    create: XOR<DailyBookCreateInput, DailyBookUncheckedCreateInput>
    /**
     * In case the DailyBook was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DailyBookUpdateInput, DailyBookUncheckedUpdateInput>
  }

  /**
   * DailyBook delete
   */
  export type DailyBookDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyBook
     */
    select?: DailyBookSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyBook
     */
    omit?: DailyBookOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyBookInclude<ExtArgs> | null
    /**
     * Filter which DailyBook to delete.
     */
    where: DailyBookWhereUniqueInput
  }

  /**
   * DailyBook deleteMany
   */
  export type DailyBookDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DailyBooks to delete
     */
    where?: DailyBookWhereInput
    /**
     * Limit how many DailyBooks to delete.
     */
    limit?: number
  }

  /**
   * DailyBook.items
   */
  export type DailyBook$itemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyBookItem
     */
    select?: DailyBookItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyBookItem
     */
    omit?: DailyBookItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyBookItemInclude<ExtArgs> | null
    where?: DailyBookItemWhereInput
    orderBy?: DailyBookItemOrderByWithRelationInput | DailyBookItemOrderByWithRelationInput[]
    cursor?: DailyBookItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DailyBookItemScalarFieldEnum | DailyBookItemScalarFieldEnum[]
  }

  /**
   * DailyBook without action
   */
  export type DailyBookDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyBook
     */
    select?: DailyBookSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyBook
     */
    omit?: DailyBookOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyBookInclude<ExtArgs> | null
  }


  /**
   * Model DailyBookItem
   */

  export type AggregateDailyBookItem = {
    _count: DailyBookItemCountAggregateOutputType | null
    _avg: DailyBookItemAvgAggregateOutputType | null
    _sum: DailyBookItemSumAggregateOutputType | null
    _min: DailyBookItemMinAggregateOutputType | null
    _max: DailyBookItemMaxAggregateOutputType | null
  }

  export type DailyBookItemAvgAggregateOutputType = {
    kg: number | null
  }

  export type DailyBookItemSumAggregateOutputType = {
    kg: number | null
  }

  export type DailyBookItemMinAggregateOutputType = {
    id: string | null
    daily_book_id: string | null
    customer_id: string | null
    kg: number | null
    present: boolean | null
    note: string | null
    deleted_at: Date | null
  }

  export type DailyBookItemMaxAggregateOutputType = {
    id: string | null
    daily_book_id: string | null
    customer_id: string | null
    kg: number | null
    present: boolean | null
    note: string | null
    deleted_at: Date | null
  }

  export type DailyBookItemCountAggregateOutputType = {
    id: number
    daily_book_id: number
    customer_id: number
    kg: number
    present: number
    note: number
    deleted_at: number
    _all: number
  }


  export type DailyBookItemAvgAggregateInputType = {
    kg?: true
  }

  export type DailyBookItemSumAggregateInputType = {
    kg?: true
  }

  export type DailyBookItemMinAggregateInputType = {
    id?: true
    daily_book_id?: true
    customer_id?: true
    kg?: true
    present?: true
    note?: true
    deleted_at?: true
  }

  export type DailyBookItemMaxAggregateInputType = {
    id?: true
    daily_book_id?: true
    customer_id?: true
    kg?: true
    present?: true
    note?: true
    deleted_at?: true
  }

  export type DailyBookItemCountAggregateInputType = {
    id?: true
    daily_book_id?: true
    customer_id?: true
    kg?: true
    present?: true
    note?: true
    deleted_at?: true
    _all?: true
  }

  export type DailyBookItemAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DailyBookItem to aggregate.
     */
    where?: DailyBookItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailyBookItems to fetch.
     */
    orderBy?: DailyBookItemOrderByWithRelationInput | DailyBookItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DailyBookItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailyBookItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailyBookItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DailyBookItems
    **/
    _count?: true | DailyBookItemCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DailyBookItemAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DailyBookItemSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DailyBookItemMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DailyBookItemMaxAggregateInputType
  }

  export type GetDailyBookItemAggregateType<T extends DailyBookItemAggregateArgs> = {
        [P in keyof T & keyof AggregateDailyBookItem]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDailyBookItem[P]>
      : GetScalarType<T[P], AggregateDailyBookItem[P]>
  }




  export type DailyBookItemGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DailyBookItemWhereInput
    orderBy?: DailyBookItemOrderByWithAggregationInput | DailyBookItemOrderByWithAggregationInput[]
    by: DailyBookItemScalarFieldEnum[] | DailyBookItemScalarFieldEnum
    having?: DailyBookItemScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DailyBookItemCountAggregateInputType | true
    _avg?: DailyBookItemAvgAggregateInputType
    _sum?: DailyBookItemSumAggregateInputType
    _min?: DailyBookItemMinAggregateInputType
    _max?: DailyBookItemMaxAggregateInputType
  }

  export type DailyBookItemGroupByOutputType = {
    id: string
    daily_book_id: string
    customer_id: string
    kg: number
    present: boolean
    note: string | null
    deleted_at: Date | null
    _count: DailyBookItemCountAggregateOutputType | null
    _avg: DailyBookItemAvgAggregateOutputType | null
    _sum: DailyBookItemSumAggregateOutputType | null
    _min: DailyBookItemMinAggregateOutputType | null
    _max: DailyBookItemMaxAggregateOutputType | null
  }

  type GetDailyBookItemGroupByPayload<T extends DailyBookItemGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DailyBookItemGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DailyBookItemGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DailyBookItemGroupByOutputType[P]>
            : GetScalarType<T[P], DailyBookItemGroupByOutputType[P]>
        }
      >
    >


  export type DailyBookItemSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    daily_book_id?: boolean
    customer_id?: boolean
    kg?: boolean
    present?: boolean
    note?: boolean
    deleted_at?: boolean
    daily_book?: boolean | DailyBookDefaultArgs<ExtArgs>
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["dailyBookItem"]>

  export type DailyBookItemSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    daily_book_id?: boolean
    customer_id?: boolean
    kg?: boolean
    present?: boolean
    note?: boolean
    deleted_at?: boolean
    daily_book?: boolean | DailyBookDefaultArgs<ExtArgs>
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["dailyBookItem"]>

  export type DailyBookItemSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    daily_book_id?: boolean
    customer_id?: boolean
    kg?: boolean
    present?: boolean
    note?: boolean
    deleted_at?: boolean
    daily_book?: boolean | DailyBookDefaultArgs<ExtArgs>
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["dailyBookItem"]>

  export type DailyBookItemSelectScalar = {
    id?: boolean
    daily_book_id?: boolean
    customer_id?: boolean
    kg?: boolean
    present?: boolean
    note?: boolean
    deleted_at?: boolean
  }

  export type DailyBookItemOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "daily_book_id" | "customer_id" | "kg" | "present" | "note" | "deleted_at", ExtArgs["result"]["dailyBookItem"]>
  export type DailyBookItemInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    daily_book?: boolean | DailyBookDefaultArgs<ExtArgs>
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
  }
  export type DailyBookItemIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    daily_book?: boolean | DailyBookDefaultArgs<ExtArgs>
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
  }
  export type DailyBookItemIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    daily_book?: boolean | DailyBookDefaultArgs<ExtArgs>
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
  }

  export type $DailyBookItemPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DailyBookItem"
    objects: {
      daily_book: Prisma.$DailyBookPayload<ExtArgs>
      customer: Prisma.$CustomerPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      daily_book_id: string
      customer_id: string
      kg: number
      present: boolean
      note: string | null
      deleted_at: Date | null
    }, ExtArgs["result"]["dailyBookItem"]>
    composites: {}
  }

  type DailyBookItemGetPayload<S extends boolean | null | undefined | DailyBookItemDefaultArgs> = $Result.GetResult<Prisma.$DailyBookItemPayload, S>

  type DailyBookItemCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DailyBookItemFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DailyBookItemCountAggregateInputType | true
    }

  export interface DailyBookItemDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DailyBookItem'], meta: { name: 'DailyBookItem' } }
    /**
     * Find zero or one DailyBookItem that matches the filter.
     * @param {DailyBookItemFindUniqueArgs} args - Arguments to find a DailyBookItem
     * @example
     * // Get one DailyBookItem
     * const dailyBookItem = await prisma.dailyBookItem.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DailyBookItemFindUniqueArgs>(args: SelectSubset<T, DailyBookItemFindUniqueArgs<ExtArgs>>): Prisma__DailyBookItemClient<$Result.GetResult<Prisma.$DailyBookItemPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DailyBookItem that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DailyBookItemFindUniqueOrThrowArgs} args - Arguments to find a DailyBookItem
     * @example
     * // Get one DailyBookItem
     * const dailyBookItem = await prisma.dailyBookItem.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DailyBookItemFindUniqueOrThrowArgs>(args: SelectSubset<T, DailyBookItemFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DailyBookItemClient<$Result.GetResult<Prisma.$DailyBookItemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DailyBookItem that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyBookItemFindFirstArgs} args - Arguments to find a DailyBookItem
     * @example
     * // Get one DailyBookItem
     * const dailyBookItem = await prisma.dailyBookItem.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DailyBookItemFindFirstArgs>(args?: SelectSubset<T, DailyBookItemFindFirstArgs<ExtArgs>>): Prisma__DailyBookItemClient<$Result.GetResult<Prisma.$DailyBookItemPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DailyBookItem that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyBookItemFindFirstOrThrowArgs} args - Arguments to find a DailyBookItem
     * @example
     * // Get one DailyBookItem
     * const dailyBookItem = await prisma.dailyBookItem.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DailyBookItemFindFirstOrThrowArgs>(args?: SelectSubset<T, DailyBookItemFindFirstOrThrowArgs<ExtArgs>>): Prisma__DailyBookItemClient<$Result.GetResult<Prisma.$DailyBookItemPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DailyBookItems that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyBookItemFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DailyBookItems
     * const dailyBookItems = await prisma.dailyBookItem.findMany()
     * 
     * // Get first 10 DailyBookItems
     * const dailyBookItems = await prisma.dailyBookItem.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const dailyBookItemWithIdOnly = await prisma.dailyBookItem.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DailyBookItemFindManyArgs>(args?: SelectSubset<T, DailyBookItemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DailyBookItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DailyBookItem.
     * @param {DailyBookItemCreateArgs} args - Arguments to create a DailyBookItem.
     * @example
     * // Create one DailyBookItem
     * const DailyBookItem = await prisma.dailyBookItem.create({
     *   data: {
     *     // ... data to create a DailyBookItem
     *   }
     * })
     * 
     */
    create<T extends DailyBookItemCreateArgs>(args: SelectSubset<T, DailyBookItemCreateArgs<ExtArgs>>): Prisma__DailyBookItemClient<$Result.GetResult<Prisma.$DailyBookItemPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DailyBookItems.
     * @param {DailyBookItemCreateManyArgs} args - Arguments to create many DailyBookItems.
     * @example
     * // Create many DailyBookItems
     * const dailyBookItem = await prisma.dailyBookItem.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DailyBookItemCreateManyArgs>(args?: SelectSubset<T, DailyBookItemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DailyBookItems and returns the data saved in the database.
     * @param {DailyBookItemCreateManyAndReturnArgs} args - Arguments to create many DailyBookItems.
     * @example
     * // Create many DailyBookItems
     * const dailyBookItem = await prisma.dailyBookItem.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DailyBookItems and only return the `id`
     * const dailyBookItemWithIdOnly = await prisma.dailyBookItem.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DailyBookItemCreateManyAndReturnArgs>(args?: SelectSubset<T, DailyBookItemCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DailyBookItemPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DailyBookItem.
     * @param {DailyBookItemDeleteArgs} args - Arguments to delete one DailyBookItem.
     * @example
     * // Delete one DailyBookItem
     * const DailyBookItem = await prisma.dailyBookItem.delete({
     *   where: {
     *     // ... filter to delete one DailyBookItem
     *   }
     * })
     * 
     */
    delete<T extends DailyBookItemDeleteArgs>(args: SelectSubset<T, DailyBookItemDeleteArgs<ExtArgs>>): Prisma__DailyBookItemClient<$Result.GetResult<Prisma.$DailyBookItemPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DailyBookItem.
     * @param {DailyBookItemUpdateArgs} args - Arguments to update one DailyBookItem.
     * @example
     * // Update one DailyBookItem
     * const dailyBookItem = await prisma.dailyBookItem.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DailyBookItemUpdateArgs>(args: SelectSubset<T, DailyBookItemUpdateArgs<ExtArgs>>): Prisma__DailyBookItemClient<$Result.GetResult<Prisma.$DailyBookItemPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DailyBookItems.
     * @param {DailyBookItemDeleteManyArgs} args - Arguments to filter DailyBookItems to delete.
     * @example
     * // Delete a few DailyBookItems
     * const { count } = await prisma.dailyBookItem.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DailyBookItemDeleteManyArgs>(args?: SelectSubset<T, DailyBookItemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DailyBookItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyBookItemUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DailyBookItems
     * const dailyBookItem = await prisma.dailyBookItem.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DailyBookItemUpdateManyArgs>(args: SelectSubset<T, DailyBookItemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DailyBookItems and returns the data updated in the database.
     * @param {DailyBookItemUpdateManyAndReturnArgs} args - Arguments to update many DailyBookItems.
     * @example
     * // Update many DailyBookItems
     * const dailyBookItem = await prisma.dailyBookItem.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DailyBookItems and only return the `id`
     * const dailyBookItemWithIdOnly = await prisma.dailyBookItem.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DailyBookItemUpdateManyAndReturnArgs>(args: SelectSubset<T, DailyBookItemUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DailyBookItemPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DailyBookItem.
     * @param {DailyBookItemUpsertArgs} args - Arguments to update or create a DailyBookItem.
     * @example
     * // Update or create a DailyBookItem
     * const dailyBookItem = await prisma.dailyBookItem.upsert({
     *   create: {
     *     // ... data to create a DailyBookItem
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DailyBookItem we want to update
     *   }
     * })
     */
    upsert<T extends DailyBookItemUpsertArgs>(args: SelectSubset<T, DailyBookItemUpsertArgs<ExtArgs>>): Prisma__DailyBookItemClient<$Result.GetResult<Prisma.$DailyBookItemPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DailyBookItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyBookItemCountArgs} args - Arguments to filter DailyBookItems to count.
     * @example
     * // Count the number of DailyBookItems
     * const count = await prisma.dailyBookItem.count({
     *   where: {
     *     // ... the filter for the DailyBookItems we want to count
     *   }
     * })
    **/
    count<T extends DailyBookItemCountArgs>(
      args?: Subset<T, DailyBookItemCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DailyBookItemCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DailyBookItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyBookItemAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DailyBookItemAggregateArgs>(args: Subset<T, DailyBookItemAggregateArgs>): Prisma.PrismaPromise<GetDailyBookItemAggregateType<T>>

    /**
     * Group by DailyBookItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyBookItemGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DailyBookItemGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DailyBookItemGroupByArgs['orderBy'] }
        : { orderBy?: DailyBookItemGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DailyBookItemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDailyBookItemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DailyBookItem model
   */
  readonly fields: DailyBookItemFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DailyBookItem.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DailyBookItemClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    daily_book<T extends DailyBookDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DailyBookDefaultArgs<ExtArgs>>): Prisma__DailyBookClient<$Result.GetResult<Prisma.$DailyBookPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    customer<T extends CustomerDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CustomerDefaultArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DailyBookItem model
   */
  interface DailyBookItemFieldRefs {
    readonly id: FieldRef<"DailyBookItem", 'String'>
    readonly daily_book_id: FieldRef<"DailyBookItem", 'String'>
    readonly customer_id: FieldRef<"DailyBookItem", 'String'>
    readonly kg: FieldRef<"DailyBookItem", 'Float'>
    readonly present: FieldRef<"DailyBookItem", 'Boolean'>
    readonly note: FieldRef<"DailyBookItem", 'String'>
    readonly deleted_at: FieldRef<"DailyBookItem", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DailyBookItem findUnique
   */
  export type DailyBookItemFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyBookItem
     */
    select?: DailyBookItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyBookItem
     */
    omit?: DailyBookItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyBookItemInclude<ExtArgs> | null
    /**
     * Filter, which DailyBookItem to fetch.
     */
    where: DailyBookItemWhereUniqueInput
  }

  /**
   * DailyBookItem findUniqueOrThrow
   */
  export type DailyBookItemFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyBookItem
     */
    select?: DailyBookItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyBookItem
     */
    omit?: DailyBookItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyBookItemInclude<ExtArgs> | null
    /**
     * Filter, which DailyBookItem to fetch.
     */
    where: DailyBookItemWhereUniqueInput
  }

  /**
   * DailyBookItem findFirst
   */
  export type DailyBookItemFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyBookItem
     */
    select?: DailyBookItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyBookItem
     */
    omit?: DailyBookItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyBookItemInclude<ExtArgs> | null
    /**
     * Filter, which DailyBookItem to fetch.
     */
    where?: DailyBookItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailyBookItems to fetch.
     */
    orderBy?: DailyBookItemOrderByWithRelationInput | DailyBookItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DailyBookItems.
     */
    cursor?: DailyBookItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailyBookItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailyBookItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DailyBookItems.
     */
    distinct?: DailyBookItemScalarFieldEnum | DailyBookItemScalarFieldEnum[]
  }

  /**
   * DailyBookItem findFirstOrThrow
   */
  export type DailyBookItemFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyBookItem
     */
    select?: DailyBookItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyBookItem
     */
    omit?: DailyBookItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyBookItemInclude<ExtArgs> | null
    /**
     * Filter, which DailyBookItem to fetch.
     */
    where?: DailyBookItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailyBookItems to fetch.
     */
    orderBy?: DailyBookItemOrderByWithRelationInput | DailyBookItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DailyBookItems.
     */
    cursor?: DailyBookItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailyBookItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailyBookItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DailyBookItems.
     */
    distinct?: DailyBookItemScalarFieldEnum | DailyBookItemScalarFieldEnum[]
  }

  /**
   * DailyBookItem findMany
   */
  export type DailyBookItemFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyBookItem
     */
    select?: DailyBookItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyBookItem
     */
    omit?: DailyBookItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyBookItemInclude<ExtArgs> | null
    /**
     * Filter, which DailyBookItems to fetch.
     */
    where?: DailyBookItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailyBookItems to fetch.
     */
    orderBy?: DailyBookItemOrderByWithRelationInput | DailyBookItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DailyBookItems.
     */
    cursor?: DailyBookItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailyBookItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailyBookItems.
     */
    skip?: number
    distinct?: DailyBookItemScalarFieldEnum | DailyBookItemScalarFieldEnum[]
  }

  /**
   * DailyBookItem create
   */
  export type DailyBookItemCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyBookItem
     */
    select?: DailyBookItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyBookItem
     */
    omit?: DailyBookItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyBookItemInclude<ExtArgs> | null
    /**
     * The data needed to create a DailyBookItem.
     */
    data: XOR<DailyBookItemCreateInput, DailyBookItemUncheckedCreateInput>
  }

  /**
   * DailyBookItem createMany
   */
  export type DailyBookItemCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DailyBookItems.
     */
    data: DailyBookItemCreateManyInput | DailyBookItemCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DailyBookItem createManyAndReturn
   */
  export type DailyBookItemCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyBookItem
     */
    select?: DailyBookItemSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DailyBookItem
     */
    omit?: DailyBookItemOmit<ExtArgs> | null
    /**
     * The data used to create many DailyBookItems.
     */
    data: DailyBookItemCreateManyInput | DailyBookItemCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyBookItemIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * DailyBookItem update
   */
  export type DailyBookItemUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyBookItem
     */
    select?: DailyBookItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyBookItem
     */
    omit?: DailyBookItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyBookItemInclude<ExtArgs> | null
    /**
     * The data needed to update a DailyBookItem.
     */
    data: XOR<DailyBookItemUpdateInput, DailyBookItemUncheckedUpdateInput>
    /**
     * Choose, which DailyBookItem to update.
     */
    where: DailyBookItemWhereUniqueInput
  }

  /**
   * DailyBookItem updateMany
   */
  export type DailyBookItemUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DailyBookItems.
     */
    data: XOR<DailyBookItemUpdateManyMutationInput, DailyBookItemUncheckedUpdateManyInput>
    /**
     * Filter which DailyBookItems to update
     */
    where?: DailyBookItemWhereInput
    /**
     * Limit how many DailyBookItems to update.
     */
    limit?: number
  }

  /**
   * DailyBookItem updateManyAndReturn
   */
  export type DailyBookItemUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyBookItem
     */
    select?: DailyBookItemSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DailyBookItem
     */
    omit?: DailyBookItemOmit<ExtArgs> | null
    /**
     * The data used to update DailyBookItems.
     */
    data: XOR<DailyBookItemUpdateManyMutationInput, DailyBookItemUncheckedUpdateManyInput>
    /**
     * Filter which DailyBookItems to update
     */
    where?: DailyBookItemWhereInput
    /**
     * Limit how many DailyBookItems to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyBookItemIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * DailyBookItem upsert
   */
  export type DailyBookItemUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyBookItem
     */
    select?: DailyBookItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyBookItem
     */
    omit?: DailyBookItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyBookItemInclude<ExtArgs> | null
    /**
     * The filter to search for the DailyBookItem to update in case it exists.
     */
    where: DailyBookItemWhereUniqueInput
    /**
     * In case the DailyBookItem found by the `where` argument doesn't exist, create a new DailyBookItem with this data.
     */
    create: XOR<DailyBookItemCreateInput, DailyBookItemUncheckedCreateInput>
    /**
     * In case the DailyBookItem was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DailyBookItemUpdateInput, DailyBookItemUncheckedUpdateInput>
  }

  /**
   * DailyBookItem delete
   */
  export type DailyBookItemDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyBookItem
     */
    select?: DailyBookItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyBookItem
     */
    omit?: DailyBookItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyBookItemInclude<ExtArgs> | null
    /**
     * Filter which DailyBookItem to delete.
     */
    where: DailyBookItemWhereUniqueInput
  }

  /**
   * DailyBookItem deleteMany
   */
  export type DailyBookItemDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DailyBookItems to delete
     */
    where?: DailyBookItemWhereInput
    /**
     * Limit how many DailyBookItems to delete.
     */
    limit?: number
  }

  /**
   * DailyBookItem without action
   */
  export type DailyBookItemDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyBookItem
     */
    select?: DailyBookItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyBookItem
     */
    omit?: DailyBookItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyBookItemInclude<ExtArgs> | null
  }


  /**
   * Model Ledger
   */

  export type AggregateLedger = {
    _count: LedgerCountAggregateOutputType | null
    _avg: LedgerAvgAggregateOutputType | null
    _sum: LedgerSumAggregateOutputType | null
    _min: LedgerMinAggregateOutputType | null
    _max: LedgerMaxAggregateOutputType | null
  }

  export type LedgerAvgAggregateOutputType = {
    kg: number | null
    price_per_kg: number | null
    amount: number | null
    previous_debt: number | null
    new_debt: number | null
    maqal_id: number | null
  }

  export type LedgerSumAggregateOutputType = {
    kg: number | null
    price_per_kg: number | null
    amount: number | null
    previous_debt: number | null
    new_debt: number | null
    maqal_id: number | null
  }

  export type LedgerMinAggregateOutputType = {
    id: string | null
    customer_id: string | null
    type: $Enums.LedgerType | null
    reference_date: Date | null
    kg: number | null
    price_per_kg: number | null
    amount: number | null
    previous_debt: number | null
    new_debt: number | null
    note: string | null
    receipt_id: string | null
    maqal_id: number | null
    created_at: Date | null
    deleted_at: Date | null
  }

  export type LedgerMaxAggregateOutputType = {
    id: string | null
    customer_id: string | null
    type: $Enums.LedgerType | null
    reference_date: Date | null
    kg: number | null
    price_per_kg: number | null
    amount: number | null
    previous_debt: number | null
    new_debt: number | null
    note: string | null
    receipt_id: string | null
    maqal_id: number | null
    created_at: Date | null
    deleted_at: Date | null
  }

  export type LedgerCountAggregateOutputType = {
    id: number
    customer_id: number
    type: number
    reference_date: number
    kg: number
    price_per_kg: number
    amount: number
    previous_debt: number
    new_debt: number
    note: number
    receipt_id: number
    maqal_id: number
    created_at: number
    deleted_at: number
    _all: number
  }


  export type LedgerAvgAggregateInputType = {
    kg?: true
    price_per_kg?: true
    amount?: true
    previous_debt?: true
    new_debt?: true
    maqal_id?: true
  }

  export type LedgerSumAggregateInputType = {
    kg?: true
    price_per_kg?: true
    amount?: true
    previous_debt?: true
    new_debt?: true
    maqal_id?: true
  }

  export type LedgerMinAggregateInputType = {
    id?: true
    customer_id?: true
    type?: true
    reference_date?: true
    kg?: true
    price_per_kg?: true
    amount?: true
    previous_debt?: true
    new_debt?: true
    note?: true
    receipt_id?: true
    maqal_id?: true
    created_at?: true
    deleted_at?: true
  }

  export type LedgerMaxAggregateInputType = {
    id?: true
    customer_id?: true
    type?: true
    reference_date?: true
    kg?: true
    price_per_kg?: true
    amount?: true
    previous_debt?: true
    new_debt?: true
    note?: true
    receipt_id?: true
    maqal_id?: true
    created_at?: true
    deleted_at?: true
  }

  export type LedgerCountAggregateInputType = {
    id?: true
    customer_id?: true
    type?: true
    reference_date?: true
    kg?: true
    price_per_kg?: true
    amount?: true
    previous_debt?: true
    new_debt?: true
    note?: true
    receipt_id?: true
    maqal_id?: true
    created_at?: true
    deleted_at?: true
    _all?: true
  }

  export type LedgerAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Ledger to aggregate.
     */
    where?: LedgerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Ledgers to fetch.
     */
    orderBy?: LedgerOrderByWithRelationInput | LedgerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LedgerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Ledgers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Ledgers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Ledgers
    **/
    _count?: true | LedgerCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: LedgerAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: LedgerSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LedgerMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LedgerMaxAggregateInputType
  }

  export type GetLedgerAggregateType<T extends LedgerAggregateArgs> = {
        [P in keyof T & keyof AggregateLedger]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLedger[P]>
      : GetScalarType<T[P], AggregateLedger[P]>
  }




  export type LedgerGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LedgerWhereInput
    orderBy?: LedgerOrderByWithAggregationInput | LedgerOrderByWithAggregationInput[]
    by: LedgerScalarFieldEnum[] | LedgerScalarFieldEnum
    having?: LedgerScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LedgerCountAggregateInputType | true
    _avg?: LedgerAvgAggregateInputType
    _sum?: LedgerSumAggregateInputType
    _min?: LedgerMinAggregateInputType
    _max?: LedgerMaxAggregateInputType
  }

  export type LedgerGroupByOutputType = {
    id: string
    customer_id: string
    type: $Enums.LedgerType
    reference_date: Date | null
    kg: number | null
    price_per_kg: number | null
    amount: number
    previous_debt: number
    new_debt: number
    note: string | null
    receipt_id: string | null
    maqal_id: number | null
    created_at: Date
    deleted_at: Date | null
    _count: LedgerCountAggregateOutputType | null
    _avg: LedgerAvgAggregateOutputType | null
    _sum: LedgerSumAggregateOutputType | null
    _min: LedgerMinAggregateOutputType | null
    _max: LedgerMaxAggregateOutputType | null
  }

  type GetLedgerGroupByPayload<T extends LedgerGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LedgerGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LedgerGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LedgerGroupByOutputType[P]>
            : GetScalarType<T[P], LedgerGroupByOutputType[P]>
        }
      >
    >


  export type LedgerSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    customer_id?: boolean
    type?: boolean
    reference_date?: boolean
    kg?: boolean
    price_per_kg?: boolean
    amount?: boolean
    previous_debt?: boolean
    new_debt?: boolean
    note?: boolean
    receipt_id?: boolean
    maqal_id?: boolean
    created_at?: boolean
    deleted_at?: boolean
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ledger"]>

  export type LedgerSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    customer_id?: boolean
    type?: boolean
    reference_date?: boolean
    kg?: boolean
    price_per_kg?: boolean
    amount?: boolean
    previous_debt?: boolean
    new_debt?: boolean
    note?: boolean
    receipt_id?: boolean
    maqal_id?: boolean
    created_at?: boolean
    deleted_at?: boolean
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ledger"]>

  export type LedgerSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    customer_id?: boolean
    type?: boolean
    reference_date?: boolean
    kg?: boolean
    price_per_kg?: boolean
    amount?: boolean
    previous_debt?: boolean
    new_debt?: boolean
    note?: boolean
    receipt_id?: boolean
    maqal_id?: boolean
    created_at?: boolean
    deleted_at?: boolean
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ledger"]>

  export type LedgerSelectScalar = {
    id?: boolean
    customer_id?: boolean
    type?: boolean
    reference_date?: boolean
    kg?: boolean
    price_per_kg?: boolean
    amount?: boolean
    previous_debt?: boolean
    new_debt?: boolean
    note?: boolean
    receipt_id?: boolean
    maqal_id?: boolean
    created_at?: boolean
    deleted_at?: boolean
  }

  export type LedgerOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "customer_id" | "type" | "reference_date" | "kg" | "price_per_kg" | "amount" | "previous_debt" | "new_debt" | "note" | "receipt_id" | "maqal_id" | "created_at" | "deleted_at", ExtArgs["result"]["ledger"]>
  export type LedgerInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
  }
  export type LedgerIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
  }
  export type LedgerIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
  }

  export type $LedgerPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Ledger"
    objects: {
      customer: Prisma.$CustomerPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      customer_id: string
      type: $Enums.LedgerType
      reference_date: Date | null
      kg: number | null
      price_per_kg: number | null
      amount: number
      previous_debt: number
      new_debt: number
      note: string | null
      receipt_id: string | null
      maqal_id: number | null
      created_at: Date
      deleted_at: Date | null
    }, ExtArgs["result"]["ledger"]>
    composites: {}
  }

  type LedgerGetPayload<S extends boolean | null | undefined | LedgerDefaultArgs> = $Result.GetResult<Prisma.$LedgerPayload, S>

  type LedgerCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<LedgerFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LedgerCountAggregateInputType | true
    }

  export interface LedgerDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Ledger'], meta: { name: 'Ledger' } }
    /**
     * Find zero or one Ledger that matches the filter.
     * @param {LedgerFindUniqueArgs} args - Arguments to find a Ledger
     * @example
     * // Get one Ledger
     * const ledger = await prisma.ledger.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LedgerFindUniqueArgs>(args: SelectSubset<T, LedgerFindUniqueArgs<ExtArgs>>): Prisma__LedgerClient<$Result.GetResult<Prisma.$LedgerPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Ledger that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LedgerFindUniqueOrThrowArgs} args - Arguments to find a Ledger
     * @example
     * // Get one Ledger
     * const ledger = await prisma.ledger.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LedgerFindUniqueOrThrowArgs>(args: SelectSubset<T, LedgerFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LedgerClient<$Result.GetResult<Prisma.$LedgerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ledger that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LedgerFindFirstArgs} args - Arguments to find a Ledger
     * @example
     * // Get one Ledger
     * const ledger = await prisma.ledger.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LedgerFindFirstArgs>(args?: SelectSubset<T, LedgerFindFirstArgs<ExtArgs>>): Prisma__LedgerClient<$Result.GetResult<Prisma.$LedgerPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ledger that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LedgerFindFirstOrThrowArgs} args - Arguments to find a Ledger
     * @example
     * // Get one Ledger
     * const ledger = await prisma.ledger.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LedgerFindFirstOrThrowArgs>(args?: SelectSubset<T, LedgerFindFirstOrThrowArgs<ExtArgs>>): Prisma__LedgerClient<$Result.GetResult<Prisma.$LedgerPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Ledgers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LedgerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ledgers
     * const ledgers = await prisma.ledger.findMany()
     * 
     * // Get first 10 Ledgers
     * const ledgers = await prisma.ledger.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ledgerWithIdOnly = await prisma.ledger.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LedgerFindManyArgs>(args?: SelectSubset<T, LedgerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LedgerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Ledger.
     * @param {LedgerCreateArgs} args - Arguments to create a Ledger.
     * @example
     * // Create one Ledger
     * const Ledger = await prisma.ledger.create({
     *   data: {
     *     // ... data to create a Ledger
     *   }
     * })
     * 
     */
    create<T extends LedgerCreateArgs>(args: SelectSubset<T, LedgerCreateArgs<ExtArgs>>): Prisma__LedgerClient<$Result.GetResult<Prisma.$LedgerPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Ledgers.
     * @param {LedgerCreateManyArgs} args - Arguments to create many Ledgers.
     * @example
     * // Create many Ledgers
     * const ledger = await prisma.ledger.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LedgerCreateManyArgs>(args?: SelectSubset<T, LedgerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Ledgers and returns the data saved in the database.
     * @param {LedgerCreateManyAndReturnArgs} args - Arguments to create many Ledgers.
     * @example
     * // Create many Ledgers
     * const ledger = await prisma.ledger.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Ledgers and only return the `id`
     * const ledgerWithIdOnly = await prisma.ledger.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LedgerCreateManyAndReturnArgs>(args?: SelectSubset<T, LedgerCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LedgerPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Ledger.
     * @param {LedgerDeleteArgs} args - Arguments to delete one Ledger.
     * @example
     * // Delete one Ledger
     * const Ledger = await prisma.ledger.delete({
     *   where: {
     *     // ... filter to delete one Ledger
     *   }
     * })
     * 
     */
    delete<T extends LedgerDeleteArgs>(args: SelectSubset<T, LedgerDeleteArgs<ExtArgs>>): Prisma__LedgerClient<$Result.GetResult<Prisma.$LedgerPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Ledger.
     * @param {LedgerUpdateArgs} args - Arguments to update one Ledger.
     * @example
     * // Update one Ledger
     * const ledger = await prisma.ledger.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LedgerUpdateArgs>(args: SelectSubset<T, LedgerUpdateArgs<ExtArgs>>): Prisma__LedgerClient<$Result.GetResult<Prisma.$LedgerPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Ledgers.
     * @param {LedgerDeleteManyArgs} args - Arguments to filter Ledgers to delete.
     * @example
     * // Delete a few Ledgers
     * const { count } = await prisma.ledger.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LedgerDeleteManyArgs>(args?: SelectSubset<T, LedgerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ledgers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LedgerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ledgers
     * const ledger = await prisma.ledger.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LedgerUpdateManyArgs>(args: SelectSubset<T, LedgerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ledgers and returns the data updated in the database.
     * @param {LedgerUpdateManyAndReturnArgs} args - Arguments to update many Ledgers.
     * @example
     * // Update many Ledgers
     * const ledger = await prisma.ledger.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Ledgers and only return the `id`
     * const ledgerWithIdOnly = await prisma.ledger.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends LedgerUpdateManyAndReturnArgs>(args: SelectSubset<T, LedgerUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LedgerPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Ledger.
     * @param {LedgerUpsertArgs} args - Arguments to update or create a Ledger.
     * @example
     * // Update or create a Ledger
     * const ledger = await prisma.ledger.upsert({
     *   create: {
     *     // ... data to create a Ledger
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ledger we want to update
     *   }
     * })
     */
    upsert<T extends LedgerUpsertArgs>(args: SelectSubset<T, LedgerUpsertArgs<ExtArgs>>): Prisma__LedgerClient<$Result.GetResult<Prisma.$LedgerPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Ledgers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LedgerCountArgs} args - Arguments to filter Ledgers to count.
     * @example
     * // Count the number of Ledgers
     * const count = await prisma.ledger.count({
     *   where: {
     *     // ... the filter for the Ledgers we want to count
     *   }
     * })
    **/
    count<T extends LedgerCountArgs>(
      args?: Subset<T, LedgerCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LedgerCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ledger.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LedgerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LedgerAggregateArgs>(args: Subset<T, LedgerAggregateArgs>): Prisma.PrismaPromise<GetLedgerAggregateType<T>>

    /**
     * Group by Ledger.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LedgerGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LedgerGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LedgerGroupByArgs['orderBy'] }
        : { orderBy?: LedgerGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LedgerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLedgerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Ledger model
   */
  readonly fields: LedgerFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Ledger.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LedgerClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    customer<T extends CustomerDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CustomerDefaultArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Ledger model
   */
  interface LedgerFieldRefs {
    readonly id: FieldRef<"Ledger", 'String'>
    readonly customer_id: FieldRef<"Ledger", 'String'>
    readonly type: FieldRef<"Ledger", 'LedgerType'>
    readonly reference_date: FieldRef<"Ledger", 'DateTime'>
    readonly kg: FieldRef<"Ledger", 'Float'>
    readonly price_per_kg: FieldRef<"Ledger", 'Float'>
    readonly amount: FieldRef<"Ledger", 'Float'>
    readonly previous_debt: FieldRef<"Ledger", 'Float'>
    readonly new_debt: FieldRef<"Ledger", 'Float'>
    readonly note: FieldRef<"Ledger", 'String'>
    readonly receipt_id: FieldRef<"Ledger", 'String'>
    readonly maqal_id: FieldRef<"Ledger", 'Int'>
    readonly created_at: FieldRef<"Ledger", 'DateTime'>
    readonly deleted_at: FieldRef<"Ledger", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Ledger findUnique
   */
  export type LedgerFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ledger
     */
    select?: LedgerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ledger
     */
    omit?: LedgerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LedgerInclude<ExtArgs> | null
    /**
     * Filter, which Ledger to fetch.
     */
    where: LedgerWhereUniqueInput
  }

  /**
   * Ledger findUniqueOrThrow
   */
  export type LedgerFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ledger
     */
    select?: LedgerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ledger
     */
    omit?: LedgerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LedgerInclude<ExtArgs> | null
    /**
     * Filter, which Ledger to fetch.
     */
    where: LedgerWhereUniqueInput
  }

  /**
   * Ledger findFirst
   */
  export type LedgerFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ledger
     */
    select?: LedgerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ledger
     */
    omit?: LedgerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LedgerInclude<ExtArgs> | null
    /**
     * Filter, which Ledger to fetch.
     */
    where?: LedgerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Ledgers to fetch.
     */
    orderBy?: LedgerOrderByWithRelationInput | LedgerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Ledgers.
     */
    cursor?: LedgerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Ledgers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Ledgers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Ledgers.
     */
    distinct?: LedgerScalarFieldEnum | LedgerScalarFieldEnum[]
  }

  /**
   * Ledger findFirstOrThrow
   */
  export type LedgerFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ledger
     */
    select?: LedgerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ledger
     */
    omit?: LedgerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LedgerInclude<ExtArgs> | null
    /**
     * Filter, which Ledger to fetch.
     */
    where?: LedgerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Ledgers to fetch.
     */
    orderBy?: LedgerOrderByWithRelationInput | LedgerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Ledgers.
     */
    cursor?: LedgerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Ledgers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Ledgers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Ledgers.
     */
    distinct?: LedgerScalarFieldEnum | LedgerScalarFieldEnum[]
  }

  /**
   * Ledger findMany
   */
  export type LedgerFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ledger
     */
    select?: LedgerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ledger
     */
    omit?: LedgerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LedgerInclude<ExtArgs> | null
    /**
     * Filter, which Ledgers to fetch.
     */
    where?: LedgerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Ledgers to fetch.
     */
    orderBy?: LedgerOrderByWithRelationInput | LedgerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Ledgers.
     */
    cursor?: LedgerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Ledgers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Ledgers.
     */
    skip?: number
    distinct?: LedgerScalarFieldEnum | LedgerScalarFieldEnum[]
  }

  /**
   * Ledger create
   */
  export type LedgerCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ledger
     */
    select?: LedgerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ledger
     */
    omit?: LedgerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LedgerInclude<ExtArgs> | null
    /**
     * The data needed to create a Ledger.
     */
    data: XOR<LedgerCreateInput, LedgerUncheckedCreateInput>
  }

  /**
   * Ledger createMany
   */
  export type LedgerCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Ledgers.
     */
    data: LedgerCreateManyInput | LedgerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Ledger createManyAndReturn
   */
  export type LedgerCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ledger
     */
    select?: LedgerSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Ledger
     */
    omit?: LedgerOmit<ExtArgs> | null
    /**
     * The data used to create many Ledgers.
     */
    data: LedgerCreateManyInput | LedgerCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LedgerIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Ledger update
   */
  export type LedgerUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ledger
     */
    select?: LedgerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ledger
     */
    omit?: LedgerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LedgerInclude<ExtArgs> | null
    /**
     * The data needed to update a Ledger.
     */
    data: XOR<LedgerUpdateInput, LedgerUncheckedUpdateInput>
    /**
     * Choose, which Ledger to update.
     */
    where: LedgerWhereUniqueInput
  }

  /**
   * Ledger updateMany
   */
  export type LedgerUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Ledgers.
     */
    data: XOR<LedgerUpdateManyMutationInput, LedgerUncheckedUpdateManyInput>
    /**
     * Filter which Ledgers to update
     */
    where?: LedgerWhereInput
    /**
     * Limit how many Ledgers to update.
     */
    limit?: number
  }

  /**
   * Ledger updateManyAndReturn
   */
  export type LedgerUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ledger
     */
    select?: LedgerSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Ledger
     */
    omit?: LedgerOmit<ExtArgs> | null
    /**
     * The data used to update Ledgers.
     */
    data: XOR<LedgerUpdateManyMutationInput, LedgerUncheckedUpdateManyInput>
    /**
     * Filter which Ledgers to update
     */
    where?: LedgerWhereInput
    /**
     * Limit how many Ledgers to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LedgerIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Ledger upsert
   */
  export type LedgerUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ledger
     */
    select?: LedgerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ledger
     */
    omit?: LedgerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LedgerInclude<ExtArgs> | null
    /**
     * The filter to search for the Ledger to update in case it exists.
     */
    where: LedgerWhereUniqueInput
    /**
     * In case the Ledger found by the `where` argument doesn't exist, create a new Ledger with this data.
     */
    create: XOR<LedgerCreateInput, LedgerUncheckedCreateInput>
    /**
     * In case the Ledger was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LedgerUpdateInput, LedgerUncheckedUpdateInput>
  }

  /**
   * Ledger delete
   */
  export type LedgerDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ledger
     */
    select?: LedgerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ledger
     */
    omit?: LedgerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LedgerInclude<ExtArgs> | null
    /**
     * Filter which Ledger to delete.
     */
    where: LedgerWhereUniqueInput
  }

  /**
   * Ledger deleteMany
   */
  export type LedgerDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Ledgers to delete
     */
    where?: LedgerWhereInput
    /**
     * Limit how many Ledgers to delete.
     */
    limit?: number
  }

  /**
   * Ledger without action
   */
  export type LedgerDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ledger
     */
    select?: LedgerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ledger
     */
    omit?: LedgerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LedgerInclude<ExtArgs> | null
  }


  /**
   * Model AdminSession
   */

  export type AggregateAdminSession = {
    _count: AdminSessionCountAggregateOutputType | null
    _min: AdminSessionMinAggregateOutputType | null
    _max: AdminSessionMaxAggregateOutputType | null
  }

  export type AdminSessionMinAggregateOutputType = {
    id: string | null
    user_id: string | null
    username: string | null
    name: string | null
    role: string | null
    token: string | null
    login_at: Date | null
    last_seen_at: Date | null
    expires_at: Date | null
    ip_address: string | null
    user_agent: string | null
    avatar_url: string | null
  }

  export type AdminSessionMaxAggregateOutputType = {
    id: string | null
    user_id: string | null
    username: string | null
    name: string | null
    role: string | null
    token: string | null
    login_at: Date | null
    last_seen_at: Date | null
    expires_at: Date | null
    ip_address: string | null
    user_agent: string | null
    avatar_url: string | null
  }

  export type AdminSessionCountAggregateOutputType = {
    id: number
    user_id: number
    username: number
    name: number
    role: number
    token: number
    login_at: number
    last_seen_at: number
    expires_at: number
    ip_address: number
    user_agent: number
    avatar_url: number
    _all: number
  }


  export type AdminSessionMinAggregateInputType = {
    id?: true
    user_id?: true
    username?: true
    name?: true
    role?: true
    token?: true
    login_at?: true
    last_seen_at?: true
    expires_at?: true
    ip_address?: true
    user_agent?: true
    avatar_url?: true
  }

  export type AdminSessionMaxAggregateInputType = {
    id?: true
    user_id?: true
    username?: true
    name?: true
    role?: true
    token?: true
    login_at?: true
    last_seen_at?: true
    expires_at?: true
    ip_address?: true
    user_agent?: true
    avatar_url?: true
  }

  export type AdminSessionCountAggregateInputType = {
    id?: true
    user_id?: true
    username?: true
    name?: true
    role?: true
    token?: true
    login_at?: true
    last_seen_at?: true
    expires_at?: true
    ip_address?: true
    user_agent?: true
    avatar_url?: true
    _all?: true
  }

  export type AdminSessionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AdminSession to aggregate.
     */
    where?: AdminSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AdminSessions to fetch.
     */
    orderBy?: AdminSessionOrderByWithRelationInput | AdminSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AdminSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AdminSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AdminSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AdminSessions
    **/
    _count?: true | AdminSessionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AdminSessionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AdminSessionMaxAggregateInputType
  }

  export type GetAdminSessionAggregateType<T extends AdminSessionAggregateArgs> = {
        [P in keyof T & keyof AggregateAdminSession]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAdminSession[P]>
      : GetScalarType<T[P], AggregateAdminSession[P]>
  }




  export type AdminSessionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AdminSessionWhereInput
    orderBy?: AdminSessionOrderByWithAggregationInput | AdminSessionOrderByWithAggregationInput[]
    by: AdminSessionScalarFieldEnum[] | AdminSessionScalarFieldEnum
    having?: AdminSessionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AdminSessionCountAggregateInputType | true
    _min?: AdminSessionMinAggregateInputType
    _max?: AdminSessionMaxAggregateInputType
  }

  export type AdminSessionGroupByOutputType = {
    id: string
    user_id: string
    username: string
    name: string | null
    role: string
    token: string
    login_at: Date
    last_seen_at: Date
    expires_at: Date
    ip_address: string | null
    user_agent: string | null
    avatar_url: string | null
    _count: AdminSessionCountAggregateOutputType | null
    _min: AdminSessionMinAggregateOutputType | null
    _max: AdminSessionMaxAggregateOutputType | null
  }

  type GetAdminSessionGroupByPayload<T extends AdminSessionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AdminSessionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AdminSessionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AdminSessionGroupByOutputType[P]>
            : GetScalarType<T[P], AdminSessionGroupByOutputType[P]>
        }
      >
    >


  export type AdminSessionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    user_id?: boolean
    username?: boolean
    name?: boolean
    role?: boolean
    token?: boolean
    login_at?: boolean
    last_seen_at?: boolean
    expires_at?: boolean
    ip_address?: boolean
    user_agent?: boolean
    avatar_url?: boolean
  }, ExtArgs["result"]["adminSession"]>

  export type AdminSessionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    user_id?: boolean
    username?: boolean
    name?: boolean
    role?: boolean
    token?: boolean
    login_at?: boolean
    last_seen_at?: boolean
    expires_at?: boolean
    ip_address?: boolean
    user_agent?: boolean
    avatar_url?: boolean
  }, ExtArgs["result"]["adminSession"]>

  export type AdminSessionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    user_id?: boolean
    username?: boolean
    name?: boolean
    role?: boolean
    token?: boolean
    login_at?: boolean
    last_seen_at?: boolean
    expires_at?: boolean
    ip_address?: boolean
    user_agent?: boolean
    avatar_url?: boolean
  }, ExtArgs["result"]["adminSession"]>

  export type AdminSessionSelectScalar = {
    id?: boolean
    user_id?: boolean
    username?: boolean
    name?: boolean
    role?: boolean
    token?: boolean
    login_at?: boolean
    last_seen_at?: boolean
    expires_at?: boolean
    ip_address?: boolean
    user_agent?: boolean
    avatar_url?: boolean
  }

  export type AdminSessionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "user_id" | "username" | "name" | "role" | "token" | "login_at" | "last_seen_at" | "expires_at" | "ip_address" | "user_agent" | "avatar_url", ExtArgs["result"]["adminSession"]>

  export type $AdminSessionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AdminSession"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      user_id: string
      username: string
      name: string | null
      role: string
      token: string
      login_at: Date
      last_seen_at: Date
      expires_at: Date
      ip_address: string | null
      user_agent: string | null
      avatar_url: string | null
    }, ExtArgs["result"]["adminSession"]>
    composites: {}
  }

  type AdminSessionGetPayload<S extends boolean | null | undefined | AdminSessionDefaultArgs> = $Result.GetResult<Prisma.$AdminSessionPayload, S>

  type AdminSessionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AdminSessionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AdminSessionCountAggregateInputType | true
    }

  export interface AdminSessionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AdminSession'], meta: { name: 'AdminSession' } }
    /**
     * Find zero or one AdminSession that matches the filter.
     * @param {AdminSessionFindUniqueArgs} args - Arguments to find a AdminSession
     * @example
     * // Get one AdminSession
     * const adminSession = await prisma.adminSession.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AdminSessionFindUniqueArgs>(args: SelectSubset<T, AdminSessionFindUniqueArgs<ExtArgs>>): Prisma__AdminSessionClient<$Result.GetResult<Prisma.$AdminSessionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AdminSession that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AdminSessionFindUniqueOrThrowArgs} args - Arguments to find a AdminSession
     * @example
     * // Get one AdminSession
     * const adminSession = await prisma.adminSession.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AdminSessionFindUniqueOrThrowArgs>(args: SelectSubset<T, AdminSessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AdminSessionClient<$Result.GetResult<Prisma.$AdminSessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AdminSession that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminSessionFindFirstArgs} args - Arguments to find a AdminSession
     * @example
     * // Get one AdminSession
     * const adminSession = await prisma.adminSession.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AdminSessionFindFirstArgs>(args?: SelectSubset<T, AdminSessionFindFirstArgs<ExtArgs>>): Prisma__AdminSessionClient<$Result.GetResult<Prisma.$AdminSessionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AdminSession that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminSessionFindFirstOrThrowArgs} args - Arguments to find a AdminSession
     * @example
     * // Get one AdminSession
     * const adminSession = await prisma.adminSession.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AdminSessionFindFirstOrThrowArgs>(args?: SelectSubset<T, AdminSessionFindFirstOrThrowArgs<ExtArgs>>): Prisma__AdminSessionClient<$Result.GetResult<Prisma.$AdminSessionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AdminSessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminSessionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AdminSessions
     * const adminSessions = await prisma.adminSession.findMany()
     * 
     * // Get first 10 AdminSessions
     * const adminSessions = await prisma.adminSession.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const adminSessionWithIdOnly = await prisma.adminSession.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AdminSessionFindManyArgs>(args?: SelectSubset<T, AdminSessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AdminSessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AdminSession.
     * @param {AdminSessionCreateArgs} args - Arguments to create a AdminSession.
     * @example
     * // Create one AdminSession
     * const AdminSession = await prisma.adminSession.create({
     *   data: {
     *     // ... data to create a AdminSession
     *   }
     * })
     * 
     */
    create<T extends AdminSessionCreateArgs>(args: SelectSubset<T, AdminSessionCreateArgs<ExtArgs>>): Prisma__AdminSessionClient<$Result.GetResult<Prisma.$AdminSessionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AdminSessions.
     * @param {AdminSessionCreateManyArgs} args - Arguments to create many AdminSessions.
     * @example
     * // Create many AdminSessions
     * const adminSession = await prisma.adminSession.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AdminSessionCreateManyArgs>(args?: SelectSubset<T, AdminSessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AdminSessions and returns the data saved in the database.
     * @param {AdminSessionCreateManyAndReturnArgs} args - Arguments to create many AdminSessions.
     * @example
     * // Create many AdminSessions
     * const adminSession = await prisma.adminSession.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AdminSessions and only return the `id`
     * const adminSessionWithIdOnly = await prisma.adminSession.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AdminSessionCreateManyAndReturnArgs>(args?: SelectSubset<T, AdminSessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AdminSessionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AdminSession.
     * @param {AdminSessionDeleteArgs} args - Arguments to delete one AdminSession.
     * @example
     * // Delete one AdminSession
     * const AdminSession = await prisma.adminSession.delete({
     *   where: {
     *     // ... filter to delete one AdminSession
     *   }
     * })
     * 
     */
    delete<T extends AdminSessionDeleteArgs>(args: SelectSubset<T, AdminSessionDeleteArgs<ExtArgs>>): Prisma__AdminSessionClient<$Result.GetResult<Prisma.$AdminSessionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AdminSession.
     * @param {AdminSessionUpdateArgs} args - Arguments to update one AdminSession.
     * @example
     * // Update one AdminSession
     * const adminSession = await prisma.adminSession.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AdminSessionUpdateArgs>(args: SelectSubset<T, AdminSessionUpdateArgs<ExtArgs>>): Prisma__AdminSessionClient<$Result.GetResult<Prisma.$AdminSessionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AdminSessions.
     * @param {AdminSessionDeleteManyArgs} args - Arguments to filter AdminSessions to delete.
     * @example
     * // Delete a few AdminSessions
     * const { count } = await prisma.adminSession.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AdminSessionDeleteManyArgs>(args?: SelectSubset<T, AdminSessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AdminSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminSessionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AdminSessions
     * const adminSession = await prisma.adminSession.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AdminSessionUpdateManyArgs>(args: SelectSubset<T, AdminSessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AdminSessions and returns the data updated in the database.
     * @param {AdminSessionUpdateManyAndReturnArgs} args - Arguments to update many AdminSessions.
     * @example
     * // Update many AdminSessions
     * const adminSession = await prisma.adminSession.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AdminSessions and only return the `id`
     * const adminSessionWithIdOnly = await prisma.adminSession.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AdminSessionUpdateManyAndReturnArgs>(args: SelectSubset<T, AdminSessionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AdminSessionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AdminSession.
     * @param {AdminSessionUpsertArgs} args - Arguments to update or create a AdminSession.
     * @example
     * // Update or create a AdminSession
     * const adminSession = await prisma.adminSession.upsert({
     *   create: {
     *     // ... data to create a AdminSession
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AdminSession we want to update
     *   }
     * })
     */
    upsert<T extends AdminSessionUpsertArgs>(args: SelectSubset<T, AdminSessionUpsertArgs<ExtArgs>>): Prisma__AdminSessionClient<$Result.GetResult<Prisma.$AdminSessionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AdminSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminSessionCountArgs} args - Arguments to filter AdminSessions to count.
     * @example
     * // Count the number of AdminSessions
     * const count = await prisma.adminSession.count({
     *   where: {
     *     // ... the filter for the AdminSessions we want to count
     *   }
     * })
    **/
    count<T extends AdminSessionCountArgs>(
      args?: Subset<T, AdminSessionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AdminSessionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AdminSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminSessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AdminSessionAggregateArgs>(args: Subset<T, AdminSessionAggregateArgs>): Prisma.PrismaPromise<GetAdminSessionAggregateType<T>>

    /**
     * Group by AdminSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminSessionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AdminSessionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AdminSessionGroupByArgs['orderBy'] }
        : { orderBy?: AdminSessionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AdminSessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAdminSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AdminSession model
   */
  readonly fields: AdminSessionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AdminSession.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AdminSessionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AdminSession model
   */
  interface AdminSessionFieldRefs {
    readonly id: FieldRef<"AdminSession", 'String'>
    readonly user_id: FieldRef<"AdminSession", 'String'>
    readonly username: FieldRef<"AdminSession", 'String'>
    readonly name: FieldRef<"AdminSession", 'String'>
    readonly role: FieldRef<"AdminSession", 'String'>
    readonly token: FieldRef<"AdminSession", 'String'>
    readonly login_at: FieldRef<"AdminSession", 'DateTime'>
    readonly last_seen_at: FieldRef<"AdminSession", 'DateTime'>
    readonly expires_at: FieldRef<"AdminSession", 'DateTime'>
    readonly ip_address: FieldRef<"AdminSession", 'String'>
    readonly user_agent: FieldRef<"AdminSession", 'String'>
    readonly avatar_url: FieldRef<"AdminSession", 'String'>
  }
    

  // Custom InputTypes
  /**
   * AdminSession findUnique
   */
  export type AdminSessionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminSession
     */
    select?: AdminSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminSession
     */
    omit?: AdminSessionOmit<ExtArgs> | null
    /**
     * Filter, which AdminSession to fetch.
     */
    where: AdminSessionWhereUniqueInput
  }

  /**
   * AdminSession findUniqueOrThrow
   */
  export type AdminSessionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminSession
     */
    select?: AdminSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminSession
     */
    omit?: AdminSessionOmit<ExtArgs> | null
    /**
     * Filter, which AdminSession to fetch.
     */
    where: AdminSessionWhereUniqueInput
  }

  /**
   * AdminSession findFirst
   */
  export type AdminSessionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminSession
     */
    select?: AdminSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminSession
     */
    omit?: AdminSessionOmit<ExtArgs> | null
    /**
     * Filter, which AdminSession to fetch.
     */
    where?: AdminSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AdminSessions to fetch.
     */
    orderBy?: AdminSessionOrderByWithRelationInput | AdminSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AdminSessions.
     */
    cursor?: AdminSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AdminSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AdminSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AdminSessions.
     */
    distinct?: AdminSessionScalarFieldEnum | AdminSessionScalarFieldEnum[]
  }

  /**
   * AdminSession findFirstOrThrow
   */
  export type AdminSessionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminSession
     */
    select?: AdminSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminSession
     */
    omit?: AdminSessionOmit<ExtArgs> | null
    /**
     * Filter, which AdminSession to fetch.
     */
    where?: AdminSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AdminSessions to fetch.
     */
    orderBy?: AdminSessionOrderByWithRelationInput | AdminSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AdminSessions.
     */
    cursor?: AdminSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AdminSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AdminSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AdminSessions.
     */
    distinct?: AdminSessionScalarFieldEnum | AdminSessionScalarFieldEnum[]
  }

  /**
   * AdminSession findMany
   */
  export type AdminSessionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminSession
     */
    select?: AdminSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminSession
     */
    omit?: AdminSessionOmit<ExtArgs> | null
    /**
     * Filter, which AdminSessions to fetch.
     */
    where?: AdminSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AdminSessions to fetch.
     */
    orderBy?: AdminSessionOrderByWithRelationInput | AdminSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AdminSessions.
     */
    cursor?: AdminSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AdminSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AdminSessions.
     */
    skip?: number
    distinct?: AdminSessionScalarFieldEnum | AdminSessionScalarFieldEnum[]
  }

  /**
   * AdminSession create
   */
  export type AdminSessionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminSession
     */
    select?: AdminSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminSession
     */
    omit?: AdminSessionOmit<ExtArgs> | null
    /**
     * The data needed to create a AdminSession.
     */
    data: XOR<AdminSessionCreateInput, AdminSessionUncheckedCreateInput>
  }

  /**
   * AdminSession createMany
   */
  export type AdminSessionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AdminSessions.
     */
    data: AdminSessionCreateManyInput | AdminSessionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AdminSession createManyAndReturn
   */
  export type AdminSessionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminSession
     */
    select?: AdminSessionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AdminSession
     */
    omit?: AdminSessionOmit<ExtArgs> | null
    /**
     * The data used to create many AdminSessions.
     */
    data: AdminSessionCreateManyInput | AdminSessionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AdminSession update
   */
  export type AdminSessionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminSession
     */
    select?: AdminSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminSession
     */
    omit?: AdminSessionOmit<ExtArgs> | null
    /**
     * The data needed to update a AdminSession.
     */
    data: XOR<AdminSessionUpdateInput, AdminSessionUncheckedUpdateInput>
    /**
     * Choose, which AdminSession to update.
     */
    where: AdminSessionWhereUniqueInput
  }

  /**
   * AdminSession updateMany
   */
  export type AdminSessionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AdminSessions.
     */
    data: XOR<AdminSessionUpdateManyMutationInput, AdminSessionUncheckedUpdateManyInput>
    /**
     * Filter which AdminSessions to update
     */
    where?: AdminSessionWhereInput
    /**
     * Limit how many AdminSessions to update.
     */
    limit?: number
  }

  /**
   * AdminSession updateManyAndReturn
   */
  export type AdminSessionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminSession
     */
    select?: AdminSessionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AdminSession
     */
    omit?: AdminSessionOmit<ExtArgs> | null
    /**
     * The data used to update AdminSessions.
     */
    data: XOR<AdminSessionUpdateManyMutationInput, AdminSessionUncheckedUpdateManyInput>
    /**
     * Filter which AdminSessions to update
     */
    where?: AdminSessionWhereInput
    /**
     * Limit how many AdminSessions to update.
     */
    limit?: number
  }

  /**
   * AdminSession upsert
   */
  export type AdminSessionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminSession
     */
    select?: AdminSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminSession
     */
    omit?: AdminSessionOmit<ExtArgs> | null
    /**
     * The filter to search for the AdminSession to update in case it exists.
     */
    where: AdminSessionWhereUniqueInput
    /**
     * In case the AdminSession found by the `where` argument doesn't exist, create a new AdminSession with this data.
     */
    create: XOR<AdminSessionCreateInput, AdminSessionUncheckedCreateInput>
    /**
     * In case the AdminSession was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AdminSessionUpdateInput, AdminSessionUncheckedUpdateInput>
  }

  /**
   * AdminSession delete
   */
  export type AdminSessionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminSession
     */
    select?: AdminSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminSession
     */
    omit?: AdminSessionOmit<ExtArgs> | null
    /**
     * Filter which AdminSession to delete.
     */
    where: AdminSessionWhereUniqueInput
  }

  /**
   * AdminSession deleteMany
   */
  export type AdminSessionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AdminSessions to delete
     */
    where?: AdminSessionWhereInput
    /**
     * Limit how many AdminSessions to delete.
     */
    limit?: number
  }

  /**
   * AdminSession without action
   */
  export type AdminSessionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminSession
     */
    select?: AdminSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminSession
     */
    omit?: AdminSessionOmit<ExtArgs> | null
  }


  /**
   * Model AuditLog
   */

  export type AggregateAuditLog = {
    _count: AuditLogCountAggregateOutputType | null
    _min: AuditLogMinAggregateOutputType | null
    _max: AuditLogMaxAggregateOutputType | null
  }

  export type AuditLogMinAggregateOutputType = {
    id: string | null
    user_id: string | null
    username: string | null
    name: string | null
    role: string | null
    action: string | null
    details: string | null
    ip_address: string | null
    user_agent: string | null
    created_at: Date | null
  }

  export type AuditLogMaxAggregateOutputType = {
    id: string | null
    user_id: string | null
    username: string | null
    name: string | null
    role: string | null
    action: string | null
    details: string | null
    ip_address: string | null
    user_agent: string | null
    created_at: Date | null
  }

  export type AuditLogCountAggregateOutputType = {
    id: number
    user_id: number
    username: number
    name: number
    role: number
    action: number
    details: number
    ip_address: number
    user_agent: number
    created_at: number
    _all: number
  }


  export type AuditLogMinAggregateInputType = {
    id?: true
    user_id?: true
    username?: true
    name?: true
    role?: true
    action?: true
    details?: true
    ip_address?: true
    user_agent?: true
    created_at?: true
  }

  export type AuditLogMaxAggregateInputType = {
    id?: true
    user_id?: true
    username?: true
    name?: true
    role?: true
    action?: true
    details?: true
    ip_address?: true
    user_agent?: true
    created_at?: true
  }

  export type AuditLogCountAggregateInputType = {
    id?: true
    user_id?: true
    username?: true
    name?: true
    role?: true
    action?: true
    details?: true
    ip_address?: true
    user_agent?: true
    created_at?: true
    _all?: true
  }

  export type AuditLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditLog to aggregate.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AuditLogs
    **/
    _count?: true | AuditLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AuditLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AuditLogMaxAggregateInputType
  }

  export type GetAuditLogAggregateType<T extends AuditLogAggregateArgs> = {
        [P in keyof T & keyof AggregateAuditLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAuditLog[P]>
      : GetScalarType<T[P], AggregateAuditLog[P]>
  }




  export type AuditLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuditLogWhereInput
    orderBy?: AuditLogOrderByWithAggregationInput | AuditLogOrderByWithAggregationInput[]
    by: AuditLogScalarFieldEnum[] | AuditLogScalarFieldEnum
    having?: AuditLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AuditLogCountAggregateInputType | true
    _min?: AuditLogMinAggregateInputType
    _max?: AuditLogMaxAggregateInputType
  }

  export type AuditLogGroupByOutputType = {
    id: string
    user_id: string | null
    username: string
    name: string | null
    role: string
    action: string
    details: string
    ip_address: string | null
    user_agent: string | null
    created_at: Date
    _count: AuditLogCountAggregateOutputType | null
    _min: AuditLogMinAggregateOutputType | null
    _max: AuditLogMaxAggregateOutputType | null
  }

  type GetAuditLogGroupByPayload<T extends AuditLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AuditLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AuditLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AuditLogGroupByOutputType[P]>
            : GetScalarType<T[P], AuditLogGroupByOutputType[P]>
        }
      >
    >


  export type AuditLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    user_id?: boolean
    username?: boolean
    name?: boolean
    role?: boolean
    action?: boolean
    details?: boolean
    ip_address?: boolean
    user_agent?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["auditLog"]>

  export type AuditLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    user_id?: boolean
    username?: boolean
    name?: boolean
    role?: boolean
    action?: boolean
    details?: boolean
    ip_address?: boolean
    user_agent?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["auditLog"]>

  export type AuditLogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    user_id?: boolean
    username?: boolean
    name?: boolean
    role?: boolean
    action?: boolean
    details?: boolean
    ip_address?: boolean
    user_agent?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["auditLog"]>

  export type AuditLogSelectScalar = {
    id?: boolean
    user_id?: boolean
    username?: boolean
    name?: boolean
    role?: boolean
    action?: boolean
    details?: boolean
    ip_address?: boolean
    user_agent?: boolean
    created_at?: boolean
  }

  export type AuditLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "user_id" | "username" | "name" | "role" | "action" | "details" | "ip_address" | "user_agent" | "created_at", ExtArgs["result"]["auditLog"]>

  export type $AuditLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AuditLog"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      user_id: string | null
      username: string
      name: string | null
      role: string
      action: string
      details: string
      ip_address: string | null
      user_agent: string | null
      created_at: Date
    }, ExtArgs["result"]["auditLog"]>
    composites: {}
  }

  type AuditLogGetPayload<S extends boolean | null | undefined | AuditLogDefaultArgs> = $Result.GetResult<Prisma.$AuditLogPayload, S>

  type AuditLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AuditLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AuditLogCountAggregateInputType | true
    }

  export interface AuditLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AuditLog'], meta: { name: 'AuditLog' } }
    /**
     * Find zero or one AuditLog that matches the filter.
     * @param {AuditLogFindUniqueArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AuditLogFindUniqueArgs>(args: SelectSubset<T, AuditLogFindUniqueArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AuditLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AuditLogFindUniqueOrThrowArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AuditLogFindUniqueOrThrowArgs>(args: SelectSubset<T, AuditLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuditLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindFirstArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AuditLogFindFirstArgs>(args?: SelectSubset<T, AuditLogFindFirstArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuditLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindFirstOrThrowArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AuditLogFindFirstOrThrowArgs>(args?: SelectSubset<T, AuditLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AuditLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AuditLogs
     * const auditLogs = await prisma.auditLog.findMany()
     * 
     * // Get first 10 AuditLogs
     * const auditLogs = await prisma.auditLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AuditLogFindManyArgs>(args?: SelectSubset<T, AuditLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AuditLog.
     * @param {AuditLogCreateArgs} args - Arguments to create a AuditLog.
     * @example
     * // Create one AuditLog
     * const AuditLog = await prisma.auditLog.create({
     *   data: {
     *     // ... data to create a AuditLog
     *   }
     * })
     * 
     */
    create<T extends AuditLogCreateArgs>(args: SelectSubset<T, AuditLogCreateArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AuditLogs.
     * @param {AuditLogCreateManyArgs} args - Arguments to create many AuditLogs.
     * @example
     * // Create many AuditLogs
     * const auditLog = await prisma.auditLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AuditLogCreateManyArgs>(args?: SelectSubset<T, AuditLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AuditLogs and returns the data saved in the database.
     * @param {AuditLogCreateManyAndReturnArgs} args - Arguments to create many AuditLogs.
     * @example
     * // Create many AuditLogs
     * const auditLog = await prisma.auditLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AuditLogs and only return the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AuditLogCreateManyAndReturnArgs>(args?: SelectSubset<T, AuditLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AuditLog.
     * @param {AuditLogDeleteArgs} args - Arguments to delete one AuditLog.
     * @example
     * // Delete one AuditLog
     * const AuditLog = await prisma.auditLog.delete({
     *   where: {
     *     // ... filter to delete one AuditLog
     *   }
     * })
     * 
     */
    delete<T extends AuditLogDeleteArgs>(args: SelectSubset<T, AuditLogDeleteArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AuditLog.
     * @param {AuditLogUpdateArgs} args - Arguments to update one AuditLog.
     * @example
     * // Update one AuditLog
     * const auditLog = await prisma.auditLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AuditLogUpdateArgs>(args: SelectSubset<T, AuditLogUpdateArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AuditLogs.
     * @param {AuditLogDeleteManyArgs} args - Arguments to filter AuditLogs to delete.
     * @example
     * // Delete a few AuditLogs
     * const { count } = await prisma.auditLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AuditLogDeleteManyArgs>(args?: SelectSubset<T, AuditLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AuditLogs
     * const auditLog = await prisma.auditLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AuditLogUpdateManyArgs>(args: SelectSubset<T, AuditLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuditLogs and returns the data updated in the database.
     * @param {AuditLogUpdateManyAndReturnArgs} args - Arguments to update many AuditLogs.
     * @example
     * // Update many AuditLogs
     * const auditLog = await prisma.auditLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AuditLogs and only return the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AuditLogUpdateManyAndReturnArgs>(args: SelectSubset<T, AuditLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AuditLog.
     * @param {AuditLogUpsertArgs} args - Arguments to update or create a AuditLog.
     * @example
     * // Update or create a AuditLog
     * const auditLog = await prisma.auditLog.upsert({
     *   create: {
     *     // ... data to create a AuditLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AuditLog we want to update
     *   }
     * })
     */
    upsert<T extends AuditLogUpsertArgs>(args: SelectSubset<T, AuditLogUpsertArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogCountArgs} args - Arguments to filter AuditLogs to count.
     * @example
     * // Count the number of AuditLogs
     * const count = await prisma.auditLog.count({
     *   where: {
     *     // ... the filter for the AuditLogs we want to count
     *   }
     * })
    **/
    count<T extends AuditLogCountArgs>(
      args?: Subset<T, AuditLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AuditLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AuditLogAggregateArgs>(args: Subset<T, AuditLogAggregateArgs>): Prisma.PrismaPromise<GetAuditLogAggregateType<T>>

    /**
     * Group by AuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AuditLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AuditLogGroupByArgs['orderBy'] }
        : { orderBy?: AuditLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AuditLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuditLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AuditLog model
   */
  readonly fields: AuditLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AuditLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AuditLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AuditLog model
   */
  interface AuditLogFieldRefs {
    readonly id: FieldRef<"AuditLog", 'String'>
    readonly user_id: FieldRef<"AuditLog", 'String'>
    readonly username: FieldRef<"AuditLog", 'String'>
    readonly name: FieldRef<"AuditLog", 'String'>
    readonly role: FieldRef<"AuditLog", 'String'>
    readonly action: FieldRef<"AuditLog", 'String'>
    readonly details: FieldRef<"AuditLog", 'String'>
    readonly ip_address: FieldRef<"AuditLog", 'String'>
    readonly user_agent: FieldRef<"AuditLog", 'String'>
    readonly created_at: FieldRef<"AuditLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AuditLog findUnique
   */
  export type AuditLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog findUniqueOrThrow
   */
  export type AuditLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog findFirst
   */
  export type AuditLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog findFirstOrThrow
   */
  export type AuditLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog findMany
   */
  export type AuditLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Filter, which AuditLogs to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog create
   */
  export type AuditLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * The data needed to create a AuditLog.
     */
    data: XOR<AuditLogCreateInput, AuditLogUncheckedCreateInput>
  }

  /**
   * AuditLog createMany
   */
  export type AuditLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AuditLogs.
     */
    data: AuditLogCreateManyInput | AuditLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AuditLog createManyAndReturn
   */
  export type AuditLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * The data used to create many AuditLogs.
     */
    data: AuditLogCreateManyInput | AuditLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AuditLog update
   */
  export type AuditLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * The data needed to update a AuditLog.
     */
    data: XOR<AuditLogUpdateInput, AuditLogUncheckedUpdateInput>
    /**
     * Choose, which AuditLog to update.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog updateMany
   */
  export type AuditLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AuditLogs.
     */
    data: XOR<AuditLogUpdateManyMutationInput, AuditLogUncheckedUpdateManyInput>
    /**
     * Filter which AuditLogs to update
     */
    where?: AuditLogWhereInput
    /**
     * Limit how many AuditLogs to update.
     */
    limit?: number
  }

  /**
   * AuditLog updateManyAndReturn
   */
  export type AuditLogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * The data used to update AuditLogs.
     */
    data: XOR<AuditLogUpdateManyMutationInput, AuditLogUncheckedUpdateManyInput>
    /**
     * Filter which AuditLogs to update
     */
    where?: AuditLogWhereInput
    /**
     * Limit how many AuditLogs to update.
     */
    limit?: number
  }

  /**
   * AuditLog upsert
   */
  export type AuditLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * The filter to search for the AuditLog to update in case it exists.
     */
    where: AuditLogWhereUniqueInput
    /**
     * In case the AuditLog found by the `where` argument doesn't exist, create a new AuditLog with this data.
     */
    create: XOR<AuditLogCreateInput, AuditLogUncheckedCreateInput>
    /**
     * In case the AuditLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AuditLogUpdateInput, AuditLogUncheckedUpdateInput>
  }

  /**
   * AuditLog delete
   */
  export type AuditLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Filter which AuditLog to delete.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog deleteMany
   */
  export type AuditLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditLogs to delete
     */
    where?: AuditLogWhereInput
    /**
     * Limit how many AuditLogs to delete.
     */
    limit?: number
  }

  /**
   * AuditLog without action
   */
  export type AuditLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    username: 'username',
    name: 'name',
    password: 'password',
    role: 'role',
    is_active: 'is_active',
    gender: 'gender',
    phone: 'phone',
    avatar_url: 'avatar_url',
    assigned_customer_ids: 'assigned_customer_ids',
    created_at: 'created_at',
    updated_at: 'updated_at',
    deleted_at: 'deleted_at'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const CustomerScalarFieldEnum: {
    id: 'id',
    customer_code: 'customer_code',
    name: 'name',
    avatar_url: 'avatar_url',
    created_at: 'created_at',
    deleted_at: 'deleted_at'
  };

  export type CustomerScalarFieldEnum = (typeof CustomerScalarFieldEnum)[keyof typeof CustomerScalarFieldEnum]


  export const DailyBookScalarFieldEnum: {
    id: 'id',
    date: 'date',
    is_closed: 'is_closed',
    created_at: 'created_at',
    deleted_at: 'deleted_at'
  };

  export type DailyBookScalarFieldEnum = (typeof DailyBookScalarFieldEnum)[keyof typeof DailyBookScalarFieldEnum]


  export const DailyBookItemScalarFieldEnum: {
    id: 'id',
    daily_book_id: 'daily_book_id',
    customer_id: 'customer_id',
    kg: 'kg',
    present: 'present',
    note: 'note',
    deleted_at: 'deleted_at'
  };

  export type DailyBookItemScalarFieldEnum = (typeof DailyBookItemScalarFieldEnum)[keyof typeof DailyBookItemScalarFieldEnum]


  export const LedgerScalarFieldEnum: {
    id: 'id',
    customer_id: 'customer_id',
    type: 'type',
    reference_date: 'reference_date',
    kg: 'kg',
    price_per_kg: 'price_per_kg',
    amount: 'amount',
    previous_debt: 'previous_debt',
    new_debt: 'new_debt',
    note: 'note',
    receipt_id: 'receipt_id',
    maqal_id: 'maqal_id',
    created_at: 'created_at',
    deleted_at: 'deleted_at'
  };

  export type LedgerScalarFieldEnum = (typeof LedgerScalarFieldEnum)[keyof typeof LedgerScalarFieldEnum]


  export const AdminSessionScalarFieldEnum: {
    id: 'id',
    user_id: 'user_id',
    username: 'username',
    name: 'name',
    role: 'role',
    token: 'token',
    login_at: 'login_at',
    last_seen_at: 'last_seen_at',
    expires_at: 'expires_at',
    ip_address: 'ip_address',
    user_agent: 'user_agent',
    avatar_url: 'avatar_url'
  };

  export type AdminSessionScalarFieldEnum = (typeof AdminSessionScalarFieldEnum)[keyof typeof AdminSessionScalarFieldEnum]


  export const AuditLogScalarFieldEnum: {
    id: 'id',
    user_id: 'user_id',
    username: 'username',
    name: 'name',
    role: 'role',
    action: 'action',
    details: 'details',
    ip_address: 'ip_address',
    user_agent: 'user_agent',
    created_at: 'created_at'
  };

  export type AuditLogScalarFieldEnum = (typeof AuditLogScalarFieldEnum)[keyof typeof AuditLogScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Role'
   */
  export type EnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role'>
    


  /**
   * Reference to a field of type 'Role[]'
   */
  export type ListEnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'LedgerType'
   */
  export type EnumLedgerTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'LedgerType'>
    


  /**
   * Reference to a field of type 'LedgerType[]'
   */
  export type ListEnumLedgerTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'LedgerType[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    username?: StringFilter<"User"> | string
    name?: StringNullableFilter<"User"> | string | null
    password?: StringFilter<"User"> | string
    role?: EnumRoleFilter<"User"> | $Enums.Role
    is_active?: BoolFilter<"User"> | boolean
    gender?: StringNullableFilter<"User"> | string | null
    phone?: StringNullableFilter<"User"> | string | null
    avatar_url?: StringNullableFilter<"User"> | string | null
    assigned_customer_ids?: StringNullableListFilter<"User">
    created_at?: DateTimeFilter<"User"> | Date | string
    updated_at?: DateTimeFilter<"User"> | Date | string
    deleted_at?: DateTimeNullableFilter<"User"> | Date | string | null
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    username?: SortOrder
    name?: SortOrderInput | SortOrder
    password?: SortOrder
    role?: SortOrder
    is_active?: SortOrder
    gender?: SortOrderInput | SortOrder
    phone?: SortOrderInput | SortOrder
    avatar_url?: SortOrderInput | SortOrder
    assigned_customer_ids?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    deleted_at?: SortOrderInput | SortOrder
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    username?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringNullableFilter<"User"> | string | null
    password?: StringFilter<"User"> | string
    role?: EnumRoleFilter<"User"> | $Enums.Role
    is_active?: BoolFilter<"User"> | boolean
    gender?: StringNullableFilter<"User"> | string | null
    phone?: StringNullableFilter<"User"> | string | null
    avatar_url?: StringNullableFilter<"User"> | string | null
    assigned_customer_ids?: StringNullableListFilter<"User">
    created_at?: DateTimeFilter<"User"> | Date | string
    updated_at?: DateTimeFilter<"User"> | Date | string
    deleted_at?: DateTimeNullableFilter<"User"> | Date | string | null
  }, "id" | "email" | "username">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    username?: SortOrder
    name?: SortOrderInput | SortOrder
    password?: SortOrder
    role?: SortOrder
    is_active?: SortOrder
    gender?: SortOrderInput | SortOrder
    phone?: SortOrderInput | SortOrder
    avatar_url?: SortOrderInput | SortOrder
    assigned_customer_ids?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    deleted_at?: SortOrderInput | SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    username?: StringWithAggregatesFilter<"User"> | string
    name?: StringNullableWithAggregatesFilter<"User"> | string | null
    password?: StringWithAggregatesFilter<"User"> | string
    role?: EnumRoleWithAggregatesFilter<"User"> | $Enums.Role
    is_active?: BoolWithAggregatesFilter<"User"> | boolean
    gender?: StringNullableWithAggregatesFilter<"User"> | string | null
    phone?: StringNullableWithAggregatesFilter<"User"> | string | null
    avatar_url?: StringNullableWithAggregatesFilter<"User"> | string | null
    assigned_customer_ids?: StringNullableListFilter<"User">
    created_at?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"User"> | Date | string
    deleted_at?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
  }

  export type CustomerWhereInput = {
    AND?: CustomerWhereInput | CustomerWhereInput[]
    OR?: CustomerWhereInput[]
    NOT?: CustomerWhereInput | CustomerWhereInput[]
    id?: StringFilter<"Customer"> | string
    customer_code?: StringFilter<"Customer"> | string
    name?: StringFilter<"Customer"> | string
    avatar_url?: StringNullableFilter<"Customer"> | string | null
    created_at?: DateTimeFilter<"Customer"> | Date | string
    deleted_at?: DateTimeNullableFilter<"Customer"> | Date | string | null
    daily_items?: DailyBookItemListRelationFilter
    ledger_items?: LedgerListRelationFilter
  }

  export type CustomerOrderByWithRelationInput = {
    id?: SortOrder
    customer_code?: SortOrder
    name?: SortOrder
    avatar_url?: SortOrderInput | SortOrder
    created_at?: SortOrder
    deleted_at?: SortOrderInput | SortOrder
    daily_items?: DailyBookItemOrderByRelationAggregateInput
    ledger_items?: LedgerOrderByRelationAggregateInput
  }

  export type CustomerWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    customer_code?: string
    AND?: CustomerWhereInput | CustomerWhereInput[]
    OR?: CustomerWhereInput[]
    NOT?: CustomerWhereInput | CustomerWhereInput[]
    name?: StringFilter<"Customer"> | string
    avatar_url?: StringNullableFilter<"Customer"> | string | null
    created_at?: DateTimeFilter<"Customer"> | Date | string
    deleted_at?: DateTimeNullableFilter<"Customer"> | Date | string | null
    daily_items?: DailyBookItemListRelationFilter
    ledger_items?: LedgerListRelationFilter
  }, "id" | "customer_code">

  export type CustomerOrderByWithAggregationInput = {
    id?: SortOrder
    customer_code?: SortOrder
    name?: SortOrder
    avatar_url?: SortOrderInput | SortOrder
    created_at?: SortOrder
    deleted_at?: SortOrderInput | SortOrder
    _count?: CustomerCountOrderByAggregateInput
    _max?: CustomerMaxOrderByAggregateInput
    _min?: CustomerMinOrderByAggregateInput
  }

  export type CustomerScalarWhereWithAggregatesInput = {
    AND?: CustomerScalarWhereWithAggregatesInput | CustomerScalarWhereWithAggregatesInput[]
    OR?: CustomerScalarWhereWithAggregatesInput[]
    NOT?: CustomerScalarWhereWithAggregatesInput | CustomerScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Customer"> | string
    customer_code?: StringWithAggregatesFilter<"Customer"> | string
    name?: StringWithAggregatesFilter<"Customer"> | string
    avatar_url?: StringNullableWithAggregatesFilter<"Customer"> | string | null
    created_at?: DateTimeWithAggregatesFilter<"Customer"> | Date | string
    deleted_at?: DateTimeNullableWithAggregatesFilter<"Customer"> | Date | string | null
  }

  export type DailyBookWhereInput = {
    AND?: DailyBookWhereInput | DailyBookWhereInput[]
    OR?: DailyBookWhereInput[]
    NOT?: DailyBookWhereInput | DailyBookWhereInput[]
    id?: StringFilter<"DailyBook"> | string
    date?: DateTimeFilter<"DailyBook"> | Date | string
    is_closed?: BoolFilter<"DailyBook"> | boolean
    created_at?: DateTimeFilter<"DailyBook"> | Date | string
    deleted_at?: DateTimeNullableFilter<"DailyBook"> | Date | string | null
    items?: DailyBookItemListRelationFilter
  }

  export type DailyBookOrderByWithRelationInput = {
    id?: SortOrder
    date?: SortOrder
    is_closed?: SortOrder
    created_at?: SortOrder
    deleted_at?: SortOrderInput | SortOrder
    items?: DailyBookItemOrderByRelationAggregateInput
  }

  export type DailyBookWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    date?: Date | string
    AND?: DailyBookWhereInput | DailyBookWhereInput[]
    OR?: DailyBookWhereInput[]
    NOT?: DailyBookWhereInput | DailyBookWhereInput[]
    is_closed?: BoolFilter<"DailyBook"> | boolean
    created_at?: DateTimeFilter<"DailyBook"> | Date | string
    deleted_at?: DateTimeNullableFilter<"DailyBook"> | Date | string | null
    items?: DailyBookItemListRelationFilter
  }, "id" | "date">

  export type DailyBookOrderByWithAggregationInput = {
    id?: SortOrder
    date?: SortOrder
    is_closed?: SortOrder
    created_at?: SortOrder
    deleted_at?: SortOrderInput | SortOrder
    _count?: DailyBookCountOrderByAggregateInput
    _max?: DailyBookMaxOrderByAggregateInput
    _min?: DailyBookMinOrderByAggregateInput
  }

  export type DailyBookScalarWhereWithAggregatesInput = {
    AND?: DailyBookScalarWhereWithAggregatesInput | DailyBookScalarWhereWithAggregatesInput[]
    OR?: DailyBookScalarWhereWithAggregatesInput[]
    NOT?: DailyBookScalarWhereWithAggregatesInput | DailyBookScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DailyBook"> | string
    date?: DateTimeWithAggregatesFilter<"DailyBook"> | Date | string
    is_closed?: BoolWithAggregatesFilter<"DailyBook"> | boolean
    created_at?: DateTimeWithAggregatesFilter<"DailyBook"> | Date | string
    deleted_at?: DateTimeNullableWithAggregatesFilter<"DailyBook"> | Date | string | null
  }

  export type DailyBookItemWhereInput = {
    AND?: DailyBookItemWhereInput | DailyBookItemWhereInput[]
    OR?: DailyBookItemWhereInput[]
    NOT?: DailyBookItemWhereInput | DailyBookItemWhereInput[]
    id?: StringFilter<"DailyBookItem"> | string
    daily_book_id?: StringFilter<"DailyBookItem"> | string
    customer_id?: StringFilter<"DailyBookItem"> | string
    kg?: FloatFilter<"DailyBookItem"> | number
    present?: BoolFilter<"DailyBookItem"> | boolean
    note?: StringNullableFilter<"DailyBookItem"> | string | null
    deleted_at?: DateTimeNullableFilter<"DailyBookItem"> | Date | string | null
    daily_book?: XOR<DailyBookScalarRelationFilter, DailyBookWhereInput>
    customer?: XOR<CustomerScalarRelationFilter, CustomerWhereInput>
  }

  export type DailyBookItemOrderByWithRelationInput = {
    id?: SortOrder
    daily_book_id?: SortOrder
    customer_id?: SortOrder
    kg?: SortOrder
    present?: SortOrder
    note?: SortOrderInput | SortOrder
    deleted_at?: SortOrderInput | SortOrder
    daily_book?: DailyBookOrderByWithRelationInput
    customer?: CustomerOrderByWithRelationInput
  }

  export type DailyBookItemWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DailyBookItemWhereInput | DailyBookItemWhereInput[]
    OR?: DailyBookItemWhereInput[]
    NOT?: DailyBookItemWhereInput | DailyBookItemWhereInput[]
    daily_book_id?: StringFilter<"DailyBookItem"> | string
    customer_id?: StringFilter<"DailyBookItem"> | string
    kg?: FloatFilter<"DailyBookItem"> | number
    present?: BoolFilter<"DailyBookItem"> | boolean
    note?: StringNullableFilter<"DailyBookItem"> | string | null
    deleted_at?: DateTimeNullableFilter<"DailyBookItem"> | Date | string | null
    daily_book?: XOR<DailyBookScalarRelationFilter, DailyBookWhereInput>
    customer?: XOR<CustomerScalarRelationFilter, CustomerWhereInput>
  }, "id">

  export type DailyBookItemOrderByWithAggregationInput = {
    id?: SortOrder
    daily_book_id?: SortOrder
    customer_id?: SortOrder
    kg?: SortOrder
    present?: SortOrder
    note?: SortOrderInput | SortOrder
    deleted_at?: SortOrderInput | SortOrder
    _count?: DailyBookItemCountOrderByAggregateInput
    _avg?: DailyBookItemAvgOrderByAggregateInput
    _max?: DailyBookItemMaxOrderByAggregateInput
    _min?: DailyBookItemMinOrderByAggregateInput
    _sum?: DailyBookItemSumOrderByAggregateInput
  }

  export type DailyBookItemScalarWhereWithAggregatesInput = {
    AND?: DailyBookItemScalarWhereWithAggregatesInput | DailyBookItemScalarWhereWithAggregatesInput[]
    OR?: DailyBookItemScalarWhereWithAggregatesInput[]
    NOT?: DailyBookItemScalarWhereWithAggregatesInput | DailyBookItemScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DailyBookItem"> | string
    daily_book_id?: StringWithAggregatesFilter<"DailyBookItem"> | string
    customer_id?: StringWithAggregatesFilter<"DailyBookItem"> | string
    kg?: FloatWithAggregatesFilter<"DailyBookItem"> | number
    present?: BoolWithAggregatesFilter<"DailyBookItem"> | boolean
    note?: StringNullableWithAggregatesFilter<"DailyBookItem"> | string | null
    deleted_at?: DateTimeNullableWithAggregatesFilter<"DailyBookItem"> | Date | string | null
  }

  export type LedgerWhereInput = {
    AND?: LedgerWhereInput | LedgerWhereInput[]
    OR?: LedgerWhereInput[]
    NOT?: LedgerWhereInput | LedgerWhereInput[]
    id?: StringFilter<"Ledger"> | string
    customer_id?: StringFilter<"Ledger"> | string
    type?: EnumLedgerTypeFilter<"Ledger"> | $Enums.LedgerType
    reference_date?: DateTimeNullableFilter<"Ledger"> | Date | string | null
    kg?: FloatNullableFilter<"Ledger"> | number | null
    price_per_kg?: FloatNullableFilter<"Ledger"> | number | null
    amount?: FloatFilter<"Ledger"> | number
    previous_debt?: FloatFilter<"Ledger"> | number
    new_debt?: FloatFilter<"Ledger"> | number
    note?: StringNullableFilter<"Ledger"> | string | null
    receipt_id?: StringNullableFilter<"Ledger"> | string | null
    maqal_id?: IntNullableFilter<"Ledger"> | number | null
    created_at?: DateTimeFilter<"Ledger"> | Date | string
    deleted_at?: DateTimeNullableFilter<"Ledger"> | Date | string | null
    customer?: XOR<CustomerScalarRelationFilter, CustomerWhereInput>
  }

  export type LedgerOrderByWithRelationInput = {
    id?: SortOrder
    customer_id?: SortOrder
    type?: SortOrder
    reference_date?: SortOrderInput | SortOrder
    kg?: SortOrderInput | SortOrder
    price_per_kg?: SortOrderInput | SortOrder
    amount?: SortOrder
    previous_debt?: SortOrder
    new_debt?: SortOrder
    note?: SortOrderInput | SortOrder
    receipt_id?: SortOrderInput | SortOrder
    maqal_id?: SortOrderInput | SortOrder
    created_at?: SortOrder
    deleted_at?: SortOrderInput | SortOrder
    customer?: CustomerOrderByWithRelationInput
  }

  export type LedgerWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: LedgerWhereInput | LedgerWhereInput[]
    OR?: LedgerWhereInput[]
    NOT?: LedgerWhereInput | LedgerWhereInput[]
    customer_id?: StringFilter<"Ledger"> | string
    type?: EnumLedgerTypeFilter<"Ledger"> | $Enums.LedgerType
    reference_date?: DateTimeNullableFilter<"Ledger"> | Date | string | null
    kg?: FloatNullableFilter<"Ledger"> | number | null
    price_per_kg?: FloatNullableFilter<"Ledger"> | number | null
    amount?: FloatFilter<"Ledger"> | number
    previous_debt?: FloatFilter<"Ledger"> | number
    new_debt?: FloatFilter<"Ledger"> | number
    note?: StringNullableFilter<"Ledger"> | string | null
    receipt_id?: StringNullableFilter<"Ledger"> | string | null
    maqal_id?: IntNullableFilter<"Ledger"> | number | null
    created_at?: DateTimeFilter<"Ledger"> | Date | string
    deleted_at?: DateTimeNullableFilter<"Ledger"> | Date | string | null
    customer?: XOR<CustomerScalarRelationFilter, CustomerWhereInput>
  }, "id">

  export type LedgerOrderByWithAggregationInput = {
    id?: SortOrder
    customer_id?: SortOrder
    type?: SortOrder
    reference_date?: SortOrderInput | SortOrder
    kg?: SortOrderInput | SortOrder
    price_per_kg?: SortOrderInput | SortOrder
    amount?: SortOrder
    previous_debt?: SortOrder
    new_debt?: SortOrder
    note?: SortOrderInput | SortOrder
    receipt_id?: SortOrderInput | SortOrder
    maqal_id?: SortOrderInput | SortOrder
    created_at?: SortOrder
    deleted_at?: SortOrderInput | SortOrder
    _count?: LedgerCountOrderByAggregateInput
    _avg?: LedgerAvgOrderByAggregateInput
    _max?: LedgerMaxOrderByAggregateInput
    _min?: LedgerMinOrderByAggregateInput
    _sum?: LedgerSumOrderByAggregateInput
  }

  export type LedgerScalarWhereWithAggregatesInput = {
    AND?: LedgerScalarWhereWithAggregatesInput | LedgerScalarWhereWithAggregatesInput[]
    OR?: LedgerScalarWhereWithAggregatesInput[]
    NOT?: LedgerScalarWhereWithAggregatesInput | LedgerScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Ledger"> | string
    customer_id?: StringWithAggregatesFilter<"Ledger"> | string
    type?: EnumLedgerTypeWithAggregatesFilter<"Ledger"> | $Enums.LedgerType
    reference_date?: DateTimeNullableWithAggregatesFilter<"Ledger"> | Date | string | null
    kg?: FloatNullableWithAggregatesFilter<"Ledger"> | number | null
    price_per_kg?: FloatNullableWithAggregatesFilter<"Ledger"> | number | null
    amount?: FloatWithAggregatesFilter<"Ledger"> | number
    previous_debt?: FloatWithAggregatesFilter<"Ledger"> | number
    new_debt?: FloatWithAggregatesFilter<"Ledger"> | number
    note?: StringNullableWithAggregatesFilter<"Ledger"> | string | null
    receipt_id?: StringNullableWithAggregatesFilter<"Ledger"> | string | null
    maqal_id?: IntNullableWithAggregatesFilter<"Ledger"> | number | null
    created_at?: DateTimeWithAggregatesFilter<"Ledger"> | Date | string
    deleted_at?: DateTimeNullableWithAggregatesFilter<"Ledger"> | Date | string | null
  }

  export type AdminSessionWhereInput = {
    AND?: AdminSessionWhereInput | AdminSessionWhereInput[]
    OR?: AdminSessionWhereInput[]
    NOT?: AdminSessionWhereInput | AdminSessionWhereInput[]
    id?: UuidFilter<"AdminSession"> | string
    user_id?: StringFilter<"AdminSession"> | string
    username?: StringFilter<"AdminSession"> | string
    name?: StringNullableFilter<"AdminSession"> | string | null
    role?: StringFilter<"AdminSession"> | string
    token?: StringFilter<"AdminSession"> | string
    login_at?: DateTimeFilter<"AdminSession"> | Date | string
    last_seen_at?: DateTimeFilter<"AdminSession"> | Date | string
    expires_at?: DateTimeFilter<"AdminSession"> | Date | string
    ip_address?: StringNullableFilter<"AdminSession"> | string | null
    user_agent?: StringNullableFilter<"AdminSession"> | string | null
    avatar_url?: StringNullableFilter<"AdminSession"> | string | null
  }

  export type AdminSessionOrderByWithRelationInput = {
    id?: SortOrder
    user_id?: SortOrder
    username?: SortOrder
    name?: SortOrderInput | SortOrder
    role?: SortOrder
    token?: SortOrder
    login_at?: SortOrder
    last_seen_at?: SortOrder
    expires_at?: SortOrder
    ip_address?: SortOrderInput | SortOrder
    user_agent?: SortOrderInput | SortOrder
    avatar_url?: SortOrderInput | SortOrder
  }

  export type AdminSessionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    token?: string
    AND?: AdminSessionWhereInput | AdminSessionWhereInput[]
    OR?: AdminSessionWhereInput[]
    NOT?: AdminSessionWhereInput | AdminSessionWhereInput[]
    user_id?: StringFilter<"AdminSession"> | string
    username?: StringFilter<"AdminSession"> | string
    name?: StringNullableFilter<"AdminSession"> | string | null
    role?: StringFilter<"AdminSession"> | string
    login_at?: DateTimeFilter<"AdminSession"> | Date | string
    last_seen_at?: DateTimeFilter<"AdminSession"> | Date | string
    expires_at?: DateTimeFilter<"AdminSession"> | Date | string
    ip_address?: StringNullableFilter<"AdminSession"> | string | null
    user_agent?: StringNullableFilter<"AdminSession"> | string | null
    avatar_url?: StringNullableFilter<"AdminSession"> | string | null
  }, "id" | "token">

  export type AdminSessionOrderByWithAggregationInput = {
    id?: SortOrder
    user_id?: SortOrder
    username?: SortOrder
    name?: SortOrderInput | SortOrder
    role?: SortOrder
    token?: SortOrder
    login_at?: SortOrder
    last_seen_at?: SortOrder
    expires_at?: SortOrder
    ip_address?: SortOrderInput | SortOrder
    user_agent?: SortOrderInput | SortOrder
    avatar_url?: SortOrderInput | SortOrder
    _count?: AdminSessionCountOrderByAggregateInput
    _max?: AdminSessionMaxOrderByAggregateInput
    _min?: AdminSessionMinOrderByAggregateInput
  }

  export type AdminSessionScalarWhereWithAggregatesInput = {
    AND?: AdminSessionScalarWhereWithAggregatesInput | AdminSessionScalarWhereWithAggregatesInput[]
    OR?: AdminSessionScalarWhereWithAggregatesInput[]
    NOT?: AdminSessionScalarWhereWithAggregatesInput | AdminSessionScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"AdminSession"> | string
    user_id?: StringWithAggregatesFilter<"AdminSession"> | string
    username?: StringWithAggregatesFilter<"AdminSession"> | string
    name?: StringNullableWithAggregatesFilter<"AdminSession"> | string | null
    role?: StringWithAggregatesFilter<"AdminSession"> | string
    token?: StringWithAggregatesFilter<"AdminSession"> | string
    login_at?: DateTimeWithAggregatesFilter<"AdminSession"> | Date | string
    last_seen_at?: DateTimeWithAggregatesFilter<"AdminSession"> | Date | string
    expires_at?: DateTimeWithAggregatesFilter<"AdminSession"> | Date | string
    ip_address?: StringNullableWithAggregatesFilter<"AdminSession"> | string | null
    user_agent?: StringNullableWithAggregatesFilter<"AdminSession"> | string | null
    avatar_url?: StringNullableWithAggregatesFilter<"AdminSession"> | string | null
  }

  export type AuditLogWhereInput = {
    AND?: AuditLogWhereInput | AuditLogWhereInput[]
    OR?: AuditLogWhereInput[]
    NOT?: AuditLogWhereInput | AuditLogWhereInput[]
    id?: UuidFilter<"AuditLog"> | string
    user_id?: StringNullableFilter<"AuditLog"> | string | null
    username?: StringFilter<"AuditLog"> | string
    name?: StringNullableFilter<"AuditLog"> | string | null
    role?: StringFilter<"AuditLog"> | string
    action?: StringFilter<"AuditLog"> | string
    details?: StringFilter<"AuditLog"> | string
    ip_address?: StringNullableFilter<"AuditLog"> | string | null
    user_agent?: StringNullableFilter<"AuditLog"> | string | null
    created_at?: DateTimeFilter<"AuditLog"> | Date | string
  }

  export type AuditLogOrderByWithRelationInput = {
    id?: SortOrder
    user_id?: SortOrderInput | SortOrder
    username?: SortOrder
    name?: SortOrderInput | SortOrder
    role?: SortOrder
    action?: SortOrder
    details?: SortOrder
    ip_address?: SortOrderInput | SortOrder
    user_agent?: SortOrderInput | SortOrder
    created_at?: SortOrder
  }

  export type AuditLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AuditLogWhereInput | AuditLogWhereInput[]
    OR?: AuditLogWhereInput[]
    NOT?: AuditLogWhereInput | AuditLogWhereInput[]
    user_id?: StringNullableFilter<"AuditLog"> | string | null
    username?: StringFilter<"AuditLog"> | string
    name?: StringNullableFilter<"AuditLog"> | string | null
    role?: StringFilter<"AuditLog"> | string
    action?: StringFilter<"AuditLog"> | string
    details?: StringFilter<"AuditLog"> | string
    ip_address?: StringNullableFilter<"AuditLog"> | string | null
    user_agent?: StringNullableFilter<"AuditLog"> | string | null
    created_at?: DateTimeFilter<"AuditLog"> | Date | string
  }, "id">

  export type AuditLogOrderByWithAggregationInput = {
    id?: SortOrder
    user_id?: SortOrderInput | SortOrder
    username?: SortOrder
    name?: SortOrderInput | SortOrder
    role?: SortOrder
    action?: SortOrder
    details?: SortOrder
    ip_address?: SortOrderInput | SortOrder
    user_agent?: SortOrderInput | SortOrder
    created_at?: SortOrder
    _count?: AuditLogCountOrderByAggregateInput
    _max?: AuditLogMaxOrderByAggregateInput
    _min?: AuditLogMinOrderByAggregateInput
  }

  export type AuditLogScalarWhereWithAggregatesInput = {
    AND?: AuditLogScalarWhereWithAggregatesInput | AuditLogScalarWhereWithAggregatesInput[]
    OR?: AuditLogScalarWhereWithAggregatesInput[]
    NOT?: AuditLogScalarWhereWithAggregatesInput | AuditLogScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"AuditLog"> | string
    user_id?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    username?: StringWithAggregatesFilter<"AuditLog"> | string
    name?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    role?: StringWithAggregatesFilter<"AuditLog"> | string
    action?: StringWithAggregatesFilter<"AuditLog"> | string
    details?: StringWithAggregatesFilter<"AuditLog"> | string
    ip_address?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    user_agent?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    created_at?: DateTimeWithAggregatesFilter<"AuditLog"> | Date | string
  }

  export type UserCreateInput = {
    id?: string
    email: string
    username: string
    name?: string | null
    password: string
    role?: $Enums.Role
    is_active?: boolean
    gender?: string | null
    phone?: string | null
    avatar_url?: string | null
    assigned_customer_ids?: UserCreateassigned_customer_idsInput | string[]
    created_at?: Date | string
    updated_at?: Date | string
    deleted_at?: Date | string | null
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    username: string
    name?: string | null
    password: string
    role?: $Enums.Role
    is_active?: boolean
    gender?: string | null
    phone?: string | null
    avatar_url?: string | null
    assigned_customer_ids?: UserCreateassigned_customer_idsInput | string[]
    created_at?: Date | string
    updated_at?: Date | string
    deleted_at?: Date | string | null
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    is_active?: BoolFieldUpdateOperationsInput | boolean
    gender?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    avatar_url?: NullableStringFieldUpdateOperationsInput | string | null
    assigned_customer_ids?: UserUpdateassigned_customer_idsInput | string[]
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    is_active?: BoolFieldUpdateOperationsInput | boolean
    gender?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    avatar_url?: NullableStringFieldUpdateOperationsInput | string | null
    assigned_customer_ids?: UserUpdateassigned_customer_idsInput | string[]
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    username: string
    name?: string | null
    password: string
    role?: $Enums.Role
    is_active?: boolean
    gender?: string | null
    phone?: string | null
    avatar_url?: string | null
    assigned_customer_ids?: UserCreateassigned_customer_idsInput | string[]
    created_at?: Date | string
    updated_at?: Date | string
    deleted_at?: Date | string | null
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    is_active?: BoolFieldUpdateOperationsInput | boolean
    gender?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    avatar_url?: NullableStringFieldUpdateOperationsInput | string | null
    assigned_customer_ids?: UserUpdateassigned_customer_idsInput | string[]
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    is_active?: BoolFieldUpdateOperationsInput | boolean
    gender?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    avatar_url?: NullableStringFieldUpdateOperationsInput | string | null
    assigned_customer_ids?: UserUpdateassigned_customer_idsInput | string[]
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CustomerCreateInput = {
    id?: string
    customer_code: string
    name: string
    avatar_url?: string | null
    created_at?: Date | string
    deleted_at?: Date | string | null
    daily_items?: DailyBookItemCreateNestedManyWithoutCustomerInput
    ledger_items?: LedgerCreateNestedManyWithoutCustomerInput
  }

  export type CustomerUncheckedCreateInput = {
    id?: string
    customer_code: string
    name: string
    avatar_url?: string | null
    created_at?: Date | string
    deleted_at?: Date | string | null
    daily_items?: DailyBookItemUncheckedCreateNestedManyWithoutCustomerInput
    ledger_items?: LedgerUncheckedCreateNestedManyWithoutCustomerInput
  }

  export type CustomerUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    customer_code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    avatar_url?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    daily_items?: DailyBookItemUpdateManyWithoutCustomerNestedInput
    ledger_items?: LedgerUpdateManyWithoutCustomerNestedInput
  }

  export type CustomerUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    customer_code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    avatar_url?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    daily_items?: DailyBookItemUncheckedUpdateManyWithoutCustomerNestedInput
    ledger_items?: LedgerUncheckedUpdateManyWithoutCustomerNestedInput
  }

  export type CustomerCreateManyInput = {
    id?: string
    customer_code: string
    name: string
    avatar_url?: string | null
    created_at?: Date | string
    deleted_at?: Date | string | null
  }

  export type CustomerUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    customer_code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    avatar_url?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CustomerUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    customer_code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    avatar_url?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DailyBookCreateInput = {
    id?: string
    date: Date | string
    is_closed?: boolean
    created_at?: Date | string
    deleted_at?: Date | string | null
    items?: DailyBookItemCreateNestedManyWithoutDaily_bookInput
  }

  export type DailyBookUncheckedCreateInput = {
    id?: string
    date: Date | string
    is_closed?: boolean
    created_at?: Date | string
    deleted_at?: Date | string | null
    items?: DailyBookItemUncheckedCreateNestedManyWithoutDaily_bookInput
  }

  export type DailyBookUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    is_closed?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    items?: DailyBookItemUpdateManyWithoutDaily_bookNestedInput
  }

  export type DailyBookUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    is_closed?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    items?: DailyBookItemUncheckedUpdateManyWithoutDaily_bookNestedInput
  }

  export type DailyBookCreateManyInput = {
    id?: string
    date: Date | string
    is_closed?: boolean
    created_at?: Date | string
    deleted_at?: Date | string | null
  }

  export type DailyBookUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    is_closed?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DailyBookUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    is_closed?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DailyBookItemCreateInput = {
    id?: string
    kg: number
    present?: boolean
    note?: string | null
    deleted_at?: Date | string | null
    daily_book: DailyBookCreateNestedOneWithoutItemsInput
    customer: CustomerCreateNestedOneWithoutDaily_itemsInput
  }

  export type DailyBookItemUncheckedCreateInput = {
    id?: string
    daily_book_id: string
    customer_id: string
    kg: number
    present?: boolean
    note?: string | null
    deleted_at?: Date | string | null
  }

  export type DailyBookItemUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    kg?: FloatFieldUpdateOperationsInput | number
    present?: BoolFieldUpdateOperationsInput | boolean
    note?: NullableStringFieldUpdateOperationsInput | string | null
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    daily_book?: DailyBookUpdateOneRequiredWithoutItemsNestedInput
    customer?: CustomerUpdateOneRequiredWithoutDaily_itemsNestedInput
  }

  export type DailyBookItemUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    daily_book_id?: StringFieldUpdateOperationsInput | string
    customer_id?: StringFieldUpdateOperationsInput | string
    kg?: FloatFieldUpdateOperationsInput | number
    present?: BoolFieldUpdateOperationsInput | boolean
    note?: NullableStringFieldUpdateOperationsInput | string | null
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DailyBookItemCreateManyInput = {
    id?: string
    daily_book_id: string
    customer_id: string
    kg: number
    present?: boolean
    note?: string | null
    deleted_at?: Date | string | null
  }

  export type DailyBookItemUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    kg?: FloatFieldUpdateOperationsInput | number
    present?: BoolFieldUpdateOperationsInput | boolean
    note?: NullableStringFieldUpdateOperationsInput | string | null
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DailyBookItemUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    daily_book_id?: StringFieldUpdateOperationsInput | string
    customer_id?: StringFieldUpdateOperationsInput | string
    kg?: FloatFieldUpdateOperationsInput | number
    present?: BoolFieldUpdateOperationsInput | boolean
    note?: NullableStringFieldUpdateOperationsInput | string | null
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type LedgerCreateInput = {
    id?: string
    type: $Enums.LedgerType
    reference_date?: Date | string | null
    kg?: number | null
    price_per_kg?: number | null
    amount: number
    previous_debt: number
    new_debt: number
    note?: string | null
    receipt_id?: string | null
    maqal_id?: number | null
    created_at?: Date | string
    deleted_at?: Date | string | null
    customer: CustomerCreateNestedOneWithoutLedger_itemsInput
  }

  export type LedgerUncheckedCreateInput = {
    id?: string
    customer_id: string
    type: $Enums.LedgerType
    reference_date?: Date | string | null
    kg?: number | null
    price_per_kg?: number | null
    amount: number
    previous_debt: number
    new_debt: number
    note?: string | null
    receipt_id?: string | null
    maqal_id?: number | null
    created_at?: Date | string
    deleted_at?: Date | string | null
  }

  export type LedgerUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumLedgerTypeFieldUpdateOperationsInput | $Enums.LedgerType
    reference_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    kg?: NullableFloatFieldUpdateOperationsInput | number | null
    price_per_kg?: NullableFloatFieldUpdateOperationsInput | number | null
    amount?: FloatFieldUpdateOperationsInput | number
    previous_debt?: FloatFieldUpdateOperationsInput | number
    new_debt?: FloatFieldUpdateOperationsInput | number
    note?: NullableStringFieldUpdateOperationsInput | string | null
    receipt_id?: NullableStringFieldUpdateOperationsInput | string | null
    maqal_id?: NullableIntFieldUpdateOperationsInput | number | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    customer?: CustomerUpdateOneRequiredWithoutLedger_itemsNestedInput
  }

  export type LedgerUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    customer_id?: StringFieldUpdateOperationsInput | string
    type?: EnumLedgerTypeFieldUpdateOperationsInput | $Enums.LedgerType
    reference_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    kg?: NullableFloatFieldUpdateOperationsInput | number | null
    price_per_kg?: NullableFloatFieldUpdateOperationsInput | number | null
    amount?: FloatFieldUpdateOperationsInput | number
    previous_debt?: FloatFieldUpdateOperationsInput | number
    new_debt?: FloatFieldUpdateOperationsInput | number
    note?: NullableStringFieldUpdateOperationsInput | string | null
    receipt_id?: NullableStringFieldUpdateOperationsInput | string | null
    maqal_id?: NullableIntFieldUpdateOperationsInput | number | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type LedgerCreateManyInput = {
    id?: string
    customer_id: string
    type: $Enums.LedgerType
    reference_date?: Date | string | null
    kg?: number | null
    price_per_kg?: number | null
    amount: number
    previous_debt: number
    new_debt: number
    note?: string | null
    receipt_id?: string | null
    maqal_id?: number | null
    created_at?: Date | string
    deleted_at?: Date | string | null
  }

  export type LedgerUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumLedgerTypeFieldUpdateOperationsInput | $Enums.LedgerType
    reference_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    kg?: NullableFloatFieldUpdateOperationsInput | number | null
    price_per_kg?: NullableFloatFieldUpdateOperationsInput | number | null
    amount?: FloatFieldUpdateOperationsInput | number
    previous_debt?: FloatFieldUpdateOperationsInput | number
    new_debt?: FloatFieldUpdateOperationsInput | number
    note?: NullableStringFieldUpdateOperationsInput | string | null
    receipt_id?: NullableStringFieldUpdateOperationsInput | string | null
    maqal_id?: NullableIntFieldUpdateOperationsInput | number | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type LedgerUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    customer_id?: StringFieldUpdateOperationsInput | string
    type?: EnumLedgerTypeFieldUpdateOperationsInput | $Enums.LedgerType
    reference_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    kg?: NullableFloatFieldUpdateOperationsInput | number | null
    price_per_kg?: NullableFloatFieldUpdateOperationsInput | number | null
    amount?: FloatFieldUpdateOperationsInput | number
    previous_debt?: FloatFieldUpdateOperationsInput | number
    new_debt?: FloatFieldUpdateOperationsInput | number
    note?: NullableStringFieldUpdateOperationsInput | string | null
    receipt_id?: NullableStringFieldUpdateOperationsInput | string | null
    maqal_id?: NullableIntFieldUpdateOperationsInput | number | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type AdminSessionCreateInput = {
    id?: string
    user_id: string
    username: string
    name?: string | null
    role: string
    token: string
    login_at?: Date | string
    last_seen_at?: Date | string
    expires_at: Date | string
    ip_address?: string | null
    user_agent?: string | null
    avatar_url?: string | null
  }

  export type AdminSessionUncheckedCreateInput = {
    id?: string
    user_id: string
    username: string
    name?: string | null
    role: string
    token: string
    login_at?: Date | string
    last_seen_at?: Date | string
    expires_at: Date | string
    ip_address?: string | null
    user_agent?: string | null
    avatar_url?: string | null
  }

  export type AdminSessionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    login_at?: DateTimeFieldUpdateOperationsInput | Date | string
    last_seen_at?: DateTimeFieldUpdateOperationsInput | Date | string
    expires_at?: DateTimeFieldUpdateOperationsInput | Date | string
    ip_address?: NullableStringFieldUpdateOperationsInput | string | null
    user_agent?: NullableStringFieldUpdateOperationsInput | string | null
    avatar_url?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AdminSessionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    login_at?: DateTimeFieldUpdateOperationsInput | Date | string
    last_seen_at?: DateTimeFieldUpdateOperationsInput | Date | string
    expires_at?: DateTimeFieldUpdateOperationsInput | Date | string
    ip_address?: NullableStringFieldUpdateOperationsInput | string | null
    user_agent?: NullableStringFieldUpdateOperationsInput | string | null
    avatar_url?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AdminSessionCreateManyInput = {
    id?: string
    user_id: string
    username: string
    name?: string | null
    role: string
    token: string
    login_at?: Date | string
    last_seen_at?: Date | string
    expires_at: Date | string
    ip_address?: string | null
    user_agent?: string | null
    avatar_url?: string | null
  }

  export type AdminSessionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    login_at?: DateTimeFieldUpdateOperationsInput | Date | string
    last_seen_at?: DateTimeFieldUpdateOperationsInput | Date | string
    expires_at?: DateTimeFieldUpdateOperationsInput | Date | string
    ip_address?: NullableStringFieldUpdateOperationsInput | string | null
    user_agent?: NullableStringFieldUpdateOperationsInput | string | null
    avatar_url?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AdminSessionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    login_at?: DateTimeFieldUpdateOperationsInput | Date | string
    last_seen_at?: DateTimeFieldUpdateOperationsInput | Date | string
    expires_at?: DateTimeFieldUpdateOperationsInput | Date | string
    ip_address?: NullableStringFieldUpdateOperationsInput | string | null
    user_agent?: NullableStringFieldUpdateOperationsInput | string | null
    avatar_url?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AuditLogCreateInput = {
    id?: string
    user_id?: string | null
    username: string
    name?: string | null
    role: string
    action: string
    details: string
    ip_address?: string | null
    user_agent?: string | null
    created_at?: Date | string
  }

  export type AuditLogUncheckedCreateInput = {
    id?: string
    user_id?: string | null
    username: string
    name?: string | null
    role: string
    action: string
    details: string
    ip_address?: string | null
    user_agent?: string | null
    created_at?: Date | string
  }

  export type AuditLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    username?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    details?: StringFieldUpdateOperationsInput | string
    ip_address?: NullableStringFieldUpdateOperationsInput | string | null
    user_agent?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    username?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    details?: StringFieldUpdateOperationsInput | string
    ip_address?: NullableStringFieldUpdateOperationsInput | string | null
    user_agent?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogCreateManyInput = {
    id?: string
    user_id?: string | null
    username: string
    name?: string | null
    role: string
    action: string
    details: string
    ip_address?: string | null
    user_agent?: string | null
    created_at?: Date | string
  }

  export type AuditLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    username?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    details?: StringFieldUpdateOperationsInput | string
    ip_address?: NullableStringFieldUpdateOperationsInput | string | null
    user_agent?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    username?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    details?: StringFieldUpdateOperationsInput | string
    ip_address?: NullableStringFieldUpdateOperationsInput | string | null
    user_agent?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type EnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    username?: SortOrder
    name?: SortOrder
    password?: SortOrder
    role?: SortOrder
    is_active?: SortOrder
    gender?: SortOrder
    phone?: SortOrder
    avatar_url?: SortOrder
    assigned_customer_ids?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    deleted_at?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    username?: SortOrder
    name?: SortOrder
    password?: SortOrder
    role?: SortOrder
    is_active?: SortOrder
    gender?: SortOrder
    phone?: SortOrder
    avatar_url?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    deleted_at?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    username?: SortOrder
    name?: SortOrder
    password?: SortOrder
    role?: SortOrder
    is_active?: SortOrder
    gender?: SortOrder
    phone?: SortOrder
    avatar_url?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    deleted_at?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type EnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type DailyBookItemListRelationFilter = {
    every?: DailyBookItemWhereInput
    some?: DailyBookItemWhereInput
    none?: DailyBookItemWhereInput
  }

  export type LedgerListRelationFilter = {
    every?: LedgerWhereInput
    some?: LedgerWhereInput
    none?: LedgerWhereInput
  }

  export type DailyBookItemOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type LedgerOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CustomerCountOrderByAggregateInput = {
    id?: SortOrder
    customer_code?: SortOrder
    name?: SortOrder
    avatar_url?: SortOrder
    created_at?: SortOrder
    deleted_at?: SortOrder
  }

  export type CustomerMaxOrderByAggregateInput = {
    id?: SortOrder
    customer_code?: SortOrder
    name?: SortOrder
    avatar_url?: SortOrder
    created_at?: SortOrder
    deleted_at?: SortOrder
  }

  export type CustomerMinOrderByAggregateInput = {
    id?: SortOrder
    customer_code?: SortOrder
    name?: SortOrder
    avatar_url?: SortOrder
    created_at?: SortOrder
    deleted_at?: SortOrder
  }

  export type DailyBookCountOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    is_closed?: SortOrder
    created_at?: SortOrder
    deleted_at?: SortOrder
  }

  export type DailyBookMaxOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    is_closed?: SortOrder
    created_at?: SortOrder
    deleted_at?: SortOrder
  }

  export type DailyBookMinOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    is_closed?: SortOrder
    created_at?: SortOrder
    deleted_at?: SortOrder
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type DailyBookScalarRelationFilter = {
    is?: DailyBookWhereInput
    isNot?: DailyBookWhereInput
  }

  export type CustomerScalarRelationFilter = {
    is?: CustomerWhereInput
    isNot?: CustomerWhereInput
  }

  export type DailyBookItemCountOrderByAggregateInput = {
    id?: SortOrder
    daily_book_id?: SortOrder
    customer_id?: SortOrder
    kg?: SortOrder
    present?: SortOrder
    note?: SortOrder
    deleted_at?: SortOrder
  }

  export type DailyBookItemAvgOrderByAggregateInput = {
    kg?: SortOrder
  }

  export type DailyBookItemMaxOrderByAggregateInput = {
    id?: SortOrder
    daily_book_id?: SortOrder
    customer_id?: SortOrder
    kg?: SortOrder
    present?: SortOrder
    note?: SortOrder
    deleted_at?: SortOrder
  }

  export type DailyBookItemMinOrderByAggregateInput = {
    id?: SortOrder
    daily_book_id?: SortOrder
    customer_id?: SortOrder
    kg?: SortOrder
    present?: SortOrder
    note?: SortOrder
    deleted_at?: SortOrder
  }

  export type DailyBookItemSumOrderByAggregateInput = {
    kg?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type EnumLedgerTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.LedgerType | EnumLedgerTypeFieldRefInput<$PrismaModel>
    in?: $Enums.LedgerType[] | ListEnumLedgerTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.LedgerType[] | ListEnumLedgerTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumLedgerTypeFilter<$PrismaModel> | $Enums.LedgerType
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type LedgerCountOrderByAggregateInput = {
    id?: SortOrder
    customer_id?: SortOrder
    type?: SortOrder
    reference_date?: SortOrder
    kg?: SortOrder
    price_per_kg?: SortOrder
    amount?: SortOrder
    previous_debt?: SortOrder
    new_debt?: SortOrder
    note?: SortOrder
    receipt_id?: SortOrder
    maqal_id?: SortOrder
    created_at?: SortOrder
    deleted_at?: SortOrder
  }

  export type LedgerAvgOrderByAggregateInput = {
    kg?: SortOrder
    price_per_kg?: SortOrder
    amount?: SortOrder
    previous_debt?: SortOrder
    new_debt?: SortOrder
    maqal_id?: SortOrder
  }

  export type LedgerMaxOrderByAggregateInput = {
    id?: SortOrder
    customer_id?: SortOrder
    type?: SortOrder
    reference_date?: SortOrder
    kg?: SortOrder
    price_per_kg?: SortOrder
    amount?: SortOrder
    previous_debt?: SortOrder
    new_debt?: SortOrder
    note?: SortOrder
    receipt_id?: SortOrder
    maqal_id?: SortOrder
    created_at?: SortOrder
    deleted_at?: SortOrder
  }

  export type LedgerMinOrderByAggregateInput = {
    id?: SortOrder
    customer_id?: SortOrder
    type?: SortOrder
    reference_date?: SortOrder
    kg?: SortOrder
    price_per_kg?: SortOrder
    amount?: SortOrder
    previous_debt?: SortOrder
    new_debt?: SortOrder
    note?: SortOrder
    receipt_id?: SortOrder
    maqal_id?: SortOrder
    created_at?: SortOrder
    deleted_at?: SortOrder
  }

  export type LedgerSumOrderByAggregateInput = {
    kg?: SortOrder
    price_per_kg?: SortOrder
    amount?: SortOrder
    previous_debt?: SortOrder
    new_debt?: SortOrder
    maqal_id?: SortOrder
  }

  export type EnumLedgerTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.LedgerType | EnumLedgerTypeFieldRefInput<$PrismaModel>
    in?: $Enums.LedgerType[] | ListEnumLedgerTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.LedgerType[] | ListEnumLedgerTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumLedgerTypeWithAggregatesFilter<$PrismaModel> | $Enums.LedgerType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumLedgerTypeFilter<$PrismaModel>
    _max?: NestedEnumLedgerTypeFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type UuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type AdminSessionCountOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    username?: SortOrder
    name?: SortOrder
    role?: SortOrder
    token?: SortOrder
    login_at?: SortOrder
    last_seen_at?: SortOrder
    expires_at?: SortOrder
    ip_address?: SortOrder
    user_agent?: SortOrder
    avatar_url?: SortOrder
  }

  export type AdminSessionMaxOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    username?: SortOrder
    name?: SortOrder
    role?: SortOrder
    token?: SortOrder
    login_at?: SortOrder
    last_seen_at?: SortOrder
    expires_at?: SortOrder
    ip_address?: SortOrder
    user_agent?: SortOrder
    avatar_url?: SortOrder
  }

  export type AdminSessionMinOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    username?: SortOrder
    name?: SortOrder
    role?: SortOrder
    token?: SortOrder
    login_at?: SortOrder
    last_seen_at?: SortOrder
    expires_at?: SortOrder
    ip_address?: SortOrder
    user_agent?: SortOrder
    avatar_url?: SortOrder
  }

  export type UuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type AuditLogCountOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    username?: SortOrder
    name?: SortOrder
    role?: SortOrder
    action?: SortOrder
    details?: SortOrder
    ip_address?: SortOrder
    user_agent?: SortOrder
    created_at?: SortOrder
  }

  export type AuditLogMaxOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    username?: SortOrder
    name?: SortOrder
    role?: SortOrder
    action?: SortOrder
    details?: SortOrder
    ip_address?: SortOrder
    user_agent?: SortOrder
    created_at?: SortOrder
  }

  export type AuditLogMinOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    username?: SortOrder
    name?: SortOrder
    role?: SortOrder
    action?: SortOrder
    details?: SortOrder
    ip_address?: SortOrder
    user_agent?: SortOrder
    created_at?: SortOrder
  }

  export type UserCreateassigned_customer_idsInput = {
    set: string[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type EnumRoleFieldUpdateOperationsInput = {
    set?: $Enums.Role
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type UserUpdateassigned_customer_idsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type DailyBookItemCreateNestedManyWithoutCustomerInput = {
    create?: XOR<DailyBookItemCreateWithoutCustomerInput, DailyBookItemUncheckedCreateWithoutCustomerInput> | DailyBookItemCreateWithoutCustomerInput[] | DailyBookItemUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: DailyBookItemCreateOrConnectWithoutCustomerInput | DailyBookItemCreateOrConnectWithoutCustomerInput[]
    createMany?: DailyBookItemCreateManyCustomerInputEnvelope
    connect?: DailyBookItemWhereUniqueInput | DailyBookItemWhereUniqueInput[]
  }

  export type LedgerCreateNestedManyWithoutCustomerInput = {
    create?: XOR<LedgerCreateWithoutCustomerInput, LedgerUncheckedCreateWithoutCustomerInput> | LedgerCreateWithoutCustomerInput[] | LedgerUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: LedgerCreateOrConnectWithoutCustomerInput | LedgerCreateOrConnectWithoutCustomerInput[]
    createMany?: LedgerCreateManyCustomerInputEnvelope
    connect?: LedgerWhereUniqueInput | LedgerWhereUniqueInput[]
  }

  export type DailyBookItemUncheckedCreateNestedManyWithoutCustomerInput = {
    create?: XOR<DailyBookItemCreateWithoutCustomerInput, DailyBookItemUncheckedCreateWithoutCustomerInput> | DailyBookItemCreateWithoutCustomerInput[] | DailyBookItemUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: DailyBookItemCreateOrConnectWithoutCustomerInput | DailyBookItemCreateOrConnectWithoutCustomerInput[]
    createMany?: DailyBookItemCreateManyCustomerInputEnvelope
    connect?: DailyBookItemWhereUniqueInput | DailyBookItemWhereUniqueInput[]
  }

  export type LedgerUncheckedCreateNestedManyWithoutCustomerInput = {
    create?: XOR<LedgerCreateWithoutCustomerInput, LedgerUncheckedCreateWithoutCustomerInput> | LedgerCreateWithoutCustomerInput[] | LedgerUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: LedgerCreateOrConnectWithoutCustomerInput | LedgerCreateOrConnectWithoutCustomerInput[]
    createMany?: LedgerCreateManyCustomerInputEnvelope
    connect?: LedgerWhereUniqueInput | LedgerWhereUniqueInput[]
  }

  export type DailyBookItemUpdateManyWithoutCustomerNestedInput = {
    create?: XOR<DailyBookItemCreateWithoutCustomerInput, DailyBookItemUncheckedCreateWithoutCustomerInput> | DailyBookItemCreateWithoutCustomerInput[] | DailyBookItemUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: DailyBookItemCreateOrConnectWithoutCustomerInput | DailyBookItemCreateOrConnectWithoutCustomerInput[]
    upsert?: DailyBookItemUpsertWithWhereUniqueWithoutCustomerInput | DailyBookItemUpsertWithWhereUniqueWithoutCustomerInput[]
    createMany?: DailyBookItemCreateManyCustomerInputEnvelope
    set?: DailyBookItemWhereUniqueInput | DailyBookItemWhereUniqueInput[]
    disconnect?: DailyBookItemWhereUniqueInput | DailyBookItemWhereUniqueInput[]
    delete?: DailyBookItemWhereUniqueInput | DailyBookItemWhereUniqueInput[]
    connect?: DailyBookItemWhereUniqueInput | DailyBookItemWhereUniqueInput[]
    update?: DailyBookItemUpdateWithWhereUniqueWithoutCustomerInput | DailyBookItemUpdateWithWhereUniqueWithoutCustomerInput[]
    updateMany?: DailyBookItemUpdateManyWithWhereWithoutCustomerInput | DailyBookItemUpdateManyWithWhereWithoutCustomerInput[]
    deleteMany?: DailyBookItemScalarWhereInput | DailyBookItemScalarWhereInput[]
  }

  export type LedgerUpdateManyWithoutCustomerNestedInput = {
    create?: XOR<LedgerCreateWithoutCustomerInput, LedgerUncheckedCreateWithoutCustomerInput> | LedgerCreateWithoutCustomerInput[] | LedgerUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: LedgerCreateOrConnectWithoutCustomerInput | LedgerCreateOrConnectWithoutCustomerInput[]
    upsert?: LedgerUpsertWithWhereUniqueWithoutCustomerInput | LedgerUpsertWithWhereUniqueWithoutCustomerInput[]
    createMany?: LedgerCreateManyCustomerInputEnvelope
    set?: LedgerWhereUniqueInput | LedgerWhereUniqueInput[]
    disconnect?: LedgerWhereUniqueInput | LedgerWhereUniqueInput[]
    delete?: LedgerWhereUniqueInput | LedgerWhereUniqueInput[]
    connect?: LedgerWhereUniqueInput | LedgerWhereUniqueInput[]
    update?: LedgerUpdateWithWhereUniqueWithoutCustomerInput | LedgerUpdateWithWhereUniqueWithoutCustomerInput[]
    updateMany?: LedgerUpdateManyWithWhereWithoutCustomerInput | LedgerUpdateManyWithWhereWithoutCustomerInput[]
    deleteMany?: LedgerScalarWhereInput | LedgerScalarWhereInput[]
  }

  export type DailyBookItemUncheckedUpdateManyWithoutCustomerNestedInput = {
    create?: XOR<DailyBookItemCreateWithoutCustomerInput, DailyBookItemUncheckedCreateWithoutCustomerInput> | DailyBookItemCreateWithoutCustomerInput[] | DailyBookItemUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: DailyBookItemCreateOrConnectWithoutCustomerInput | DailyBookItemCreateOrConnectWithoutCustomerInput[]
    upsert?: DailyBookItemUpsertWithWhereUniqueWithoutCustomerInput | DailyBookItemUpsertWithWhereUniqueWithoutCustomerInput[]
    createMany?: DailyBookItemCreateManyCustomerInputEnvelope
    set?: DailyBookItemWhereUniqueInput | DailyBookItemWhereUniqueInput[]
    disconnect?: DailyBookItemWhereUniqueInput | DailyBookItemWhereUniqueInput[]
    delete?: DailyBookItemWhereUniqueInput | DailyBookItemWhereUniqueInput[]
    connect?: DailyBookItemWhereUniqueInput | DailyBookItemWhereUniqueInput[]
    update?: DailyBookItemUpdateWithWhereUniqueWithoutCustomerInput | DailyBookItemUpdateWithWhereUniqueWithoutCustomerInput[]
    updateMany?: DailyBookItemUpdateManyWithWhereWithoutCustomerInput | DailyBookItemUpdateManyWithWhereWithoutCustomerInput[]
    deleteMany?: DailyBookItemScalarWhereInput | DailyBookItemScalarWhereInput[]
  }

  export type LedgerUncheckedUpdateManyWithoutCustomerNestedInput = {
    create?: XOR<LedgerCreateWithoutCustomerInput, LedgerUncheckedCreateWithoutCustomerInput> | LedgerCreateWithoutCustomerInput[] | LedgerUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: LedgerCreateOrConnectWithoutCustomerInput | LedgerCreateOrConnectWithoutCustomerInput[]
    upsert?: LedgerUpsertWithWhereUniqueWithoutCustomerInput | LedgerUpsertWithWhereUniqueWithoutCustomerInput[]
    createMany?: LedgerCreateManyCustomerInputEnvelope
    set?: LedgerWhereUniqueInput | LedgerWhereUniqueInput[]
    disconnect?: LedgerWhereUniqueInput | LedgerWhereUniqueInput[]
    delete?: LedgerWhereUniqueInput | LedgerWhereUniqueInput[]
    connect?: LedgerWhereUniqueInput | LedgerWhereUniqueInput[]
    update?: LedgerUpdateWithWhereUniqueWithoutCustomerInput | LedgerUpdateWithWhereUniqueWithoutCustomerInput[]
    updateMany?: LedgerUpdateManyWithWhereWithoutCustomerInput | LedgerUpdateManyWithWhereWithoutCustomerInput[]
    deleteMany?: LedgerScalarWhereInput | LedgerScalarWhereInput[]
  }

  export type DailyBookItemCreateNestedManyWithoutDaily_bookInput = {
    create?: XOR<DailyBookItemCreateWithoutDaily_bookInput, DailyBookItemUncheckedCreateWithoutDaily_bookInput> | DailyBookItemCreateWithoutDaily_bookInput[] | DailyBookItemUncheckedCreateWithoutDaily_bookInput[]
    connectOrCreate?: DailyBookItemCreateOrConnectWithoutDaily_bookInput | DailyBookItemCreateOrConnectWithoutDaily_bookInput[]
    createMany?: DailyBookItemCreateManyDaily_bookInputEnvelope
    connect?: DailyBookItemWhereUniqueInput | DailyBookItemWhereUniqueInput[]
  }

  export type DailyBookItemUncheckedCreateNestedManyWithoutDaily_bookInput = {
    create?: XOR<DailyBookItemCreateWithoutDaily_bookInput, DailyBookItemUncheckedCreateWithoutDaily_bookInput> | DailyBookItemCreateWithoutDaily_bookInput[] | DailyBookItemUncheckedCreateWithoutDaily_bookInput[]
    connectOrCreate?: DailyBookItemCreateOrConnectWithoutDaily_bookInput | DailyBookItemCreateOrConnectWithoutDaily_bookInput[]
    createMany?: DailyBookItemCreateManyDaily_bookInputEnvelope
    connect?: DailyBookItemWhereUniqueInput | DailyBookItemWhereUniqueInput[]
  }

  export type DailyBookItemUpdateManyWithoutDaily_bookNestedInput = {
    create?: XOR<DailyBookItemCreateWithoutDaily_bookInput, DailyBookItemUncheckedCreateWithoutDaily_bookInput> | DailyBookItemCreateWithoutDaily_bookInput[] | DailyBookItemUncheckedCreateWithoutDaily_bookInput[]
    connectOrCreate?: DailyBookItemCreateOrConnectWithoutDaily_bookInput | DailyBookItemCreateOrConnectWithoutDaily_bookInput[]
    upsert?: DailyBookItemUpsertWithWhereUniqueWithoutDaily_bookInput | DailyBookItemUpsertWithWhereUniqueWithoutDaily_bookInput[]
    createMany?: DailyBookItemCreateManyDaily_bookInputEnvelope
    set?: DailyBookItemWhereUniqueInput | DailyBookItemWhereUniqueInput[]
    disconnect?: DailyBookItemWhereUniqueInput | DailyBookItemWhereUniqueInput[]
    delete?: DailyBookItemWhereUniqueInput | DailyBookItemWhereUniqueInput[]
    connect?: DailyBookItemWhereUniqueInput | DailyBookItemWhereUniqueInput[]
    update?: DailyBookItemUpdateWithWhereUniqueWithoutDaily_bookInput | DailyBookItemUpdateWithWhereUniqueWithoutDaily_bookInput[]
    updateMany?: DailyBookItemUpdateManyWithWhereWithoutDaily_bookInput | DailyBookItemUpdateManyWithWhereWithoutDaily_bookInput[]
    deleteMany?: DailyBookItemScalarWhereInput | DailyBookItemScalarWhereInput[]
  }

  export type DailyBookItemUncheckedUpdateManyWithoutDaily_bookNestedInput = {
    create?: XOR<DailyBookItemCreateWithoutDaily_bookInput, DailyBookItemUncheckedCreateWithoutDaily_bookInput> | DailyBookItemCreateWithoutDaily_bookInput[] | DailyBookItemUncheckedCreateWithoutDaily_bookInput[]
    connectOrCreate?: DailyBookItemCreateOrConnectWithoutDaily_bookInput | DailyBookItemCreateOrConnectWithoutDaily_bookInput[]
    upsert?: DailyBookItemUpsertWithWhereUniqueWithoutDaily_bookInput | DailyBookItemUpsertWithWhereUniqueWithoutDaily_bookInput[]
    createMany?: DailyBookItemCreateManyDaily_bookInputEnvelope
    set?: DailyBookItemWhereUniqueInput | DailyBookItemWhereUniqueInput[]
    disconnect?: DailyBookItemWhereUniqueInput | DailyBookItemWhereUniqueInput[]
    delete?: DailyBookItemWhereUniqueInput | DailyBookItemWhereUniqueInput[]
    connect?: DailyBookItemWhereUniqueInput | DailyBookItemWhereUniqueInput[]
    update?: DailyBookItemUpdateWithWhereUniqueWithoutDaily_bookInput | DailyBookItemUpdateWithWhereUniqueWithoutDaily_bookInput[]
    updateMany?: DailyBookItemUpdateManyWithWhereWithoutDaily_bookInput | DailyBookItemUpdateManyWithWhereWithoutDaily_bookInput[]
    deleteMany?: DailyBookItemScalarWhereInput | DailyBookItemScalarWhereInput[]
  }

  export type DailyBookCreateNestedOneWithoutItemsInput = {
    create?: XOR<DailyBookCreateWithoutItemsInput, DailyBookUncheckedCreateWithoutItemsInput>
    connectOrCreate?: DailyBookCreateOrConnectWithoutItemsInput
    connect?: DailyBookWhereUniqueInput
  }

  export type CustomerCreateNestedOneWithoutDaily_itemsInput = {
    create?: XOR<CustomerCreateWithoutDaily_itemsInput, CustomerUncheckedCreateWithoutDaily_itemsInput>
    connectOrCreate?: CustomerCreateOrConnectWithoutDaily_itemsInput
    connect?: CustomerWhereUniqueInput
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DailyBookUpdateOneRequiredWithoutItemsNestedInput = {
    create?: XOR<DailyBookCreateWithoutItemsInput, DailyBookUncheckedCreateWithoutItemsInput>
    connectOrCreate?: DailyBookCreateOrConnectWithoutItemsInput
    upsert?: DailyBookUpsertWithoutItemsInput
    connect?: DailyBookWhereUniqueInput
    update?: XOR<XOR<DailyBookUpdateToOneWithWhereWithoutItemsInput, DailyBookUpdateWithoutItemsInput>, DailyBookUncheckedUpdateWithoutItemsInput>
  }

  export type CustomerUpdateOneRequiredWithoutDaily_itemsNestedInput = {
    create?: XOR<CustomerCreateWithoutDaily_itemsInput, CustomerUncheckedCreateWithoutDaily_itemsInput>
    connectOrCreate?: CustomerCreateOrConnectWithoutDaily_itemsInput
    upsert?: CustomerUpsertWithoutDaily_itemsInput
    connect?: CustomerWhereUniqueInput
    update?: XOR<XOR<CustomerUpdateToOneWithWhereWithoutDaily_itemsInput, CustomerUpdateWithoutDaily_itemsInput>, CustomerUncheckedUpdateWithoutDaily_itemsInput>
  }

  export type CustomerCreateNestedOneWithoutLedger_itemsInput = {
    create?: XOR<CustomerCreateWithoutLedger_itemsInput, CustomerUncheckedCreateWithoutLedger_itemsInput>
    connectOrCreate?: CustomerCreateOrConnectWithoutLedger_itemsInput
    connect?: CustomerWhereUniqueInput
  }

  export type EnumLedgerTypeFieldUpdateOperationsInput = {
    set?: $Enums.LedgerType
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type CustomerUpdateOneRequiredWithoutLedger_itemsNestedInput = {
    create?: XOR<CustomerCreateWithoutLedger_itemsInput, CustomerUncheckedCreateWithoutLedger_itemsInput>
    connectOrCreate?: CustomerCreateOrConnectWithoutLedger_itemsInput
    upsert?: CustomerUpsertWithoutLedger_itemsInput
    connect?: CustomerWhereUniqueInput
    update?: XOR<XOR<CustomerUpdateToOneWithWhereWithoutLedger_itemsInput, CustomerUpdateWithoutLedger_itemsInput>, CustomerUncheckedUpdateWithoutLedger_itemsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedEnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedEnumLedgerTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.LedgerType | EnumLedgerTypeFieldRefInput<$PrismaModel>
    in?: $Enums.LedgerType[] | ListEnumLedgerTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.LedgerType[] | ListEnumLedgerTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumLedgerTypeFilter<$PrismaModel> | $Enums.LedgerType
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumLedgerTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.LedgerType | EnumLedgerTypeFieldRefInput<$PrismaModel>
    in?: $Enums.LedgerType[] | ListEnumLedgerTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.LedgerType[] | ListEnumLedgerTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumLedgerTypeWithAggregatesFilter<$PrismaModel> | $Enums.LedgerType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumLedgerTypeFilter<$PrismaModel>
    _max?: NestedEnumLedgerTypeFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedUuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type NestedUuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DailyBookItemCreateWithoutCustomerInput = {
    id?: string
    kg: number
    present?: boolean
    note?: string | null
    deleted_at?: Date | string | null
    daily_book: DailyBookCreateNestedOneWithoutItemsInput
  }

  export type DailyBookItemUncheckedCreateWithoutCustomerInput = {
    id?: string
    daily_book_id: string
    kg: number
    present?: boolean
    note?: string | null
    deleted_at?: Date | string | null
  }

  export type DailyBookItemCreateOrConnectWithoutCustomerInput = {
    where: DailyBookItemWhereUniqueInput
    create: XOR<DailyBookItemCreateWithoutCustomerInput, DailyBookItemUncheckedCreateWithoutCustomerInput>
  }

  export type DailyBookItemCreateManyCustomerInputEnvelope = {
    data: DailyBookItemCreateManyCustomerInput | DailyBookItemCreateManyCustomerInput[]
    skipDuplicates?: boolean
  }

  export type LedgerCreateWithoutCustomerInput = {
    id?: string
    type: $Enums.LedgerType
    reference_date?: Date | string | null
    kg?: number | null
    price_per_kg?: number | null
    amount: number
    previous_debt: number
    new_debt: number
    note?: string | null
    receipt_id?: string | null
    maqal_id?: number | null
    created_at?: Date | string
    deleted_at?: Date | string | null
  }

  export type LedgerUncheckedCreateWithoutCustomerInput = {
    id?: string
    type: $Enums.LedgerType
    reference_date?: Date | string | null
    kg?: number | null
    price_per_kg?: number | null
    amount: number
    previous_debt: number
    new_debt: number
    note?: string | null
    receipt_id?: string | null
    maqal_id?: number | null
    created_at?: Date | string
    deleted_at?: Date | string | null
  }

  export type LedgerCreateOrConnectWithoutCustomerInput = {
    where: LedgerWhereUniqueInput
    create: XOR<LedgerCreateWithoutCustomerInput, LedgerUncheckedCreateWithoutCustomerInput>
  }

  export type LedgerCreateManyCustomerInputEnvelope = {
    data: LedgerCreateManyCustomerInput | LedgerCreateManyCustomerInput[]
    skipDuplicates?: boolean
  }

  export type DailyBookItemUpsertWithWhereUniqueWithoutCustomerInput = {
    where: DailyBookItemWhereUniqueInput
    update: XOR<DailyBookItemUpdateWithoutCustomerInput, DailyBookItemUncheckedUpdateWithoutCustomerInput>
    create: XOR<DailyBookItemCreateWithoutCustomerInput, DailyBookItemUncheckedCreateWithoutCustomerInput>
  }

  export type DailyBookItemUpdateWithWhereUniqueWithoutCustomerInput = {
    where: DailyBookItemWhereUniqueInput
    data: XOR<DailyBookItemUpdateWithoutCustomerInput, DailyBookItemUncheckedUpdateWithoutCustomerInput>
  }

  export type DailyBookItemUpdateManyWithWhereWithoutCustomerInput = {
    where: DailyBookItemScalarWhereInput
    data: XOR<DailyBookItemUpdateManyMutationInput, DailyBookItemUncheckedUpdateManyWithoutCustomerInput>
  }

  export type DailyBookItemScalarWhereInput = {
    AND?: DailyBookItemScalarWhereInput | DailyBookItemScalarWhereInput[]
    OR?: DailyBookItemScalarWhereInput[]
    NOT?: DailyBookItemScalarWhereInput | DailyBookItemScalarWhereInput[]
    id?: StringFilter<"DailyBookItem"> | string
    daily_book_id?: StringFilter<"DailyBookItem"> | string
    customer_id?: StringFilter<"DailyBookItem"> | string
    kg?: FloatFilter<"DailyBookItem"> | number
    present?: BoolFilter<"DailyBookItem"> | boolean
    note?: StringNullableFilter<"DailyBookItem"> | string | null
    deleted_at?: DateTimeNullableFilter<"DailyBookItem"> | Date | string | null
  }

  export type LedgerUpsertWithWhereUniqueWithoutCustomerInput = {
    where: LedgerWhereUniqueInput
    update: XOR<LedgerUpdateWithoutCustomerInput, LedgerUncheckedUpdateWithoutCustomerInput>
    create: XOR<LedgerCreateWithoutCustomerInput, LedgerUncheckedCreateWithoutCustomerInput>
  }

  export type LedgerUpdateWithWhereUniqueWithoutCustomerInput = {
    where: LedgerWhereUniqueInput
    data: XOR<LedgerUpdateWithoutCustomerInput, LedgerUncheckedUpdateWithoutCustomerInput>
  }

  export type LedgerUpdateManyWithWhereWithoutCustomerInput = {
    where: LedgerScalarWhereInput
    data: XOR<LedgerUpdateManyMutationInput, LedgerUncheckedUpdateManyWithoutCustomerInput>
  }

  export type LedgerScalarWhereInput = {
    AND?: LedgerScalarWhereInput | LedgerScalarWhereInput[]
    OR?: LedgerScalarWhereInput[]
    NOT?: LedgerScalarWhereInput | LedgerScalarWhereInput[]
    id?: StringFilter<"Ledger"> | string
    customer_id?: StringFilter<"Ledger"> | string
    type?: EnumLedgerTypeFilter<"Ledger"> | $Enums.LedgerType
    reference_date?: DateTimeNullableFilter<"Ledger"> | Date | string | null
    kg?: FloatNullableFilter<"Ledger"> | number | null
    price_per_kg?: FloatNullableFilter<"Ledger"> | number | null
    amount?: FloatFilter<"Ledger"> | number
    previous_debt?: FloatFilter<"Ledger"> | number
    new_debt?: FloatFilter<"Ledger"> | number
    note?: StringNullableFilter<"Ledger"> | string | null
    receipt_id?: StringNullableFilter<"Ledger"> | string | null
    maqal_id?: IntNullableFilter<"Ledger"> | number | null
    created_at?: DateTimeFilter<"Ledger"> | Date | string
    deleted_at?: DateTimeNullableFilter<"Ledger"> | Date | string | null
  }

  export type DailyBookItemCreateWithoutDaily_bookInput = {
    id?: string
    kg: number
    present?: boolean
    note?: string | null
    deleted_at?: Date | string | null
    customer: CustomerCreateNestedOneWithoutDaily_itemsInput
  }

  export type DailyBookItemUncheckedCreateWithoutDaily_bookInput = {
    id?: string
    customer_id: string
    kg: number
    present?: boolean
    note?: string | null
    deleted_at?: Date | string | null
  }

  export type DailyBookItemCreateOrConnectWithoutDaily_bookInput = {
    where: DailyBookItemWhereUniqueInput
    create: XOR<DailyBookItemCreateWithoutDaily_bookInput, DailyBookItemUncheckedCreateWithoutDaily_bookInput>
  }

  export type DailyBookItemCreateManyDaily_bookInputEnvelope = {
    data: DailyBookItemCreateManyDaily_bookInput | DailyBookItemCreateManyDaily_bookInput[]
    skipDuplicates?: boolean
  }

  export type DailyBookItemUpsertWithWhereUniqueWithoutDaily_bookInput = {
    where: DailyBookItemWhereUniqueInput
    update: XOR<DailyBookItemUpdateWithoutDaily_bookInput, DailyBookItemUncheckedUpdateWithoutDaily_bookInput>
    create: XOR<DailyBookItemCreateWithoutDaily_bookInput, DailyBookItemUncheckedCreateWithoutDaily_bookInput>
  }

  export type DailyBookItemUpdateWithWhereUniqueWithoutDaily_bookInput = {
    where: DailyBookItemWhereUniqueInput
    data: XOR<DailyBookItemUpdateWithoutDaily_bookInput, DailyBookItemUncheckedUpdateWithoutDaily_bookInput>
  }

  export type DailyBookItemUpdateManyWithWhereWithoutDaily_bookInput = {
    where: DailyBookItemScalarWhereInput
    data: XOR<DailyBookItemUpdateManyMutationInput, DailyBookItemUncheckedUpdateManyWithoutDaily_bookInput>
  }

  export type DailyBookCreateWithoutItemsInput = {
    id?: string
    date: Date | string
    is_closed?: boolean
    created_at?: Date | string
    deleted_at?: Date | string | null
  }

  export type DailyBookUncheckedCreateWithoutItemsInput = {
    id?: string
    date: Date | string
    is_closed?: boolean
    created_at?: Date | string
    deleted_at?: Date | string | null
  }

  export type DailyBookCreateOrConnectWithoutItemsInput = {
    where: DailyBookWhereUniqueInput
    create: XOR<DailyBookCreateWithoutItemsInput, DailyBookUncheckedCreateWithoutItemsInput>
  }

  export type CustomerCreateWithoutDaily_itemsInput = {
    id?: string
    customer_code: string
    name: string
    avatar_url?: string | null
    created_at?: Date | string
    deleted_at?: Date | string | null
    ledger_items?: LedgerCreateNestedManyWithoutCustomerInput
  }

  export type CustomerUncheckedCreateWithoutDaily_itemsInput = {
    id?: string
    customer_code: string
    name: string
    avatar_url?: string | null
    created_at?: Date | string
    deleted_at?: Date | string | null
    ledger_items?: LedgerUncheckedCreateNestedManyWithoutCustomerInput
  }

  export type CustomerCreateOrConnectWithoutDaily_itemsInput = {
    where: CustomerWhereUniqueInput
    create: XOR<CustomerCreateWithoutDaily_itemsInput, CustomerUncheckedCreateWithoutDaily_itemsInput>
  }

  export type DailyBookUpsertWithoutItemsInput = {
    update: XOR<DailyBookUpdateWithoutItemsInput, DailyBookUncheckedUpdateWithoutItemsInput>
    create: XOR<DailyBookCreateWithoutItemsInput, DailyBookUncheckedCreateWithoutItemsInput>
    where?: DailyBookWhereInput
  }

  export type DailyBookUpdateToOneWithWhereWithoutItemsInput = {
    where?: DailyBookWhereInput
    data: XOR<DailyBookUpdateWithoutItemsInput, DailyBookUncheckedUpdateWithoutItemsInput>
  }

  export type DailyBookUpdateWithoutItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    is_closed?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DailyBookUncheckedUpdateWithoutItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    is_closed?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CustomerUpsertWithoutDaily_itemsInput = {
    update: XOR<CustomerUpdateWithoutDaily_itemsInput, CustomerUncheckedUpdateWithoutDaily_itemsInput>
    create: XOR<CustomerCreateWithoutDaily_itemsInput, CustomerUncheckedCreateWithoutDaily_itemsInput>
    where?: CustomerWhereInput
  }

  export type CustomerUpdateToOneWithWhereWithoutDaily_itemsInput = {
    where?: CustomerWhereInput
    data: XOR<CustomerUpdateWithoutDaily_itemsInput, CustomerUncheckedUpdateWithoutDaily_itemsInput>
  }

  export type CustomerUpdateWithoutDaily_itemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    customer_code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    avatar_url?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ledger_items?: LedgerUpdateManyWithoutCustomerNestedInput
  }

  export type CustomerUncheckedUpdateWithoutDaily_itemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    customer_code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    avatar_url?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ledger_items?: LedgerUncheckedUpdateManyWithoutCustomerNestedInput
  }

  export type CustomerCreateWithoutLedger_itemsInput = {
    id?: string
    customer_code: string
    name: string
    avatar_url?: string | null
    created_at?: Date | string
    deleted_at?: Date | string | null
    daily_items?: DailyBookItemCreateNestedManyWithoutCustomerInput
  }

  export type CustomerUncheckedCreateWithoutLedger_itemsInput = {
    id?: string
    customer_code: string
    name: string
    avatar_url?: string | null
    created_at?: Date | string
    deleted_at?: Date | string | null
    daily_items?: DailyBookItemUncheckedCreateNestedManyWithoutCustomerInput
  }

  export type CustomerCreateOrConnectWithoutLedger_itemsInput = {
    where: CustomerWhereUniqueInput
    create: XOR<CustomerCreateWithoutLedger_itemsInput, CustomerUncheckedCreateWithoutLedger_itemsInput>
  }

  export type CustomerUpsertWithoutLedger_itemsInput = {
    update: XOR<CustomerUpdateWithoutLedger_itemsInput, CustomerUncheckedUpdateWithoutLedger_itemsInput>
    create: XOR<CustomerCreateWithoutLedger_itemsInput, CustomerUncheckedCreateWithoutLedger_itemsInput>
    where?: CustomerWhereInput
  }

  export type CustomerUpdateToOneWithWhereWithoutLedger_itemsInput = {
    where?: CustomerWhereInput
    data: XOR<CustomerUpdateWithoutLedger_itemsInput, CustomerUncheckedUpdateWithoutLedger_itemsInput>
  }

  export type CustomerUpdateWithoutLedger_itemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    customer_code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    avatar_url?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    daily_items?: DailyBookItemUpdateManyWithoutCustomerNestedInput
  }

  export type CustomerUncheckedUpdateWithoutLedger_itemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    customer_code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    avatar_url?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    daily_items?: DailyBookItemUncheckedUpdateManyWithoutCustomerNestedInput
  }

  export type DailyBookItemCreateManyCustomerInput = {
    id?: string
    daily_book_id: string
    kg: number
    present?: boolean
    note?: string | null
    deleted_at?: Date | string | null
  }

  export type LedgerCreateManyCustomerInput = {
    id?: string
    type: $Enums.LedgerType
    reference_date?: Date | string | null
    kg?: number | null
    price_per_kg?: number | null
    amount: number
    previous_debt: number
    new_debt: number
    note?: string | null
    receipt_id?: string | null
    maqal_id?: number | null
    created_at?: Date | string
    deleted_at?: Date | string | null
  }

  export type DailyBookItemUpdateWithoutCustomerInput = {
    id?: StringFieldUpdateOperationsInput | string
    kg?: FloatFieldUpdateOperationsInput | number
    present?: BoolFieldUpdateOperationsInput | boolean
    note?: NullableStringFieldUpdateOperationsInput | string | null
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    daily_book?: DailyBookUpdateOneRequiredWithoutItemsNestedInput
  }

  export type DailyBookItemUncheckedUpdateWithoutCustomerInput = {
    id?: StringFieldUpdateOperationsInput | string
    daily_book_id?: StringFieldUpdateOperationsInput | string
    kg?: FloatFieldUpdateOperationsInput | number
    present?: BoolFieldUpdateOperationsInput | boolean
    note?: NullableStringFieldUpdateOperationsInput | string | null
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DailyBookItemUncheckedUpdateManyWithoutCustomerInput = {
    id?: StringFieldUpdateOperationsInput | string
    daily_book_id?: StringFieldUpdateOperationsInput | string
    kg?: FloatFieldUpdateOperationsInput | number
    present?: BoolFieldUpdateOperationsInput | boolean
    note?: NullableStringFieldUpdateOperationsInput | string | null
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type LedgerUpdateWithoutCustomerInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumLedgerTypeFieldUpdateOperationsInput | $Enums.LedgerType
    reference_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    kg?: NullableFloatFieldUpdateOperationsInput | number | null
    price_per_kg?: NullableFloatFieldUpdateOperationsInput | number | null
    amount?: FloatFieldUpdateOperationsInput | number
    previous_debt?: FloatFieldUpdateOperationsInput | number
    new_debt?: FloatFieldUpdateOperationsInput | number
    note?: NullableStringFieldUpdateOperationsInput | string | null
    receipt_id?: NullableStringFieldUpdateOperationsInput | string | null
    maqal_id?: NullableIntFieldUpdateOperationsInput | number | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type LedgerUncheckedUpdateWithoutCustomerInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumLedgerTypeFieldUpdateOperationsInput | $Enums.LedgerType
    reference_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    kg?: NullableFloatFieldUpdateOperationsInput | number | null
    price_per_kg?: NullableFloatFieldUpdateOperationsInput | number | null
    amount?: FloatFieldUpdateOperationsInput | number
    previous_debt?: FloatFieldUpdateOperationsInput | number
    new_debt?: FloatFieldUpdateOperationsInput | number
    note?: NullableStringFieldUpdateOperationsInput | string | null
    receipt_id?: NullableStringFieldUpdateOperationsInput | string | null
    maqal_id?: NullableIntFieldUpdateOperationsInput | number | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type LedgerUncheckedUpdateManyWithoutCustomerInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumLedgerTypeFieldUpdateOperationsInput | $Enums.LedgerType
    reference_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    kg?: NullableFloatFieldUpdateOperationsInput | number | null
    price_per_kg?: NullableFloatFieldUpdateOperationsInput | number | null
    amount?: FloatFieldUpdateOperationsInput | number
    previous_debt?: FloatFieldUpdateOperationsInput | number
    new_debt?: FloatFieldUpdateOperationsInput | number
    note?: NullableStringFieldUpdateOperationsInput | string | null
    receipt_id?: NullableStringFieldUpdateOperationsInput | string | null
    maqal_id?: NullableIntFieldUpdateOperationsInput | number | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DailyBookItemCreateManyDaily_bookInput = {
    id?: string
    customer_id: string
    kg: number
    present?: boolean
    note?: string | null
    deleted_at?: Date | string | null
  }

  export type DailyBookItemUpdateWithoutDaily_bookInput = {
    id?: StringFieldUpdateOperationsInput | string
    kg?: FloatFieldUpdateOperationsInput | number
    present?: BoolFieldUpdateOperationsInput | boolean
    note?: NullableStringFieldUpdateOperationsInput | string | null
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    customer?: CustomerUpdateOneRequiredWithoutDaily_itemsNestedInput
  }

  export type DailyBookItemUncheckedUpdateWithoutDaily_bookInput = {
    id?: StringFieldUpdateOperationsInput | string
    customer_id?: StringFieldUpdateOperationsInput | string
    kg?: FloatFieldUpdateOperationsInput | number
    present?: BoolFieldUpdateOperationsInput | boolean
    note?: NullableStringFieldUpdateOperationsInput | string | null
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DailyBookItemUncheckedUpdateManyWithoutDaily_bookInput = {
    id?: StringFieldUpdateOperationsInput | string
    customer_id?: StringFieldUpdateOperationsInput | string
    kg?: FloatFieldUpdateOperationsInput | number
    present?: BoolFieldUpdateOperationsInput | boolean
    note?: NullableStringFieldUpdateOperationsInput | string | null
    deleted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}