const mongoose = require("mongoose");

const banner=mongoose.Schema({

    mainText:{
        type:String
    },
    description:{
        type:String
    },
    image:{
        type:String,
        required:true
    },
    status:{
        type:Boolean,
        default:true
    }
});

module.exports=mongoose.model("Banner",banner);