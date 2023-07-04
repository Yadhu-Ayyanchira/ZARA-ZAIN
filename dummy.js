const productData = await Product.find({is_delete:false,
$or:[
{product:{$regex:'.*'+search+'.*',$options:'i'}},
{price:{$regex:'.*'+search+'.*'}},
{description:{$regex:'.*'+search+'.*',$options:'i'}},
]
})