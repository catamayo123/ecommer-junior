import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '../../enum/index';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Post('pay/:id')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.ADMIN)
    pay(@Param('id') paymentId: string, @CurrentUser('id') adminId: string) {
        return this.paymentService.pay(paymentId, adminId)
    }
}
