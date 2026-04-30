import cloudinary from "./cloud.js";
// بباصي البفر بتاع الصوره والمجلد اللي هحط فيه الصوره في كلاودنري
export const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        stream.end(buffer);
    });
};