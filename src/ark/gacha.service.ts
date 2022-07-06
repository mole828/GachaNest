import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { log } from 'src/util/log';
import ArkHypergryphCom from './ak.hypergryph.com';
import { Doctor, DoctorDocument } from './schemas/doctor.schema';

@Injectable()
export class GachaService {
    doctorModel: Model<DoctorDocument>
    constructor(@InjectModel(Doctor.name) doctorModel: Model<DoctorDocument>){
        this.doctorModel = doctorModel;
    }
    async doctors(){
        const a = ArkHypergryphCom;
        const cur = this.doctorModel.find().exec()
        return cur;
    }
}
