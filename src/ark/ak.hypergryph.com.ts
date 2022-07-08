import { Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { range } from 'lodash';
import { log } from '../util/log';
import { Doctor, Gacha } from './schemas/ark.schema';

const arkhost = 'https://as.hypergryph.com';

export interface Pagination {
  current: number;
  total: number;
}

interface GachaPage {
  list: Array<Gacha>;
  pagination: Pagination;
}

export default class ArkHypergryphCom {
  static async basic(token: string, channelId = 0): Promise<Doctor> {
    if (channelId !== 2) {
      try {
        // main
        const response = await axios.post(`${arkhost}/u8/user/info/v1/basic`, {
          appId: 1,
          channelMasterId: 1,
          channelToken: {
            token,
          },
        });
        const { status, msg } = response.data;
        if (status !== 0) throw msg;
        const data: Doctor = response.data.data;
        return data;
      } catch (e) {}
    }
    if (channelId !== 1) {
      try {
        // bili
        const response = await axios.post(`${arkhost}/u8/user/info/v1/basic`, {
          token,
        });
        const { status, msg } = response.data;
        if (status !== 0) throw msg;
        const data: Doctor = response.data.data;
        return data;
      } catch (e) {}
    }
  }
  static async gacha(
    token: string,
    channelId = 1,
    page = 1,
  ): Promise<GachaPage> {
    const response = await axios.get(
      'https://ak.hypergryph.com/user/api/inquiry/gacha',
      {
        params: {
          page,
          token,
          channelId,
        },
      },
    );
    const body = response.data;
    const { code, data, msg } = body;
    if (code === 0) return data;
    Logger.error(JSON.stringify(body), 'gacha body');
    return new Promise(() => []);
  }
  static async *gachaCursor(token: string, channelId: number) {
    for (const page of range(1, 11)) {
      const gp: GachaPage = await this.gacha(token, channelId, page);
      for (const gacha of gp.list) {
        yield gacha;
      }
      if (gp.list.length !== 10) break;
    }
  }
}
/*
{"code":0,"data":{"content":"qAA4V/0Q6KcVDLZrvb5p1dPIv0jR6Q8xDJQW5sFbwtQJfZj+uoxnMGjrVrJcNze9AvQG9elOPMmsTqM1Rcd3Bj/x0lRqUXXfKs/As2cAsqT8kC+sSQxXqIP/qrzIxpPeuC/UlwHLE2SxtdRikGGVkSGroCVknswk6iTaCGeYGkR8ZcELSchtFvEKZ/8cX2NDhYzo/3SAiIhi"},"msg":""}
*/
if (require.main === module) {
  (async function () {
    const token =
      'Z/799H28Po5mkODrgdDEW2GIaRzSpM6m+gdjGRFyntnCtbfqsLR3uGlgn82cQZh854Idti1XKMC0NkvZObj1dUq6C+F3sDZKNyYXyPZNBJMkO/G9MUJMhAV7SUEvzwnj2vZZf5YMW03zJJl7dFosF05gHR8r5fWT8B5D8TNr7uEKp3OXtTyWBywgpnIwifiQKMCCdqRwU6R5';
    const service = ArkHypergryphCom;
    const userInfo = await service.basic(token);
    console.log(userInfo);
    //Logger.log( (await service.gacha(token)).list[0].chars[0] )
    for await (const gacha of service.gachaCursor(
      token,
      userInfo.channelMasterId,
    )) {
      // console.log(gacha);
    }
  })();
}
