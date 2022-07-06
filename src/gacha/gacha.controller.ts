import { Controller, Get } from '@nestjs/common';
import { log } from 'src/util/log';
import { GachaService } from './gacha.service';

@Controller('gacha')
export class GachaController {
    @log
    init(){}
    constructor(readonly service:GachaService){
        this.init();
    }

    // @log
    @Get('doctors')
    async doctors(){
        return this.service.doctors();
    }
}
