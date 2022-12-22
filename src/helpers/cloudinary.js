const { v2: cloudinary } = require('cloudinary');
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_SECRET, CLOUDINARY_API_KEY } = process.env;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME, 
  api_key: CLOUDINARY_API_KEY, 
  api_secret: CLOUDINARY_API_SECRET,
  secure: true
})

exports.uploadImage = async (filePath) => {
  return await cloudinary.uploader.upload(filePath, {
    folder: 'Chat-MeetMe'
  })
}

exports.removeImage = async (publicId) => {
  if(publicId){
    return await cloudinary.uploader.destroy(publicId)
  }
}