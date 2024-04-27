import { Injectable } from '@nestjs/common';

interface LoanInstallment {
  numberPayment: number;
  paymentDate: string;
  principal: number;
  interest: number;
  allInterest: number;
  vehicleInsurance: number;
  lifeInsurance: number;
  igv: number;
  preventionInsurance: number;
  finalPrincipal: number;
  finalPayment: number;
}

// interface dailySchedule {
//   date: string;
//   numberDate: number;
//   numberPayment: number;
//   principal: number;
//   interest: number;
//   finalPrincipal: number;
// }

interface monthlyFeeParams {
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
}

interface effectiveAnualRateParams {
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
}

interface scheduleParams {
  loanPrincipal: number;
  startDate: Date;
  firstDueDate: Date;
  loanInstallment?: number;
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
}

@Injectable()
export class ScheduleSimulatorService {
  public calculateMonthlyFee(params: monthlyFeeParams): number {
    let maximunFee: number = 200000.0;
    let minimunFee: number = 0.0;
    let estimatedLoanInstalment: number = (maximunFee + minimunFee) / 2;
    let count = 0;

    while (true) {
      count++;

      const installments = new Array(params.loanTerm).fill(0.0);
      let numberOfPayment: number = 0;
      let initialPrincipal: number = +params.loanPrincipal;
      let finalPrincipal: number = 0.0;
      const dueDate: Date = new Date(params.firstDueDate);
      let startDate: Date = new Date(params.startDate);
      let initialInterestBag: number = 0.0;
      const table: any = [];

      installments.forEach(() => {
        numberOfPayment = numberOfPayment + 1;

        const daysBetweenDates = this.calculateDaysBetweenTwoDates(
          startDate,
          dueDate,
        );

        const calculatedInterest: number = this.calculateInterest(
          params.effectiveAnualRate,
          daysBetweenDates,
          initialPrincipal,
        );

        const installmentsWithNoAdditional = +(
          estimatedLoanInstalment - params.vehicleInsurance ?? 0.0
        ).toFixed(2);

        const interestOfTheBag =
          initialInterestBag > 0
            ? this.calculateInterest(
                params.effectiveAnualRate,
                daysBetweenDates,
                initialInterestBag,
              )
            : 0.0;

        const allInterest = +(
          calculatedInterest +
          initialInterestBag +
          interestOfTheBag
        ).toFixed(2);

        const interest: number =
          allInterest > installmentsWithNoAdditional
            ? +installmentsWithNoAdditional.toFixed(2)
            : allInterest;

        // const igv: number =
        //   params.igv === true ? +(interest * 0.18).toFixed(2) : 0.0;
        const igv: number = 0.0;

        const interestBag: number = +(allInterest - interest).toFixed(2);

        const principal: number =
          allInterest > installmentsWithNoAdditional
            ? 0.0
            : +(installmentsWithNoAdditional - interest - igv).toFixed(2);

        finalPrincipal = +(initialPrincipal - principal).toFixed(2);

        table.push({
          nro: numberOfPayment,
          dueDate,
          daysBetweenDates,
          principal,
          interest,
          initial: initialPrincipal,
          final: finalPrincipal,
          fullPayment: principal + interest + params.vehicleInsurance,
          vehicleInsurance: params.vehicleInsurance,
        });

        initialInterestBag = interestBag;
        initialPrincipal = finalPrincipal;
        startDate = new Date(dueDate.getTime());
        dueDate.setMonth(dueDate.getMonth() + 1);
      });

      if (finalPrincipal > 0.0) {
        minimunFee = estimatedLoanInstalment;
      } else {
        maximunFee = estimatedLoanInstalment;
      }

      estimatedLoanInstalment = (maximunFee + minimunFee) / 2;

      if (Math.abs(finalPrincipal) < 0.01 || count === 100) {
        // console.table(table);
        console.log(
          'finalPrincipal',
          finalPrincipal,
          'Math.abs(finalPrincipal)',
          Math.abs(finalPrincipal),
          'count',
          count,
          'estimatedLoanInstalment ',
          estimatedLoanInstalment,
        );
        break;
      }
    }

    return +estimatedLoanInstalment.toFixed(2);
  }

  public calculateEffectiveAnualRate(params: effectiveAnualRateParams): number {
    let maximunRate: number = 9.0;
    let minimunRate: number = 0.0;
    let estimatedAnualRate: number = (maximunRate + minimunRate) / 2;
    let count = 0;

    while (true) {
      count++;

      const installments = new Array(params.loanTerm).fill(0.0);
      let numberOfPayment: number = 0;
      let initialPrincipal: number = +params.loanPrincipal;
      let finalPrincipal: number = 0.0;
      const dueDate: Date = new Date(params.firstDueDate);
      let startDate: Date = new Date(params.startDate);
      let initialInterestBag: number = 0.0;

      installments.forEach(() => {
        numberOfPayment = numberOfPayment++;
        const daysBetweenDates = this.calculateDaysBetweenTwoDates(
          startDate,
          dueDate,
        );

        const calculatedInterest: number = this.calculateInterest(
          estimatedAnualRate,
          daysBetweenDates,
          initialPrincipal,
        );

        const installmentsWithNoAdditional = +(
          params.loanInstallment - params.vehicleInsurance ?? 0.0
        ).toFixed(2);

        const interestOfTheBag =
          initialInterestBag > 0
            ? this.calculateInterest(
                estimatedAnualRate,
                daysBetweenDates,
                initialInterestBag,
              )
            : 0.0;

        const allInterest = +(
          calculatedInterest +
          initialInterestBag +
          interestOfTheBag
        ).toFixed(2);

        const interest: number =
          allInterest > installmentsWithNoAdditional / 1.18
            ? +(installmentsWithNoAdditional / 1.18).toFixed(2)
            : allInterest;

        const igv: number =
          params.igv === true ? +(interest * 0.18).toFixed(2) : 0.0;

        const interestBag: number = +(allInterest - interest).toFixed(2);

        const principal: number =
          allInterest > installmentsWithNoAdditional
            ? 0.0
            : +(installmentsWithNoAdditional - interest - igv).toFixed(2);

        finalPrincipal = +(initialPrincipal - principal).toFixed(2);

        initialInterestBag = interestBag;
        initialPrincipal = finalPrincipal;
        startDate = new Date(dueDate.getTime());
        dueDate.setMonth(dueDate.getMonth() + 1);
      });

      if (finalPrincipal < 0.0) {
        minimunRate = estimatedAnualRate;
      } else {
        maximunRate = estimatedAnualRate;
      }

      estimatedAnualRate = (maximunRate + minimunRate) / 2;

      if (Math.abs(finalPrincipal) < 0.01 || count === 250) {
        console.log('finalPrincipal', finalPrincipal);
        break;
      }
    }

    return +estimatedAnualRate.toFixed(4);
  }

  public scheduleWithOutCapitalization(
    params: scheduleParams,
  ): LoanInstallment[] {
    const installments = new Array(params.loanTerm).fill(
      params.loanInstallment,
    );
    let numberOfPayment: number = 0;
    let initialPrincipal: number = +params.loanPrincipal;
    let finalPrincipal: number = 0.0;
    const dueDate: Date = new Date(params.firstDueDate);
    let startDate: Date = new Date(params.startDate);
    const paymentSchedule: LoanInstallment[] = [];
    let initialInterestBag: number = 0.0;
    const consoleTable: any = [];

    installments.forEach((rs, idx) => {
      numberOfPayment++;
      const daysBetweenDates = this.calculateDaysBetweenTwoDates(
        startDate,
        dueDate,
      );

      const calculatedInterest: number = this.calculateInterest(
        params.effectiveAnualRate,
        daysBetweenDates,
        initialPrincipal,
      );
      const installmentsWithNoAdditional =
        this.calculateInstallmentsWithoutAdditional(
          params.loanInstallment,
          params.vehicleInsurance,
        );

      const interestOfTheBag =
        initialInterestBag > 0
          ? this.calculateInterest(
              params.effectiveAnualRate,
              daysBetweenDates,
              initialInterestBag,
            )
          : 0.0;
      const allInterest = +(
        calculatedInterest +
        initialInterestBag +
        interestOfTheBag
      ).toFixed(2);

      const interest: number =
        allInterest > installmentsWithNoAdditional / 1.18
          ? +(installmentsWithNoAdditional / 1.18).toFixed(2)
          : allInterest;

      const igv: number =
        params.igv === true ? +(interest * 0.18).toFixed(2) : 0.0;

      const interestBag: number = +(allInterest - interest).toFixed(2);

      let principal: number =
        allInterest > installmentsWithNoAdditional
          ? 0.0
          : +(installmentsWithNoAdditional - interest - igv).toFixed(2);

      finalPrincipal = +(initialPrincipal - principal).toFixed(2);

      // Ajuste de la ultima cuota
      if (idx + 1 === installments.length) {
        principal = +(finalPrincipal + principal).toFixed(2);
        finalPrincipal = 0.0;
      }

      consoleTable.push({
        cta: numberOfPayment,
        dueDate: dueDate.toISOString().substring(0, 10),
        days: daysBetweenDates,
        initial: initialPrincipal,
        final: finalPrincipal,
        principal: principal,
        interest: interest,
        KxI: calculatedInterest,
        allInterest: allInterest,
        insurance: params.vehicleInsurance,
        bagInit: initialInterestBag,
        bagInterest: interestOfTheBag,
        bagFinal: interestBag,
        igv: igv,
        payment: +(
          interest +
          principal +
          igv +
          params.vehicleInsurance
        ).toFixed(2),
      });

      const loanInstallment: LoanInstallment = {
        numberPayment: numberOfPayment,
        paymentDate: dueDate.toISOString().substring(0, 10),
        principal: principal,
        interest: interest,
        allInterest: allInterest,
        vehicleInsurance: params.vehicleInsurance,
        lifeInsurance: 0.0,
        igv: igv,
        preventionInsurance: 0.0,
        finalPrincipal: finalPrincipal,
        finalPayment: principal + interest + params.vehicleInsurance + igv,
      };

      initialInterestBag = interestBag;
      initialPrincipal = finalPrincipal;
      startDate = new Date(dueDate.getTime());
      dueDate.setMonth(dueDate.getMonth() + 1);

      paymentSchedule.push(loanInstallment);
    });

    console.table(consoleTable);
    return paymentSchedule;
  }

  public scheduleWithCapitalization(params: scheduleParams): LoanInstallment[] {
    const installments = new Array(params.loanTerm).fill(
      params.loanInstallment,
    );
    let numberOfPayment: number = 0;
    let initialPrincipal: number = params.loanPrincipal;
    let finalPrincipal: number = 0.0;
    let startDate: Date = new Date(params.startDate);
    const dueDate: Date = new Date(params.firstDueDate);
    const paymentSchedule: LoanInstallment[] = [];

    installments.forEach((rs, idx) => {
      numberOfPayment++;
      const daysBetweenDates = this.calculateDaysBetweenTwoDates(
        startDate,
        dueDate,
      );

      const interest: number = this.calculateInterest(
        params.effectiveAnualRate,
        daysBetweenDates,
        initialPrincipal,
      );

      let principal = +(
        params.loanInstallment -
        params.vehicleInsurance -
        interest
      ).toFixed(2);

      finalPrincipal = +(initialPrincipal - principal).toFixed(2);
      initialPrincipal = +finalPrincipal.toFixed(2);

      if (idx + 1 === installments.length) {
        principal = +(finalPrincipal + principal).toFixed(2);
        finalPrincipal = 0.0;
      }

      startDate = new Date(dueDate);

      const loanInstallment: LoanInstallment = {
        numberPayment: numberOfPayment,
        paymentDate: dueDate.toISOString().substring(0, 10),
        principal: principal,
        interest: interest,
        allInterest: 0.0,
        vehicleInsurance: params.vehicleInsurance,
        lifeInsurance: 0.0,
        igv: 0.0,
        preventionInsurance: 0.0,
        finalPrincipal: finalPrincipal,
        finalPayment: principal + interest + params.vehicleInsurance,
      };

      paymentSchedule.push(loanInstallment);

      dueDate.setMonth(dueDate.getMonth() + 1);
    });

    return paymentSchedule;
  }

  public dailySchedule(params: scheduleParams): any | null {
    const startDate: Date = new Date(params.startDate);
    const finalDueDate = new Date(params.startDate);
    finalDueDate.setMonth(finalDueDate.getMonth() + params.loanTerm);

    const scheduleDays = this.calculateDaysBetweenTwoDates(
      startDate,
      finalDueDate,
    );

    const installments = new Array(scheduleDays).fill(0.0);

    let numberOfDay: number = 0;
    let daysOfPayments: number = 0;
    let totalInterest: number = 0;
    let loanPrincipal = params.loanPrincipal;

    const loanInstallment = this.calculateMonthlyFee(params);

    const schedule =
      params.scheduleType === 'NOR'
        ? this.scheduleWithCapitalization({ ...params, loanInstallment })
        : this.scheduleWithOutCapitalization({ ...params, loanInstallment });
    console.table(schedule);
    const consoleTable: any = [];
    const dailySchedule: any = [];

    installments.forEach((ele, idx) => {
      numberOfDay = idx + 1;
      daysOfPayments++;
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + numberOfDay);

      const scheduleInstallment = schedule.find(
        (installment) =>
          installment.paymentDate === day.toISOString().substring(0, 10),
      );

      const calculatedInterest: number = this.calculateInterest(
        params.effectiveAnualRate,
        daysOfPayments,
        loanPrincipal,
      );

      consoleTable.push({
        dueDate: day.toISOString().substring(0, 10),
        numberOfDay,
        daysOfPayments,
        interest: calculatedInterest,
        principal: scheduleInstallment?.principal ?? 0.0,
        scheduleInterest: scheduleInstallment?.interest ?? 0.0,
        effectiveAnualRate: params.effectiveAnualRate,
      });

      dailySchedule.push({
        dueDate: day.toISOString().substring(0, 10),
        numberOfDay,
        daysOfPayments,
        interest: calculatedInterest,
        principal: scheduleInstallment?.principal ?? 0.0,
        scheduleInterest: scheduleInstallment?.interest ?? 0.0,
      });

      if (scheduleInstallment) {
        daysOfPayments = 0;
        loanPrincipal -= scheduleInstallment.principal;
        totalInterest += calculatedInterest;
      }
    });

    console.table(consoleTable);
    return { totalInterest: +totalInterest.toFixed(2), dailySchedule };
  }

  private calculateDaysBetweenTwoDates(startDate: Date, endDate: Date) {
    const difference: number = Math.abs(
      endDate.getTime() - startDate.getTime(),
    );
    const convertToDays: number = Math.ceil(difference / (1000 * 60 * 60 * 24));

    return convertToDays;
  }

  private calculateInterest(
    effectiveAnnualRate: number,
    days: number,
    principal: number,
  ): number {
    return +(
      ((1 + effectiveAnnualRate) ** (days / 365) - 1) *
      principal
    ).toFixed(2);
  }

  private calculateInstallmentsWithoutAdditional(
    loanInstallment: number,
    vehicleInsurance: number,
  ): number {
    return +(loanInstallment - vehicleInsurance).toFixed(2);
  }
}
