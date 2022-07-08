import { Logger } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

Logger.log('init', module.filename);

const types = {
  uid: String,
  channelId: Number,
};

@Schema()
export class Doctor {
  @Prop()
  uid: string;
  @Prop()
  nickName: string;
  @Prop()
  guest: number;
  @Prop()
  channelMasterId: number;

  @Prop()
  token: string;
}
export type DoctorDocument = Doctor & Document;
export const DoctorSchema = SchemaFactory.createForClass(Doctor);

export interface Char {
  name: string;
  rarity: number;
  isNew: boolean;
}
@Schema()
export class Gacha {
  @Prop()
  ts: number;
  @Prop()
  pool: string;
  @Prop()
  chars: Array<Char>;
  @Prop()
  uid: string;
  @Prop()
  nickName: string;
}
export type GachaDocument = Gacha & Document;
export const GachaSchema = SchemaFactory.createForClass(Gacha);
