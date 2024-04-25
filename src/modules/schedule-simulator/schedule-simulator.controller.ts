import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ScheduleSimulatorService } from './schedule-simulator.service';

@Controller('simulator')
export class ScheduleSimulatorController {
  constructor(private scheduleSimulatorService: ScheduleSimulatorService) {}

  @Post('/schedule')
  @HttpCode(200)
  getSchedule(
    @Body()
    scheludeDto: {
      loanPrincipal: number;
      startDate: Date;
      firstDueDate: Date;
      loanTerm: number;
      effectiveAnualRate: number;
      paymentFrecuency: string;
      businessDays: boolean;
      calculationType: string;
      scheduleType: string;
      typeVehicleInsurance: string;
      vehicleInsurance: number;
      typeLifeInsurance: string;
      igv: boolean;
    },
  ) {
    const paymentSchedule = {
      installments: null,
    };

    const calculatedPayment =
      this.scheduleSimulatorService.calculateMonthlyFee(scheludeDto);

    if (scheludeDto.scheduleType === 'NOR') {
      paymentSchedule.installments =
        this.scheduleSimulatorService.scheduleWithCapitalization({
          loanPrincipal: scheludeDto.loanPrincipal,
          startDate: scheludeDto.startDate,
          firstDueDate: new Date(scheludeDto.firstDueDate),
          loanInstallment: calculatedPayment,
          loanTerm: scheludeDto.loanTerm,
          effectiveAnualRate: scheludeDto.effectiveAnualRate,
          paymentFrecuency: scheludeDto.paymentFrecuency,
          businessDays: scheludeDto.businessDays,
          calculationType: scheludeDto.calculationType,
          scheduleType: scheludeDto.scheduleType,
          typeVehicleInsurance: scheludeDto.typeVehicleInsurance,
          typeLifeInsurance: scheludeDto.typeLifeInsurance,
          vehicleInsurance: scheludeDto.vehicleInsurance,
          igv: scheludeDto.igv,
        });
    }

    if (scheludeDto.scheduleType === 'REP') {
      paymentSchedule.installments =
        this.scheduleSimulatorService.scheduleWithOutCapitalization({
          loanPrincipal: scheludeDto.loanPrincipal,
          startDate: scheludeDto.startDate,
          firstDueDate: new Date(scheludeDto.firstDueDate),
          loanInstallment: calculatedPayment,
          loanTerm: scheludeDto.loanTerm,
          effectiveAnualRate: scheludeDto.effectiveAnualRate,
          paymentFrecuency: scheludeDto.paymentFrecuency,
          businessDays: scheludeDto.businessDays,
          calculationType: scheludeDto.calculationType,
          scheduleType: scheludeDto.scheduleType,
          typeVehicleInsurance: scheludeDto.typeVehicleInsurance,
          vehicleInsurance: scheludeDto.vehicleInsurance,
          typeLifeInsurance: scheludeDto.typeLifeInsurance,
          igv: scheludeDto.igv,
        });
    }

    return paymentSchedule;
  }

  @Post('/payment')
  @HttpCode(200)
  getPayment(
    @Body()
    paymentDto: {
      loanPrincipal: number;
      startDate: Date;
      firstDueDate: Date;
      loanTerm: number;
      effectiveAnualRate: number;
      paymentFrecuency: string;
      businessDays: boolean;
      calculationType: string;
      scheduleType: string;
      typeVehicleInsurance: string;
      vehicleInsurance: number;
      typeLifeInsurance: string;
      igv: boolean;
    },
  ) {
    const calculatedPayment =
      this.scheduleSimulatorService.calculateMonthlyFee(paymentDto);

    return {
      payment: calculatedPayment,
    };
  }

  @Post('/annual-rate')
  @HttpCode(200)
  getEffectiveAnnualRate(
    @Body()
    annualRateDto: {
      loanPrincipal: number;
      startDate: Date;
      firstDueDate: Date;
      loanTerm: number;
      loanInstallment: number;
      paymentFrecuency: string;
      businessDays: boolean;
      calculationType: string;
      scheduleType: string;
      typeVehicleInsurance: string;
      vehicleInsurance: number;
      typeLifeInsurance: string;
      igv: boolean;
    },
  ) {
    const effectiveAnnualRate =
      this.scheduleSimulatorService.calculateEffectiveAnualRate(annualRateDto);

    return {
      effectiveAnnualRate,
    };
  }
}
