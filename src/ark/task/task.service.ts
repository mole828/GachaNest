import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";

@Injectable()
export class TaskService {
    constructor(){
        Logger.log('constructor', this.constructor.name);
    }
    @Cron('0 * * * * *')
    main(){
        Logger.log('main', this.main.name);
    }
}