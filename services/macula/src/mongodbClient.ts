import { Db, MongoClient } from 'mongodb';

import { setupDBforSelf as hostingSetupDbForSelf } from './plugins/hosting/databaseQueries';
import { getEnv } from './utils/env';

export const dbName: string = 'macula';
export let mongoClient: MongoClient;
export let dbConnection: Db;

/**
 * Setup the MongoDB collections and all the indexes. Set the cache for the DB connection and connected client
 * @returns MongoClient
 */
export async function setupMongoDB(): Promise<MongoClient> {
  if (mongoClient) {
    return mongoClient;
  }

  mongoClient = new MongoClient(
    getEnv('MONGODB_CONNSTRING_WITH_DB', `mongodb://admin:123456@127.0.0.1:27017/${dbName}?authSource=admin`)
  );

  await mongoClient.connect();

  dbConnection = mongoClient.db(getEnv('MONGODB_DATABASE_NAME', dbName));
  /**
   * now we will call all the plugins that we know to set up themselves
   */
  hostingSetupDbForSelf(dbConnection);

  return mongoClient;
}

/**
 * Return the MongoClient instance
 * @returns
 */
export async function getMongoClient(): Promise<MongoClient> {
  if (mongoClient) {
    return mongoClient;
  }
  mongoClient = new MongoClient(
    getEnv('MONGODB_CONNSTRING_WITH_DB', 'mongodb://admin:123456@mongodb:27017/macula?authSource=admin')
  );
  return await mongoClient.connect();
}

/**
 * Return the DB class instance
 * @returns
 */
export async function getDB(): Promise<Db> {
  if (mongoClient && dbConnection) {
    return dbConnection;
  }

  dbConnection = mongoClient.db(dbName);

  return dbConnection;
}
