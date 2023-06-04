const mongoose=require('mongoose')

const categorySchema= new mongoose.Schema({
    categoryName:{
        type:String,
        require:true
    },
    is_delete:{
        type:Boolean,
        default:false
    }
})
module.exports=mongoose.model('Category',categorySchema)