const multer = require("multer")
const path = require("path")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/adminAsset/bannerImages'))
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
});
const imageFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        req.fileValidationError = 'only image files allowed!';
        return cb(new Error('only image file allowed!'), false);
    }
    cb(null, true)
}
const bannerUpload = multer({ storage: storage, fileFilter: imageFilter, preservePath: true })

module.exports = {
    bannerUpload
}
