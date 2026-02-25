import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isProduction = configService.get('NODE_ENV') === 'production';

  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),

    //   Auto Load all Schemas
    entities: [__dirname + '/../**/*.schema{.ts,.js}'],

    //   Synchronize only in development
    synchronize: isProduction,
    logging: isProduction,
    ssl: isProduction
      ? {
          rejectUnauthorized: true,
        }
      : false,

    retryAttempts: 3,
    retryDelay: 3000,
  };
};
