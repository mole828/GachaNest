import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GachaController } from './gacha/gacha.controller';
import { GachaService } from './gacha/gacha.service';
import { TaskService } from './gacha/task/task.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController, GachaController],
  providers: [AppService, GachaService, TaskService],
})
export class AppModule {}
