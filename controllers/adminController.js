const User=require('../Models/userModel')
const bcrypt=require('bcrypt')
const usermodel=require('../Models/userModel')
const session=require('express-session')

let message

const securePassword = async (password) => {
    try {
      const passwordMatch = await bcrypt.hash(password, 10);
      return passwordMatch;
    } catch (error) {
      console.log(error.message);
    }
  };

const loadLogin= async(req,res)=>{
    try{
        console.log('nice');
        res.render('login',{message})
        message=null
    }catch(err){
        console.log(err.message);
    }
}

const verifyLogin= async(req,res)=>{
    try{
        const email=req.body.email
        const password=req.body.password

        const userData=await User.findOne({email:email})

        if(userData){
            const passwordMatch=await bcrypt.compare(password,userData.password)
            console.log(passwordMatch);
            if(passwordMatch){
                console.log('correct');
                console.log(userData.is_admin);
                if(userData.is_admin===0){
                    res.render('login',{message:'Email and password incorrect'})
                }else{
                    req.session.user_id=userData._id
                    res.redirect('/admin/dashboard')
                }
            }else{
                res.render('login',{message:'Email or password is incorrect'})
                console.log('incorrect');
            }
        }else{
            res.render('login',{message:'Email and password incorrect'})
        }


    }catch(err){
        console.log(err.message);
    }
}

const loadDashboard = async (req, res) => {
    try {
      const adminData = await User.findById({ _id: req.session.user_id });
      res.render('dashboard', { admin: adminData });
    } catch (error) {
      console.log(error.message);
    }
  };

const logout=async(req,res)=>{
    try{

        req.session.destroy()
        res.redirect('/admin')

    }catch(err){
        console.log(err.message);
    }
}

const adminDashboard = async (req, res) => {
    try {
        const adminData = await usermodel.findById({ _id: req.session.user_id });
    res.render("dashboard", { admin: adminData });
  } catch (error) {
    console.log(error.message);
  }
  };

  const editUserLoad= async(req,res)=>{
    try{
        const id=req.query.id
        const userData=await User.findById({_id:id})
        if(userData){
            res.render('edit-user',{user:userData})
        }else {
            res.redirect("/admin/dashboard");
          }
        
    }catch(err){
        console.log(err.message);
    }
  }
  const updateUsers=async(req,res)=>{
    try{
        console.log(req.body.name);
        const userData=await User.findByIdAndUpdate({_id:req.body.id},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mob}})
        res.redirect('/admin/dashboard')

    }catch(err){
        console.log(err.message);
    }
  }

  const deleteUser=async(req,res)=>{
    try{
        const id=req.query.id
        await User.deleteOne({ _id:id })
        res.redirect("/admin/dashboard");
    }catch(err){
        console.log(err.message);
    }
  }

  const newUserLoad= async(req,res)=>{
    try {
    const userData = await usermodel.find({is_admin:0});
    const adminData = await usermodel.findById({ _id: req.session.user_id });

    res.render("userList"
    ,{users: userData,admin:adminData}
    );
  } catch (error) {
    console.log(error.message);
  }
  }

  const addUser=async(req,res)=>{
    try{
        const spassword=await securePassword(req.body.password)
        console.log(req.body);
        const user =new User({
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mob,
            password:spassword,
            is_admin:0,
        })

    const userData= await user.save()

    if(userData){
        const userData = await User.findById({ _id: req.session.user_id })
        res.redirect("/admin/dashboard")
    }else{
        res.render('add',{message:"Your registration has been failed"})
    }

    }catch(err){
        console.log(err);
    }
  }

  const block = async (req,res)=>{
    try{
        const userData = await User.findByIdAndUpdate(req.query.id,{$set:{is_block:true}})
        req.session.users=null
        res.redirect('/admin/userList')
    }catch(error){
        console.log(error.me
            );
    }
  }

  const unblock = async (req,res)=>{
    try{
        const userData = await User.findByIdAndUpdate(req.query.id,{$set:{is_block:false}})
        req.session.users=null
        res.redirect('/admin/userList')
    }catch(error){
        console.log(error.me);
    }
  }




module.exports={
    loadLogin,
    verifyLogin,
    loadDashboard,
    logout,
    adminDashboard,
    editUserLoad,
    updateUsers,
    deleteUser,
    newUserLoad,
    addUser,
    block,
    unblock
}