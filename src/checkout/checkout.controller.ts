import { Controller, Post, Body } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  complete(
    @Body() createCheckoutDto: CreateCheckoutDto,
    @CurrentUser() employee: User,
  ) {
    return this.checkoutService.complete(createCheckoutDto, employee);
  }
}
