import axios from "axios";
import fs from "fs";
import FormData from "form-data";

const MODEL_SERVICE_URL = process.env.MODEL_SERVICE_URL;

console.log(MODEL_SERVICE_URL);

export const generatePhotoEmbedding = async (imagePath) => {
  const form = new FormData();
  form.append("image", fs.createReadStream(imagePath));
  form.append("image_type", "PHOTO");

  const response = await axios.post(
    `${MODEL_SERVICE_URL}/embedding/file`,
    form,
    { headers: form.getHeaders() }
  );

  return response.data;
};
