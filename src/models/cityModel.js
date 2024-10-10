import mongoose from 'mongoose';

const citySchema = new mongoose.Schema({
    city:{type:String,required: [true,"City name is required!"],index:true,unique:true},
},
    {timestamps: true,versionKey:false});

const City = mongoose.model('cities',citySchema);
export default City;