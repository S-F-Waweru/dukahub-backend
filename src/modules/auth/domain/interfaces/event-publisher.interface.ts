export interface IEventPublisher {
  publish<T>(event: T): Promise<void>;
}
