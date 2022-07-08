import {
  Controller,
  Get,
  Logger,
  Param,
  ParamData,
  Post,
  Query,
  Req,
  Request,
} from '@nestjs/common';
import { isUndefined, sum } from 'lodash';
import { GachaService } from './gacha.service';

@Controller('ark')
export class GachaController {
  constructor(readonly service: GachaService) {}

  @Post('register')
  async register(@Query('token') token: string) {
    Logger.log(token, this.register.name);
    try {
      const { channelToken } = JSON.parse(token);
      token = channelToken.token;
      Logger.log(token, '/v1/token_by_cookie');
    } catch {}
    try {
      const { data } = JSON.parse(token);
      token = data.content;
      Logger.log(token, 'hg,ak-b');
    } catch {}
    const doc = await this.service.register(token);
    if (isUndefined(doc)) {
      return {
        code: -1,
        msg: '添加失败',
        doc,
      };
    }
    return {
      code: 0,
      msg: '添加成功',
      doc,
    };
  }

  @Get('list.doc')
  async doctors() {
    return this.service.doctors({ token: 0 });
  }
  @Get('gacha')
  async gacha(@Query('page') page: number, @Query('uid') uid: string) {
    let query = {};
    if (uid) {
      query = Object.assign(query, { uid });
    }
    const list = await this.service.gachas(query, page);
    const pagination = await this.service.pagination(query, page);
    for (const g of list) {
      g.nickName = await this.service.nick(g.uid);
    }
    return {
      code: 0,
      data: {
        list,
        pagination,
      },
      msg: '',
    };
  }
  @Get('statistic')
  async statistic(@Query('uid') uid = '') {
    const rar = await this.service.statistic(uid);
    return {
      uid: uid,
      nickName: await this.service.nick(uid),
      sum: sum(Object.values(rar)),
      rar,
    };
  }
  @Get('doc.invalid')
  async invalid() {
    return [...this.service.invalid.values()];
  }
}
