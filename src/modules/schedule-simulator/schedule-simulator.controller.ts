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
      idSheduleConfigSimulation?: string;
      loanPrincipal: number;
      startDate: Date;
      firstDueDate: Date;
      loanTerm: number;
      effectiveAnualRate: number;
      paymentAmmount?: number;
      paymentFrequency: string;
      businessDays: boolean;
      calculationType: string;
      scheduleType: string;
      paymentConcepts: {
        code: string;
        name: string;
        ammount?: number;
      }[];
    },
  ) {
    const paymentSchedule = {
      installments: undefined,
      effectiveAnualRate: null,
    };

    if (scheludeDto.scheduleType === 'NOR') {
      paymentSchedule.installments =
        this.scheduleSimulatorService.scheduleWithOutCapitalization({
          idSheduleConfigSimulation: scheludeDto.idSheduleConfigSimulation,
          loanPrincipal: scheludeDto.loanPrincipal,
          startDate: scheludeDto.startDate,
          firstDueDate: new Date(scheludeDto.firstDueDate),
          loanTerm: scheludeDto.loanTerm,
          effectiveAnualRate: scheludeDto.effectiveAnualRate,
          paymentAmmount: scheludeDto.paymentAmmount,
          paymentFrequency: scheludeDto.paymentFrequency,
          businessDays: scheludeDto.businessDays,
          calculationType: scheludeDto.calculationType,
          scheduleType: scheludeDto.scheduleType,
          paymentConcepts: scheludeDto.paymentConcepts,
        });
    }

    // if (scheludeDto.scheduleType === 'REP') {
    //   paymentSchedule.installments =
    //     this.scheduleSimulatorService.scheduleWithOutCapitalization({
    //       loanPrincipal: scheludeDto.loanPrincipal,
    //       startDate: scheludeDto.startDate,
    //       firstDueDate: new Date(scheludeDto.firstDueDate),
    //       loanTerm: scheludeDto.loanTerm,
    //       effectiveAnualRate: scheludeDto.effectiveAnualRate,
    //       paymentFrequency: scheludeDto.paymentFrequency,
    //       businessDays: scheludeDto.businessDays,
    //       calculationType: scheludeDto.calculationType,
    //       scheduleType: scheludeDto.scheduleType,
    //       typeVehicleInsurance: scheludeDto.typeVehicleInsurance,
    //       vehicleInsurance: scheludeDto.vehicleInsurance,
    //       typeLifeInsurance: scheludeDto.typeLifeInsurance,
    //       igv: scheludeDto.igv,
    //     });
    // }
    paymentSchedule.effectiveAnualRate = scheludeDto.effectiveAnualRate;

    return paymentSchedule;
  }

  @Post('/daily-schedule')
  @HttpCode(200)
  getDailySchedule(
    @Body()
    scheludeDto: {
      loanPrincipal: number;
      startDate: Date;
      firstDueDate: Date;
      loanTerm: number;
      effectiveAnualRate: number;
      paymentFrequency: string;
      businessDays: boolean;
      calculationType: string;
      scheduleType: string;
      paymentConcepts: {
        code: string;
        name: string;
        ammount?: number;
      }[];
    },
  ) {
    const calculatedPayment =
      this.scheduleSimulatorService.dailySchedule(scheludeDto);

    return calculatedPayment;
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
      paymentFrequency: string;
      businessDays: boolean;
      calculationType: string;
      scheduleType: string;
      paymentConcepts: {
        code: string;
        name: string;
        ammount?: number;
      }[];
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
      paymentAmmount: number;
      paymentFrequency: string;
      businessDays: boolean;
      calculationType: string;
      scheduleType: string;
      paymentConcepts: {
        code: string;
        name: string;
        ammount?: number;
      }[];
    },
  ) {
    const rates =
      this.scheduleSimulatorService.calculateEffectiveAnualRate(annualRateDto);

    return rates;
  }
}
