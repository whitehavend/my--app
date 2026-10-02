const getMongoUri = (environment = process.env) => {
  const mongoUri = String(environment.MONGO_URI || '').trim();
  if (mongoUri) return mongoUri;
  return String(environment.MONGODB_URI || '').trim();
};

module.exports = getMongoUri;