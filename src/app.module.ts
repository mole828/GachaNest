import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GachaController } from './ark/gacha.controller';
import { GachaService } from './ark/gacha.service';
import { Doctor, DoctorSchema } from './ark/schemas/doctor.schema';
import { TaskService } from './ark/task/task.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forRoot('mongodb://localhost/moles'),
    MongooseModule.forFeature([{name:Doctor.name, schema: DoctorSchema}]),
  ],
  controllers: [
    AppController, 
    GachaController
  ],
  providers: [
    AppService, 
    GachaService, 
    TaskService,
  ],
})
export class AppModule {}
