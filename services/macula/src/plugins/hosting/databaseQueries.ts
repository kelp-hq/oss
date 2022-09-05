import { Db, Document, WithId } from 'mongodb';

import { getDB } from '../../mongodbClient';
import { IMaculaConfig } from '.';

/**
 * This is the collection name where we store in the mongo db
 */
export const collectionHosting: string = 'macula_hosting';
export const collectionSubdomains: string = 'macula_subdomain_cid';

export interface ICIDRecordForDomain {
  cid: string;
  createdAt: number;
  contentSize: number;
}

export interface ISubdomainDocument {
  /**
   * Subdomain
   */
  subdomain: string;
  /**
   * We are going to add to this list
   */
  cids: ICIDRecordForDomain[];
}

/**
 * Record in the DB
 */
export interface IHostingRecordDocument {
  /**
   * IPFS cid where of the root of the website
   */
  ipfsCid: string;
  subdomain?: string;
  ownerAccount: string;
  createdAt: number;
  config: IMaculaConfig;
  pinned: boolean;
}

/**
 * Setup indexes and all needed to operation for mongo
 * @param dbConnection - Active DB connection
 */
export function setupDBforSelf(dbConnection: Db): void {
  dbConnection.collection(collectionHosting).createIndex('cid', {
    unique: true
  });
  dbConnection.collection(collectionHosting).createIndex('subdomain');

  dbConnection.collection(collectionSubdomains).createIndex('subdomain', { unique: true });
  dbConnection.collection(collectionSubdomains).createIndex('subdomain.cids.cid');
}

/**
 * Create the version document and return it
 * @param cid -
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @rushstack/no-new-null
export async function findOneWebsiteByCid(cid: string): Promise<WithId<IHostingRecordDocument> | undefined> {
  const db = await getDB();
  return (await db.collection(collectionHosting).findOne({
    ipfsCid: cid
  })) as WithId<IHostingRecordDocument>;
}
/**
 * Create the version document and return it
 * @param data -
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function insertOneToHosting(data: IHostingRecordDocument): Promise<Document> {
  const db = await getDB();
  return await db.collection(collectionHosting).insertOne(data);
}
/**
 *
 * @param cid - Hosting cid
 * @returns
 */

export async function findLastModificationDateForHosting(
  cid: string
): Promise<WithId<IHostingRecordDocument> | undefined> {
  const db = await getDB();
  const ret = (await db.collection(collectionHosting).findOne(
    {
      ipfsCid: cid
    },
    { projection: { createdAt: 1 } }
  )) as WithId<IHostingRecordDocument>;

  return ret;
}

/**
 * SUBDOMAIN PART
 */

/**
 * Find a subdomain record
 * @param subdomain -
 * @returns a union {@link ISubdomainDocument} document with the {@link WithId}
 */
export async function findOneSubdomain(subdomain: string): Promise<WithId<ISubdomainDocument> | undefined> {
  const db = await getDB();
  return (await db.collection(collectionSubdomains).findOne({
    subdomain
  })) as WithId<ISubdomainDocument>;
}
