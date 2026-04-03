import bcrypt from "bcrypt";

const password = "aditya@07";
const hash = await bcrypt.hash(password, 10);

console.log(hash);