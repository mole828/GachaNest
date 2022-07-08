import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GachaController } from './ark/gacha.controller';
import { GachaService } from './ark/gacha.service';
import { Doctor, DoctorSchema, Gacha, GachaSchema } from './ark/schemas/ark.schema';
import { GachaUpdateService } from './ark/task/task.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forRoot('mongodb://localhost/moles'),
    MongooseModule.forFeature([
      {name:Doctor.name, schema: DoctorSchema},
      {name:Gacha.name, schema: GachaSchema},
    ]),
  ],
  controllers: [
    AppController, 
    GachaController
  ],
  providers: [
    AppService, 
    GachaService, 
    GachaUpdateService,
  ],
})
export class AppModule {}
