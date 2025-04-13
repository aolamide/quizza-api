import { config } from '../config/config';
import { DataSource, DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: config.database.host,
  username: config.database.user,
  password: config.database.password,
  database: config.database.database,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/db/migrations/*.ts'],
  synchronize: false,
};
console.log(dataSourceOptions);
const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
