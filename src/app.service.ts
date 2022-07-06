import { Injectable, Logger } from '@nestjs/common';

import {range} from 'lodash';

@Injectable()
export class AppService {
  getHello(): string {
    
    for(const i of range(3)){
      Logger.log(i);
    }
    return 'Hello World!';
  }
}
