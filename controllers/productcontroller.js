const session = require("express-session");
const productmodel = require("../Models/productmodel");
const categorymodel = require("../Models/categoryModel");
const usermodal = require("../Models/userModel");
const Sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const productList = async (req, res, next) => {
  try {
    const productData = await productmodel.find({ is_delete: false });
    const adminData = await usermodal.findById({ _id: req.session.Auser_id });
    res.render("productList", { products: productData, admin: adminData });
  } catch (error) {
    next(error);
  }
};

const AddProducts = async (req, res, next) => {
  try {
    const productData = await productmodel.find({});
    const categoryData = await categorymodel.find({ is_delete: false });
    const adminData = await usermodal.findById({ _id: req.session.Auser_id });

    res.render("addProduct", {
      category: categoryData,
      products: productData,
      admin: adminData,
    });
  } catch (error) {
    next(error);
  }
};

const insertProduct = async (req, res, next) => {
  try {
    const image = [];
    if (req.files && req.files.length > 0) {
      for (i = 0; i < req.files.length; i++) {
        image[i] = req.files[i].filename;
        await Sharp("./public/adminAsset/adminImages/" + req.files[i].filename) // added await to ensure image is resized before uploading
          .resize(400, 400)
          .toFile(
            "./public/adminAsset/adminImages/productImage/" +
              req.files[i].filename
          );
      }
    }
    // const category = await categorymodel.findById(req.body.id);
    const new_product = new productmodel({
      productName: req.body.productName,
      price: req.body.price,
      image: image,
      idealfor: req.body.idealfor,
      brand: req.body.brand,
      category: req.body.category,
      StockQuantity: req.body.StockQuantity,
      description: req.body.description,
    });
    const productData = await new_product.save();
    if (productData) {
      // const categoryData = await categorymodel.find({})
      return res.redirect("/admin/addProduct");
    } else {
      return res.redirect("/admin/addProduct");
    }
  } catch (error) {
    next(error);
  }
};


const deleteProduct = async (req, res, next) => {
  try {
    const id = req.query.id;
    const update = { is_delete: true };
    const result = await productmodel.updateOne({ _id: id }, update);
    if (result.nModified > 0) {
      res.redirect("/admin/productList");
    } else {
      res.redirect("/admin/productList");
    }
  } catch (error) {
    next(error);
  }
};

const editProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    const prodata = await productmodel.findById({ _id: id });
    const adminData = await usermodal.findById({ _id: req.session.Auser_id });
    if (prodata) {
      res.render("editProduct", { product: prodata, admin: adminData });
    } else {
      res.redirect("/admin/dashboard");
    }
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  if (
    req.body.product === "" ||
    req.body.stock.trim() === "" ||
    req.body.category === "" ||
    req.body.description === "" ||
    req.body.price === ""
  ) {
    const id = req.params.id;
    const productData = await productmodel
      .findOne({ _id: id })
      .populate("Category");

    const categoryData = categorymodel.find();
    const adminData = await usermodal.findById({ _id: req.session.auser_id });
    res.render("editProduct", {
      admin: adminData,
      product: productData,
      message: "All fields required",
      category: categoryData,
    });
  } else {
    try {
      // const arrayimg = []
      // for (file of req.files) {
      //   arrayimg.push(file.filename)
      // }
      const id = req.params.id;
      let c = await productmodel.updateOne(
        { _id: id },
        {
          $set: {
            productName: req.body.product,
            StockQuantity: req.body.stock,
            category: req.body.category,
            price: req.body.price,
            description: req.body.description,
          },
        }
      );

      res.redirect("/admin/productList");
    } catch (error) {
    next(error);
    }
  }
};

const deleteimage = async (req, res, next) => {
  try {
    const imgid = req.params.imgid;
    const prodid = req.params.prodid;
    fs.unlink(
      path.join(__dirname, "../public/adminAsset/adminImages", imgid),
      () => {}
    );
    const productimg = await productmodel.updateOne(
      { _id: prodid },
      { $pull: { image: imgid } }
    );
    res.redirect("/admin/editProduct/" + prodid);
  } catch (err) {
    next(err);
  }
};

const updateimage = async (req, res, next) => {
  try {
    const id = req.params.id;
    const prodata = await productmodel.findOne({ _id: id });
    const imglength = prodata.image.length;

    if (imglength <= 10) {
      let images = [];
      for (file of req.files) {
        images.push(file.filename);
      }

      if (imglength + images.length <= 10) {
        const updatedata = await productmodel.updateOne(
          { _id: id },
          { $addToSet: { image: { $each: images } } }
        );

        res.redirect("/admin/editProduct/" + id);
      } else {
        const productData = await productmodel
          .findOne({ _id: id })
          .populate("category");
        const adminData = await usermodal.findById({
          _id: req.session.Auser_id,
        });
        const categoryData = await categorymodel.find();
        res.render("editProduct", {
          admin: adminData,
          product: productData,
          category: categoryData,
          imgfull: true,
        });
      }
    } else {
      res.redirect("/admin/editProduct/");
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  productList,
  AddProducts,
  insertProduct,
  deleteProduct,
  editProduct,
  updateProduct,
  deleteimage,
  updateimage,
};
