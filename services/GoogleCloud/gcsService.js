import { Storage } from "@google-cloud/storage";
import dotenv from "dotenv";
import path from "path";
import {v4 as uuidv4 } from "uuid";

dotenv.config();

const gcsConfidential = JSON.parse(process.env.GCS_CREDENTIALS);

// Initialize google storage
    const storage = new Storage({
      credentials: gcsConfidential,
      projectId: gcsConfidential.project_id,
    });

// Specify the bucket name
    const bucketName = 'citizen_files';

// Create a function to upload files to Google Cloud Storage
    export const uploadFileToGCS = async (file) => {
        try {
            const extension = path.extname(file.originalname);
            const filename = `${uuidv4()}${extension}`;
            const destination = `upload/${filename}`;

             await storage.bucket(bucketName).upload(file.path, {
               destination,
               metadata: {
                 contentType: file.mimetype,
               },
             });

             await storage.bucket(bucketName).file(destination).makePublic();

             const fileUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;


             return fileUrl;
             
        } catch (error) {
            console.error('Error uploading file to GCS:', error);
            throw new Error('Failed to upload file to Google Cloud Storage')
        }
    };

