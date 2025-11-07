import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsUUID,
} from 'class-validator';

export class RegisterDto {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsString()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain uppercase, lowercase, number, and special character',
  })
  password: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsString()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @MinLength(2)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @MaxLength(50)
  firstName: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsUUID()
  merchantId: string;
}
