import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  MONGO_URI: process.env.MONGO_URI,
  PORT: Number(process.env.PORT),
};
