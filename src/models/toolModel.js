import mongoose from 'mongoose';

const toolSchema = new mongoose.Schema({
    title:{type:String,required: true,index:true,unique:true},
    subTitle:{type:String,required: true,index:true},
    des:{type:String,required: true,index:true}
},
    {versionKey:false,timestamps:true});

const Tool = mongoose.model('tools', toolSchema);
export default Tool;