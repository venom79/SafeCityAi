import axios from "axios";

const MODEL_SERVICE_URL = process.env.MODEL_SERVICE_URL;

export const generateEmbedding = async ({ image_base64, image_type }) => {
  const res = await axios.post(`${MODEL_SERVICE_URL}/embedding`, {
    image_base64,
    image_type,
  });

  return res.data; 
  // { embedding, model_name, model_version }
};