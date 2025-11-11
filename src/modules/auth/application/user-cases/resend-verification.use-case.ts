import { Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/interfaces/user.reposotory.interface';

export class verifyEmailUseCase {
  constructor(
    @Inject()
    private readonly userRepository: IUserRepository,
    @Inject()
    private readonly emailVerificaionTokenRepository: IEmailVericationTokenRepository,
  ) {}
}
