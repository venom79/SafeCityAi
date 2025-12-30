import dotenv from "dotenv";
dotenv.config();

if(process.env.DATABASE_URL){
    console.log("ENV loaded");
}