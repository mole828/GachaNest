import { Logger } from '@nestjs/common';
import axios from 'axios';
import _ from 'lodash';
import { log } from '../util/log';

const arkhost:string = 'https://as.hypergryph.com'

export interface Doctor{
    uid:            String;
    nickName:       String;
    guest:          Number;
    channelMasterId:Number;
}

export interface Char {
    name:   String;
    rarity: Number;
    isNew:  Boolean;
}

export interface Gacha{
    ts:     Number;
    pool:   Number;
    chars:  Array<Char>;
}

export interface Pagination{
    current:Number;
    total:  Number;
}

interface GachaPage{
    list:       Array<Gacha>;
    pagination: Pagination;
}



export default class ArkHypergryphCom {
    constructor(){
    }
    @log
    static async basic(token:String):Promise<Doctor> {
        try{ // main
            const response = await axios.post(`${arkhost}/u8/user/info/v1/basic`,{
                'appId': 1,
                'channelMasterId': 1,
                'channelToken': {
                    token
                }
            },);
            const {status, msg,} = response.data
            if(status!==0)throw(msg);
            const data:Doctor = response.data.data;
            return data;
        }catch(e){}
        try{ // bili
            const response = await axios.post(`${arkhost}/u8/user/info/v1/basic`,{
                token,
            },);
            const {status, msg,} = response.data
            if(status!==0)throw(msg);
            const data:Doctor = response.data.data;
            return data;
        }catch(e){}
    }
    @log
    static async gacha(token:String, channelId:Number=1, page:Number=1): Promise<GachaPage> {
        const response = await axios.get('https://ak.hypergryph.com/user/api/inquiry/gacha', {
            params: {
                page,
                token,
                channelId,
            },
        });
        const body = response.data;
        const {code, data, msg,} = body;
        if(code===0)return data;
        Logger.error(JSON.stringify(body),'gacha body');
        return new Promise(()=>[]);
    }
    @log
    static async *gachaCursor(token:String, channelId:Number) {
        for(const page of _.range(1,11)){
            const gp: GachaPage = await this.gacha(token, channelId, page );
            for(const gacha of gp.list){
                yield gacha;
            }
            if(gp.list.length!==10)break;
        }
    }
}

if(require.main===module){
    (async function() {
        const token = 'Z/799H28Po5mkODrgdDEW2GIaRzSpM6m+gdjGRFyntnCtbfqsLR3uGlgn82cQZh854Idti1XKMC0NkvZObj1dUq6C+F3sDZKNyYXyPZNBJMkO/G9MUJMhAV7SUEvzwnj2vZZf5YMW03zJJl7dFosF05gHR8r5fWT8B5D8TNr7uEKp3OXtTyWBywgpnIwifiQKMCCdqRwU6R5'
        const service = ArkHypergryphCom;
        const userInfo = await service.basic(token)
        console.log(userInfo);
        // Logger.log( (await service.gacha(token)).list[0].chars[0] )
        for await(const gacha of service.gachaCursor(token, userInfo.channelMasterId)){
            // console.log(gacha);
        }
    })()
}
