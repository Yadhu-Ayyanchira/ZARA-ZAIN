
const isLogin = async (req, res, next) => {
    try {
      if (req.session.user_id) {
        
        next();
      } else {
        res.redirect("/admin");
      }
    } catch (err) {
      console.log(err.message);
      next(err);
    }
  };
 
  const isLogout = async (req, res, next) => {
    try {
      if (req.session.Auser_id) {
        res.redirect("/admin/dashboard");
      } else{
        next();
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  
  module.exports = {
    isLogin,
    isLogout,
  };