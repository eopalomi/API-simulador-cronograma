import { Module } from '@nestjs/common';
import { ScheduleSimulatorModule } from './modules/schedule-simulator/schedule-simulator.module';

@Module({
  imports: [ScheduleSimulatorModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
