import { Injectable } from '@nestjs/common';
import { log } from 'src/util/log';
import ArkHypergryphCom from './ak.hypergryph.com';

@Injectable()
export class GachaService {
    @log
    init(){}
    constructor(){
        this.init();
    }
    @log
    async doctors(){
        const a = ArkHypergryphCom;
        a.basic('')
        return [];
    }
}
