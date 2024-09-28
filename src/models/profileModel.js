import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
        firstName:{type:String,required: true,index:true},
        lastName:{type:String,required: true,index:true},
        mobile:{type:String,required: true,index:true},
        subject:{type:String,required: true,index:true},
        file:{type:String,required: true,index:true},
        message:{type:String,required: true,index:true},
        userID:{type:mongoose.Schema.Types.ObjectId,required:true},
    },
    {versionKey:false,timestamps:true});

const Profile = mongoose.model('profiles', profileSchema);
export default Profile;