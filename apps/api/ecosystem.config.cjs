module.exports = {
  apps: [
    {
      name: 'calculo-api',
      script: './dist/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: '3001',
      },
    },
  ],
};
