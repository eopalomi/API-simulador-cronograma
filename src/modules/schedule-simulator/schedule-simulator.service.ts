import { Injectable } from '@nestjs/common';
import * as configSimulation from './mocks/scheduleSimulationConfig.json';

interface LoanInstallment {
  numberPayment: number;
  paymentDate: string;
  principal: number;
  interest: number;
  allInterest: number;
  initialInterestBag: number;
  interestBag: number;
  vehicleInsurance: number;
  lifeInsurance: number;
  finalPrincipal: number;
  paymentAmount: number;
}

type LoanInstallmentWithDynamicsProps = LoanInstallment & {
  [key: string]: number | string;
};

interface monthlyFeeParams {
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
}

interface effectiveAnualRateParams {
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
}

interface scheduleParams {
  idSheduleConfigSimulation?: string;
  loanPrincipal: number;
  startDate: Date;
  firstDueDate: Date;
  paymentAmmount?: number;
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

        const installment = this.calculateInstallmentConcepts(
          estimatedLoanInstalment,
          params.paymentConcepts,
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
          allInterest > installment.paymentAmountNoFees
            ? installment.paymentAmountNoFees
            : allInterest;

        const interestBag: number = +(allInterest - interest).toFixed(2);

        const principal: number =
          allInterest > installment.paymentAmountNoFees
            ? 0.0
            : +(installment.paymentAmountNoFees - interest).toFixed(2);

        finalPrincipal = +(initialPrincipal - principal).toFixed(2);
        const vehicleInsurance =
          params.paymentConcepts.find((item) => item.code === 'vehicle-ins')
            ?.ammount ?? 0;

        table.push({
          nro: numberOfPayment,
          dueDate,
          daysBetweenDates,
          principal,
          interest,
          initial: initialPrincipal,
          final: finalPrincipal,
          fullPayment: principal + interest + vehicleInsurance,
          vehicleInsurance: vehicleInsurance,
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
      let initialPrincipal: number = params.loanPrincipal;
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

        const installment = this.calculateInstallmentConcepts(
          params.paymentAmmount,
          params.paymentConcepts,
        );

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
          allInterest > installment.paymentAmountNoFees
            ? installment.paymentAmountNoFees
            : allInterest;

        const interestBag: number = +(allInterest - interest).toFixed(2);

        const principal: number =
          allInterest > installment.paymentAmountNoFees
            ? 0.0
            : +(installment.paymentAmountNoFees - interest).toFixed(2);

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

  private checkSimulationConfig(params: scheduleParams) {
    if (params.idSheduleConfigSimulation) {
      params.loanPrincipal = configSimulation[0].loanPrincipal;
      params.startDate = new Date(configSimulation[0].startDate);
      params.firstDueDate = new Date(configSimulation[0].firstDueDate);
      params.loanTerm = configSimulation[0].loanTerm;
      params.effectiveAnualRate = configSimulation[0].effectiveAnualRate;
      params.paymentFrequency = configSimulation[0].paymentFrequency;
      params.businessDays = configSimulation[0].businessDays;
      params.calculationType = configSimulation[0].calculationType;
      params.scheduleType = configSimulation[0].scheduleType;
      params.paymentConcepts = configSimulation[0].paymentConcepts;
      params.paymentAmmount = this.calculateMonthlyFee(params);
    }
  }

  public scheduleWithOutCapitalization(
    params: scheduleParams,
  ): LoanInstallmentWithDynamicsProps[] {
    this.checkSimulationConfig(params);

    const paymentAmmount: number =
      params.paymentAmmount ?? this.calculateMonthlyFee(params);

    const installment = this.calculateInstallmentConcepts(
      paymentAmmount,
      params.paymentConcepts,
    );

    const installments = new Array(params.loanTerm).fill(paymentAmmount);
    let numberOfPayment: number = 0;
    let initialPrincipal: number = params.loanPrincipal;
    let finalPrincipal: number = 0.0;
    let initialInterestBag: number = 0.0;
    let startDate: Date = new Date(params.startDate);
    const dueDate: Date = new Date(params.firstDueDate);
    const paymentSchedule: LoanInstallmentWithDynamicsProps[] = [];

    installments.forEach((rs, idx) => {
      numberOfPayment++;

      const daysBetweenDates = this.calculateDaysBetweenTwoDates(
        startDate,
        dueDate,
      );

      const calculateInterest = this.calculateInterest(
        params.effectiveAnualRate,
        daysBetweenDates,
        initialPrincipal,
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
        calculateInterest +
        initialInterestBag +
        interestOfTheBag
      ).toFixed(2);

      const interest: number =
        allInterest > installment.paymentAmountNoFees
          ? installment.paymentAmountNoFees
          : allInterest;

      const interestBag: number = +(allInterest - interest).toFixed(2);

      let principal = +(installment.paymentAmountNoFees - interest).toFixed(2);

      finalPrincipal = +(initialPrincipal - principal).toFixed(2);
      initialPrincipal = +finalPrincipal.toFixed(2);

      if (idx + 1 === installments.length) {
        principal = +(finalPrincipal + principal).toFixed(2);
        finalPrincipal = 0;
      }

      const loanInstallment = {
        numberPayment: numberOfPayment,
        paymentDate: dueDate.toISOString().substring(0, 10),
        principal: principal,
        interest: interest,
        allInterest: allInterest,
        vehicleInsurance: installment.vehicleInsurance || undefined,
        lifeInsurance: installment.lifeInsurance || undefined,
        finalPrincipal: finalPrincipal,
        initialInterestBag,
        interestBag,
        paymentAmount: +(
          principal +
          interest +
          installment.ammountOfConcepts
        ).toFixed(2),
        ...installment.concepts,
      };

      paymentSchedule.push(loanInstallment);

      initialInterestBag = interestBag;
      startDate = new Date(dueDate);
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
    let initialBag: number = 0;
    let previusInterest: number = 0;
    let previusInterestBag: number = 0;

    const paymentAmmount = this.calculateMonthlyFee(params);

    const schedule =
      params.scheduleType === 'NOR'
        ? this.scheduleWithOutCapitalization({ ...params, paymentAmmount })
        : this.scheduleWithOutCapitalization({ ...params, paymentAmmount });

    console.table(schedule);
    // const consoleTable: any = [];
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

      const calculatedInterestBag: number = this.calculateInterest(
        params.effectiveAnualRate,
        daysOfPayments,
        initialBag,
      );

      dailySchedule.push({
        dueDate: day.toISOString().substring(0, 10),
        numberOfDay,
        daysOfPayments,
        interest: calculatedInterest,
        dailyinterest: +(calculatedInterest - previusInterest).toFixed(2),
        interesBag: calculatedInterestBag ?? 0.0, // eslint-disable-next-line prettier/prettier
        dailyinterestBag: +(calculatedInterestBag - previusInterestBag).toFixed(2), 
        schedulePrincipal: scheduleInstallment?.principal ?? 0.0,
        scheduleInterest: scheduleInstallment?.interest ?? 0.0,
        scheduleInitialBag: scheduleInstallment?.interestBag ?? 0.0,
      });

      previusInterest = calculatedInterest;
      previusInterestBag = calculatedInterestBag;

      if (scheduleInstallment) {
        daysOfPayments = 0;
        previusInterest = 0;
        previusInterestBag = 0;
        loanPrincipal -= scheduleInstallment.principal;
        totalInterest += calculatedInterest;
        initialBag = scheduleInstallment?.interestBag ?? 0.0;
      }
    });

    // console.table(consoleTable);
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
    const interest =
      ((1 + effectiveAnnualRate) ** (days / 365) - 1) * principal;

    const roundinterest = parseFloat((interest + Number.EPSILON).toFixed(2));

    return roundinterest;
  }

  private calculateInstallmentConcepts(
    paymentAmmount: number,
    paymentConcepts: {
      code: string;
      name: string;
      ammount?: number;
    }[],
  ) {
    let ammountOfConcepts: number = 0;
    let vehicleInsurance = 0;
    let lifeInsurance = 0;
    const concepts: Record<string, number> = {};

    paymentConcepts.forEach((rs) => {
      ammountOfConcepts += rs.ammount ?? 0;

      if (rs.code === 'vehicle-ins') {
        vehicleInsurance = rs.ammount ?? 0;
      } else if (rs.code === 'life-ins') {
        lifeInsurance = rs.ammount ?? 0;
      } else {
        concepts[rs.name] = rs.ammount ?? 0;
      }
    });

    const paymentAmountNoFees = +(paymentAmmount - ammountOfConcepts).toFixed(
      2,
    );

    return {
      paymentAmmount,
      paymentAmountNoFees,
      vehicleInsurance,
      lifeInsurance,
      ammountOfConcepts,
      concepts: concepts,
    };
  }
}
