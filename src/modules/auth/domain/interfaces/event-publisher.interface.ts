// export interface IEventPublisher {
//   publish<T>(event: T): Promise<void>;
// }

// export const IEventPublisher = Symbol('IEventPublisher')
//// domain/interfaces/event-publisher.interface.ts

export interface IEventPublisher {
  publish<T extends object>(event: T): Promise<void>;
}
export const IEventPublisher = Symbol('IEventPublisher');
