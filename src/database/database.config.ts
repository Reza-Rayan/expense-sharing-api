import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isDevelopment =
    configService.getOrThrow<string>('app.nodeEnv') === 'development';

  return {
    type: 'postgres',

    host: configService.getOrThrow<string>('database.host'),
    port: configService.getOrThrow<number>('database.port'),
    username: configService.getOrThrow<string>('database.username'),
    password: configService.getOrThrow<string>('database.password'),
    database: configService.getOrThrow<string>('database.name'),

    autoLoadEntities: true,

    synchronize: isDevelopment,
    logging: isDevelopment,

    migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
    migrationsRun: !isDevelopment,
  };
};
