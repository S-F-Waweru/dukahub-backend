import { Injectable } from '@nestjs/common';
import { IPaymentProvider } from '../../domain/interfaces/payment-provider.interface';

import { UnsupportedPaymentMethodException } from '../../domain/exceptions/payment.exceptions';
import { PaymentMethod } from '../../domain/enums/payament.enum';

@Injectable()
export class PaymentProviderRegistry {
  private readonly providers = new Map<PaymentMethod, IPaymentProvider>();

  register(provider: IPaymentProvider): void {
    this.providers.set(provider.method, provider);
  }

  get(method: PaymentMethod): IPaymentProvider {
    const provider = this.providers.get(method);
    if (!provider) throw new UnsupportedPaymentMethodException(method);
    return provider;
  }

  getAvailableMethods(): PaymentMethod[] {
    return Array.from(this.providers.keys());
  }
}
