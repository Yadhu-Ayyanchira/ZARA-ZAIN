const mongoose = require("mongoose");

const banner=mongoose.Schema({

    mainText:{
        type:String
    },
    discription:{
        type:String
    },
    image:{
        type:String,
        required:true
    }
});

module.exports=mongoose.model("Banner",banner);