import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IEventPublisher } from '../../domain/interfaces/event-publisher.interface';

@Injectable()
export class NestEventPublisher implements IEventPublisher {
  constructor(private readonly eventEmitter: EventEmitter2) {}
  private logger = new Logger(NestEventPublisher.name);

  async publish<T>(event: T): Promise<void> {
    const eventName = event.constructor.name;

    await this.eventEmitter.emitAsync(eventName, event);

    this.logger.debug(`Event published: ${eventName}`, {
      timestamp: new Date().toISOString(),
    });
  }
}
