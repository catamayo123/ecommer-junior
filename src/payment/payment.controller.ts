import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole } from 'enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Post('pay/:id')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.ADMIN)
    pay(@Param('id') paymentId: string, @Param('id') adminId: string) {
        return this.paymentService.pay(paymentId, adminId)
    }
}
