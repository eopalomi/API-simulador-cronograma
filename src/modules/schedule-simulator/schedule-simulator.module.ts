import { Module } from '@nestjs/common';
import { ScheduleSimulatorController } from './schedule-simulator.controller';
import { ScheduleSimulatorService } from './schedule-simulator.service';

@Module({
  controllers: [ScheduleSimulatorController],
  providers: [ScheduleSimulatorService],
})
export class ScheduleSimulatorModule {}
