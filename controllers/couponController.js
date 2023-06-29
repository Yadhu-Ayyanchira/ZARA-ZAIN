const Coupon = require('../Models/couponModel')
const User = require('../Models/userModel')


const loadCopon = async (req, res, next) => {
    console.log('coupon in');
    try {
        const adminData = await User.findById(req.session.Auser_id);
        const couponData = await Coupon.find({});

        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const couponCount = couponData.length;
        const totalPages = Math.ceil(couponCount / limit);
        const paginatedCoupon = couponData.slice(startIndex, endIndex);

        res.render('couponList',
            {
                admin: adminData,
                activePage: 'couponList',
                coupon: couponData,
                coupon: paginatedCoupon,
                currentPage: page,
                totalPages: totalPages,

            });
    } catch (err) {
        next(err)
    }
}


const addCoupon = async (req, res, next) => {
    try {
        const coupon = new Coupon({
            code: req.body.code,
            discountType: req.body.discountType,
            startDate: req.body.startDate,
            expiryDate: req.body.expiryDate,
            discountPercentage: req.body.percentage,
        });
        const couponData = await coupon.save();
        if (couponData) {
            res.redirect('/admin/couponList');
        } else {
            res.redirect('/admin/couponList');
        }
    } catch (err) {
        next(err);
    }
};

const applyCoupon = async (req, res, next) => {
    try {
        const id = req.session.user_id;
        const couponCode = req.body.code;
        const amount = req.body.amount;
        console.log('id:'+id+'   cucode:'+couponCode+'   amount:'+amount);
        const userExist = await Coupon.findOne({ code: couponCode, user: { $in: [id] } });

        if (userExist) {
            res.json({ user: true });
        } else {
            const couponData = await Coupon.findOne({ code: couponCode });
            if (couponData) {
                if (couponData.expiryDate <= new Date()) {
                    res.json({ date: true });
                } else {
                    console.log('looooooo');
                    await Coupon.findOneAndUpdate({ _id: couponData._id }, { $push: { user: id } });
                    const perAmount = Math.round((amount * couponData.discountPercentage) / 100);
                    const disTotal = Math.round(amount - perAmount);
                    console.log('per:'+perAmount+'   dis:'+disTotal);
                    return res.json({ amountOkey: true, disAmount: perAmount, disTotal });
                }
            }

        }
        // res.json({ invalid: true });
    } catch (err) {
        next(err)
    }
}
module.exports ={
    loadCopon,
    addCoupon,
    applyCoupon
}