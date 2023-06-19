const session = require("express-session");
const productmodel = require("../Models/productmodel");
const categorymodel = require("../Models/categoryModel");
const usermodal = require("../Models/userModel");

const productList = async (req, res, next) => {
  try {
    const productData = await productmodel.find({});
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
    const dlt = await productmodel.deleteOne({ _id: id });
    if (dlt) {
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
    const id = req.query.id;
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
  try {
    //   for (let i = 0; i < req.files.length; i++) {
    //     const imageupload = req.files[i].path;
    //     const uploadResponse = await cloudinary.uploader.upload(imageupload);
    //     const imageURL = uploadResponse.secure_url;
    //     const productUpdate = await productmodel.updateOne(
    //       { _id: req.query.id },
    //       { $push: { image: imageURL } }
    //     );
    //     console.log(productUpdate);
    //   }
    // if (req.files && req.files.length > 0) {
    //     console.log('inner');
    //   for (i = 0; i < req.files.length; i++) {
    //     image[i] = req.files[i].filename;
    //   }
    // }

    const image = [];
    if (req.files && req.files.length > 0) {
      for (i = 0; i < req.files.length; i++) {
        image[i] = req.files[i].filename;
      }
    }
    const productUpdate = await productmodel.findByIdAndUpdate(
      { _id: req.query.id },
      {
        $set: {
          productName: req.body.name,
          description: req.body.description,
          price: req.body.price,
          quantity: req.body.quantity,
          category: req.body.category,
          brand: req.body.brand,
          status: 0,
        },
      }
    );

    const productData = await productUpdate.save();
    if (productData) {
      res.redirect("/admin/productList");
    } else {
      res.redirect("/admin/productList");
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  productList,
  AddProducts,
  insertProduct,
  deleteProduct,
  editProduct,
  updateProduct,
};
