import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { GachaService } from '../gacha.service';

function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

@Injectable()
export class GachaUpdateService {
  constructor(private readonly service: GachaService) {
    Logger.log('constructor', this.constructor.name);
  }
  @Cron('0 */20 * * * *')
  async update() {
    try {
      const doctors = await this.service.doctors();
      for (const doctor of doctors) {
        await sleep(15 * 1000);
        this.service.update(doctor);
      }
    } catch (e) {
      Logger.error(e, this.constructor.name);
    }

    // Logger.log(
    //   `${doctors.length} need to update`,
    //   `${this.constructor.name} update gacha`,
    // );
  }
}
