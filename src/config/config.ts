import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  web: {
    port: process.env.APP_PORT,
  },
  database: {
    host: process.env.DATABASE_HOST as string,
    port: Number(process.env.DATABASE_PORT),
    user: process.env.DATABASE_USER as string,
    password: process.env.DATABASE_PASSWORD as string,
    database: process.env.DATABASE_NAME as string,
  },
};
