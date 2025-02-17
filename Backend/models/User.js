const mongoose=require('mongoose')

const Uschema=new mongoose.Schema({
    fname:String,
    lname:String,
    email:String,
    dob:String,
    mobile_no:Number,
    password:String,
    otp:String,
    isVerified:Boolean,
    fcmToken:String
})

const User=mongoose.model("userdata",Uschema);
module.exports=User