import { Logger } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

Logger.log('init', module.filename);

export type DoctorDocument = Doctor & Document;

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
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);
