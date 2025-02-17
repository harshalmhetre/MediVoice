const mongoose=require('mongoose')

const MedicineSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    medicines:[
    {
    medicineName:{type:String,required:true,trim:true},
    description:{type:String},
    dosage:{type:String},
    timeSchedule:[String]
    }
],
    createdAt:{
        type:Date,
        default:Date.now
    }
})

const Medicine=mongoose.model("Medicine",MedicineSchema)
module.exports=Medicine;