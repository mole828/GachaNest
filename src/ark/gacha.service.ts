import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isNull, isUndefined } from 'lodash';
import { Model } from 'mongoose';
import ArkHypergryphCom from './ak.hypergryph.com';
import {
  Doctor,
  DoctorDocument,
  Gacha,
  GachaDocument,
} from './schemas/ark.schema';

const pageSize = 10;

@Injectable()
export class GachaService {
  doctorModel: Model<DoctorDocument>;
  gachaModel: Model<GachaDocument>;
  constructor(
    @InjectModel(Doctor.name) doctorModel: Model<DoctorDocument>,
    @InjectModel(Gacha.name) gachaModel: Model<GachaDocument>,
  ) {
    Logger.log('constructor', this.constructor.name);
    this.doctorModel = doctorModel;
    this.gachaModel = gachaModel;
    this.initStatistics();
  }
  async register(token: string): Promise<Doctor> {
    const doc = await ArkHypergryphCom.basic(token);
    if (!isUndefined(doc)) {
      const { uid } = doc;
      const dib = await this.doctorModel.findOne({ uid }).exec();
      doc.token = token;
      if (isNull(dib)) {
        this.doctorModel.insertMany([doc]);
        Logger.log(
          `${undefined} => ${JSON.stringify(doc)}`,
          `${this.constructor.name}`,
        );
      } else if (token !== dib.token) {
        this.doctorModel.updateOne({ uid }, { token }).exec();
        Logger.log(
          `${JSON.stringify(dib)} => ${JSON.stringify(doc)}`,
          `${this.constructor.name}`,
        );
      }
      await this.update(doc);
    }
    return doc;
  }
  async doctors(projection = {}): Promise<Doctor[]> {
    const ans = await this.doctorModel.find({}, projection).exec();
    return ans;
  }
  async update(doctor: Doctor, bre = true) {
    const { token, channelMasterId, uid } = doctor;
    const docNet = await ArkHypergryphCom.basic(token, channelMasterId);

    // Logger.log(
    //   `${JSON.stringify(docNet)} update`,
    //   `${this.constructor.name} ${this.update.name}`,
    // );
    if (docNet) {
      const cur = ArkHypergryphCom.gachaCursor(token, channelMasterId);
      const waitInsert = [];
      for await (const gacha of cur) {
        gacha.uid = uid;
        const { ts } = gacha;
        const gib: Gacha = await this.gachaModel.findOne({ uid, ts }).exec();
        if (isNull(gib)) {
          waitInsert.push(gacha);
        } else {
          if (bre) break;
        }
      }
      this.gachaModel.insertMany(waitInsert);
      waitInsert.forEach((gacha) => this.statisticOne(gacha));
      if (waitInsert.length !== 0) {
        Logger.log(
          `${docNet.nickName}:${waitInsert.length}`,
          `${this.constructor.name} ${this.update.name}`,
        );
      }
    }
    return -1;
  }
  nickMap: Map<string, string> = new Map();
  async nick(uid: string) {
    if (this.nickMap.has(uid)) return this.nickMap.get(uid);
    const dib = await this.doctorModel.findOne({ uid }).exec();
    if (isNull(dib)) return '';
    const { nickName } = dib;
    this.nickMap.set(uid, nickName);
    return nickName;
  }

  async gachas(filter = {}, current = 0) {
    return this.gachaModel
      .find(filter)
      .sort({ ts: -1 })
      .skip(current * pageSize)
      .limit(pageSize)
      .exec();
  }
  async pagination(filter = {}, current = 0) {
    return {
      current,
      pageSize,
      total: await this.gachaModel.countDocuments(filter).exec(),
    };
  }

  statistics: Map<string, object> = new Map();
  async statistic(uid: string) {
    if (this.statistics.has(uid)) return this.statistics.get(uid);
    const o = { 2: 0, 3: 0, 4: 0, 5: 0 };
    this.statistics.set(uid, o);
    return o;
  }
  private async statisticOne(gacha: Gacha) {
    const summary = await this.statistic('');
    const user = await this.statistic(gacha.uid);
    for (const char of gacha.chars) {
      summary[char.rarity] += 1;
      user[char.rarity] += 1;
    }
  }
  private async initStatistics() {
    const cur = this.gachaModel.find({}).cursor();
    let gacha = await cur.next();
    while (!isNull(gacha)) {
      this.statisticOne(gacha);
      gacha = await cur.next();
    }
    Logger.log(JSON.stringify(await this.statistic('')), 'stringify');
  }
}
