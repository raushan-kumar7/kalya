const APP_CONFIG = {
  kalyaSeverApi: {
    url: process.env.EXPO_PUBLIC_KALYA_API_SERVER_URL!,
    version: process.env.EXPO_PUBLIC_KALYA_API_VERSION!,
  },
  database: { url: process.env.EXPO_PUBLIC_DATABASE_URL! },
};

export { APP_CONFIG };
