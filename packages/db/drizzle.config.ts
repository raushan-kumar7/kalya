import { drizzleConfig } from './src';
import { dbEnv } from '@kalya/env/db';

export default drizzleConfig({
  dbCredentials: {
    url: dbEnv.url,
  },
});
