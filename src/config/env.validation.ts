import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';
import { plainToInstance } from 'class-transformer';

enum Environment {
  Development = 'development',
  Production = 'production',
  Staging = 'staging',
  Testing = 'testing',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV?: Environment;

  @IsNumber()
  @IsOptional()
  PORT?: number;

  //Database
  @IsString()
  DB_HOST: string;

  @IsNumber()
  DB_PORT: number;
  @IsString()
  DB_USER: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_NAME: string;

  ///JWT

  @IsString()
  JWT_ACCESS_SECRET: string;

  @IsString()
  JWT_REFRESH_SECRET: string;
  @IsString()
  JWT_EXPIRATION: string;

  @IsString()
  REFRESH_TOKEN_EXPIRATION: string;

  // Email

  @IsEmail()
  GMAIL_USER: string;

  @IsString()
  GMAIL_PASSWORD: string;

  // Frontend
  @IsString()
  FRONTEND_URL: string;

  // Redis optional for now
  @IsString()
  @IsOptional()
  REDIS_HOST?: string;

  @IsString()
  @IsOptional()
  REDIS_PORT?: string;

  //Optional
  @IsString()
  @IsOptional()
  SENTRY_DSN?: string;
}

/**
 * Validate and convert a plain configuration object into an EnvironmentVariables instance.
 *
 * @param config - Plain object of environment values (for example, `process.env`)
 * @returns The validated EnvironmentVariables instance
 * @throws Error if validation fails; the error message contains the concatenated validation constraint messages
 */
export function validate(config: Record<string, unknown>) {
  const validatetedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatetedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `Environment validation Failed:\n${errors
        .map((e) => Object.values(e.constraints || {}).join(', '))
        .join('\n')}`,
    );
  }

  return validatetedConfig;
}
