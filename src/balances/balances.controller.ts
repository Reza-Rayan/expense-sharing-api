import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BalancesService } from './balances.service';
import { BalanceDto } from './dto/balance.dto';

@ApiTags('Balances')
@Controller('balances')
export class BalancesController {
  constructor(private readonly balancesService: BalancesService) {}

  @Get()
  @ApiOperation({
    summary: 'Net balances between users',
    description:
      'Transactions between the same two users are netted. Settled pairs are omitted.',
  })
  @ApiOkResponse({ type: [BalanceDto] })
  getNetBalances(): Promise<BalanceDto[]> {
    return this.balancesService.getNetBalances();
  }
}
