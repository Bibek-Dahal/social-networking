import { bucket } from '../../app.js'; // Adjust the path as necessary
import { Readable } from 'stream';

export const uploadFile = async (file) => {
  try {
    const imageBuffer = file.buffer;
    let imageName = file.originalname;
    const contentType = file.mimetype;

    // Convert buffer to readable stream
    const bufferStream = new Readable();
    bufferStream.push(imageBuffer);
    bufferStream.push(null);

    // Generate a unique file name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    imageName = uniqueSuffix + '.' + file.originalname.split('.').pop();

    // Create a file reference in Firebase Storage
    const fileUpload = bucket.file(imageName);

    // Upload the file and generate the public URL
    await new Promise((resolve, reject) => {
      const stream = fileUpload.createWriteStream({
        metadata: {
          contentType: contentType,
        },
      });

      bufferStream
        .pipe(stream)
        .on('error', (err) => {
          console.error('Error uploading file:', err);
          reject(err);
        })
        .on('finish', () => {
          resolve();
        });
    });

    // Generate the public URL
    console.log('bucket-name===', bucket.name);
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${imageName}?alt=media`;
    return publicUrl; // Return the public URL after upload is complete
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error; // Rethrow the error for further handling
  }
};
