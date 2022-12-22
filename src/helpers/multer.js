const multer  = require('multer');
// var upload = multer({ dest: 'uploads/' });


// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
// 	const pathImg = path.join(__dirname, '../../uploads/avatar');

// 	if (!fs.existsSync(pathImg)){
// 		fs.mkdirSync(pathImg);
// 	}

//   	cb(null, pathImg);
//   },
//   filename: function (req, file, cb) {
//   	avatar = uuid.v4() + file.originalname;
//     cb(null, avatar);
//   }
// });

const upload = multer({
	storage: multer.diskStorage({}),
	fileFilter: (req, file, cb) => {
		if (file.mimetype !== "image/png" && file.mimetype !== "image/jpg" && file.mimetype !== "image/jpeg") {
		  cb(null, false);
		  return req.flash('error', 'El formato de archivo no esta soportado, sube una imagen con extensión png, jpg o jpeg.');
		}
		
		cb(null, true);
	}
});

module.exports = upload;