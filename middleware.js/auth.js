const userModel = require("../Models/userModel");

const isLogin = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      next();
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.log(err.message);
    next(err);
  }
};



const isLogout = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      res.redirect("/index");
    } else {
      next();
    }
  } catch (err) {
    console.log(err.message);
    next(err);
  }
};

const isBlock =async(req,res,next)=>{
  try {
    if(req.session.user_id ){
    const userData= await userModel.findOne({_id:req.session.user_id}) 
    if(userData.is_block==false && userData.is_admin==0){
      next()
    }else{
      req.session.destroy()
      res.redirect("/index")
    }
    }else{
      next()
      }
  } catch (err) {
    console.log(err.message);
    next(err);
  }
}

module.exports = {
  isLogin,
  isLogout,
  isBlock
};
