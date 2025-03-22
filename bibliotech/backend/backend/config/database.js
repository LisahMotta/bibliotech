require('dotenv').config();

module.exports = {
  development: {
    uri: process.env.MONGODB_URI,
    options: {
      user: process.env.MONGODB_USER,
      pass: process.env.MONGODB_PASSWORD,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  test: {
    uri: process.env.MONGODB_URI,
    options: {
      user: process.env.MONGODB_USER,
      pass: process.env.MONGODB_PASSWORD,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  production: {
    uri: process.env.MONGODB_URI,
    options: {
      user: process.env.MONGODB_USER,
      pass: process.env.MONGODB_PASSWORD,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
}; 