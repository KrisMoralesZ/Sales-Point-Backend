import { Controller, Post, Body } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { Authenticated } from '../common/decorators/authenticated.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  @Authenticated()
  complete(
    @Body() createCheckoutDto: CreateCheckoutDto,
    @CurrentUser() employee: User,
  ) {
    return this.checkoutService.complete(createCheckoutDto, employee);
  }
}
