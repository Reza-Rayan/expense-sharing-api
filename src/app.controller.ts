import { Controller, Get, Header } from '@nestjs/common';
import {
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { renderLanding } from './app.landing';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiExcludeEndpoint()
  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  getLanding(): string {
    return renderLanding(this.appService.getInfo());
  }

  @ApiTags('Health')
  @ApiOperation({ summary: 'Check API and database health' })
  @ApiOkResponse({
    description: 'API and database are up',
    schema: {
      example: {
        status: 'ok',
        database: 'up',
        uptimeSeconds: 120,
        timestamp: '2026-09-30T12:00:00.000Z',
      },
    },
  })
  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }
}
