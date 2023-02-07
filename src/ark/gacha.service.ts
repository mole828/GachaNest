import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isNull } from 'lodash';
import { Model } from 'mongoose';
import ArkHypergryphCom from './ak.hypergryph.com';
import {
  Char,
  Doctor,
  DoctorDocument,
  Gacha,
  GachaDocument,
} from './schemas/ark.schema';

const pageSize = 10;

function defaultDict<T>(createValue: (key?: string | symbol) => T): {
  [key: string | symbol]: T;
} {
  const obj = new Proxy(Object.create({}), {
    get(storage, property): T {
      if (!(property in storage)) storage[property] = createValue(property);
      return storage[property];
    },
  });
  Object.defineProperties(obj, {
    toJSON: {
      enumerable: false,
    },
    subscribe: {
      enumerable: false,
    },
    then: {
      enumerable: false,
    },
  });
  return obj;
}

class Analyst<T> {
  counter = defaultDict(() => 0);
  constructor(private readonly key: keyof T) {
    Object.defineProperty(this, 'key', {
      enumerable: false,
    });
  }
  count(item: T) {
    const key = item[this.key];
    if (
      key.constructor === String ||
      key.constructor === Symbol ||
      key.constructor === Number
    ) {
      this.counter[key] += 1;
    } else {
      Logger.log(JSON.stringify(item));
    }
  }
  toJSON() {
    return this.counter;
  }
}

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
    if (!isNull(doc)) {
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
  invalid: Set<string> = new Set();
  async update(doctor: Doctor, bre = true) {
    const { token, channelMasterId, uid, nickName } = doctor;
    this.invalid.delete(nickName);
    const docNet = await ArkHypergryphCom.basic(token, channelMasterId);
    // Logger.log(
    //   `${JSON.stringify(docNet)} update`,
    //   `${this.constructor.name} ${this.update.name}`,
    // );
    if (docNet) {
      if (docNet.nickName !== nickName) {
        await this.doctorModel
          .updateOne({ uid }, { nickName: docNet.nickName })
          .exec();
        Logger.log(`${nickName} => ${docNet.nickName}`, 'update,nickName');
      }
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
      return waitInsert.length;
    } else {
      this.invalid.add(nickName);
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
  // new analyst
  analyst = defaultDict(() => defaultDict(() => new Analyst<Char>('rarity')));
  async analys(gacha: Gacha) {
    for (const char of gacha.chars) {
      this.analyst[''][gacha.pool].count(char);
      this.analyst[gacha.uid][gacha.pool].count(char);
    }
  }
  private async initStatistics() {
    const cur = this.gachaModel.find({}).cursor();
    let gacha = await cur.next();
    while (!isNull(gacha)) {
      this.statisticOne(gacha);
      this.analys(gacha);
      gacha = await cur.next();
    }
    Logger.log(JSON.stringify(await this.statistic('')), 'initStatistics');
  }
}
