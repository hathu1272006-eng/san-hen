export const config = {
  port: Number(process.env.PORT ?? 3000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/san-hen',
  recommenderUrl: process.env.RECOMMENDER_URL || 'http://127.0.0.1:8000',
  host: process.env.HOST || '127.0.0.1',
};
