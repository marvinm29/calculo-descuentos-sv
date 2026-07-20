module.exports = {
  apps: [
    {
      name: 'calculo-api',
      script: './dist/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: '3001',
        CLERK_SECRET_KEY: 'sk_test_GK2dwWTODf0aSE2wQjWz6vhepnkVgJNzgiQdKrcEvV',
        DATABASE_PATH: './data/calculos.db',
      },
    },
  ],
};
