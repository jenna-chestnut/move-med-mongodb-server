require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://jchestnut@localhost/move-med',
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://jchestnut@localhost/move-med-test',
  JWT_SECRET: process.env.JWT_SECRET || 'a-fakeo-secret',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '3h'
};
