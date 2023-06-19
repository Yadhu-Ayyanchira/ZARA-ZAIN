const addToCart = async (req,res,next) => {
    try {
      const userId = req.session.user_id;
      const userData = await User.findOne({ _id: userId });
     
      const productId = req.body.id;
      const productData = await Product.findOne({ _id: productId });
  
      const productQuantity = productData.stockQuantity;
  
      const cartData = await Cart.findOneAndUpdate(
        { userId: userId },
        {
          $setOnInsert: {
            userId: userId,
            userName: userData.name,
            products: [],
          },
        },
        { upsert: true, new: true }
      );
      const updatedProduct = cartData.products.find((product) => product.productId.toString() === productId.toString());
      const updatedQuantity = updatedProduct ? updatedProduct.count : 0;
  
      if (updatedQuantity + 1 > productQuantity) {
        return res.json({
          success: false,
          message: "Quantity limit reached!",
        });
      }
  
      const cartProduct = cartData.products.find((product) => product.productId.toString() === productId.toString());
  
      if (cartProduct) {
        await Cart.updateOne(
          { userId: userId, "products.productId": productId },
          {
            $inc: {
              "products.$.count": 1,
              "products.$.totalPrice": productData.price,
            },
          }
        );
      } else {
        cartData.products.push({
          productId: productId,
          productPrice: productData.price,
          totalPrice: productData.price,
        });
        await cartData.save();
      }
  
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  };



  function changeQuantity(userId, proId, count) {
    $.ajax({
        url: '/changeQuantity',
        data: {
        user: userId,
        product: proId,
        count: count
        },
        method: 'post',
        success: (response) => {
        if (response.success) {
            $('#reloadDiv').load('/cart #reloadDiv');
        } else if (response.check) {
            swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Out of stock'
            });
        } else {
            swal.fire({ 
                position:'center',
                icon: 'warning',
                text: response.message,
                timer: 1500,
                showConfirmButton: false,
            });
        }
        },
        error: (error) => {
        console.log(error);
        }
    });
    }