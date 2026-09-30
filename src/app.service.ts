import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  getInfo() {
    return {
      name: 'Expense Sharing API',
      description: 'Record expenses between users and view their net balances.',
      environment: this.configService.getOrThrow<string>('app.nodeEnv'),
      uptimeSeconds: Math.floor(process.uptime()),
    };
  }

  async getHealth() {
    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'down',
      });
    }

    return {
      status: 'ok',
      database: 'up',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}
