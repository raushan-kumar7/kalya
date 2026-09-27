import { drizzleConfig } from './src';
import { getDatabaseUrl } from '@kalya/utils';

export default drizzleConfig({
  dbCredentials: {
    url: getDatabaseUrl(),
  },
});
