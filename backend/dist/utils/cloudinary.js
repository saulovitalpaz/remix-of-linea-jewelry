import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import dotenv from 'dotenv';
dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dl588nvuj',
    api_key: process.env.CLOUDINARY_API_KEY || '285658214676941',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'pMt6A2dwFZ6trfW_AlEm9fPqyNg',
});
export const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ folder: 'chique-detalhes' }, (error, result) => {
            if (result) {
                resolve(result.secure_url);
            }
            else {
                reject(error);
            }
        });
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};
//# sourceMappingURL=cloudinary.js.map