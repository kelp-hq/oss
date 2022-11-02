import { Db, Document, ObjectId, WithId } from 'mongodb';

import { getDB } from '../../mongodbClient';
import { IMaculaConfig } from '.';

/**
 * This is the collection name where we store in the mongo db
 */
export const collectionHosting: string = 'hosting';

export interface ICIDRecordForDomain {
  cid: string;
  config: IMaculaConfig;
  createdAt: number;
}

export interface ISubdomainDocument {
  ownerAccount: string;
  /**
   * Subdomain
   */
  subdomain: string;
  /**
   * We are going to add to this list
   */
  cids: ICIDRecordForDomain[];
  createdAt: number;
  updatedAt: number;
  pinned: true;
  lastCid: string;
  tippingEnabled: boolean;
}

/**
 * Setup indexes and all needed to operation for mongo
 * @param dbConnection - Active DB connection
 */
export function setupDBforSelf(dbConnection: Db): void {
  dbConnection.collection(collectionHosting).createIndex('subdomain', { unique: true });
  dbConnection.collection(collectionHosting).createIndex('subdomain.cids.cid');
}

/**
 * Create the version document and return it
 * @param cid -
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @rushstack/no-new-null
export async function findOneWebsiteByCid(cid: string): Promise<WithId<ISubdomainDocument> | undefined> {
  const db = await getDB();
  const res = await db.collection(collectionHosting).findOne({
    'cids.cid': cid
  });

  return res as WithId<ISubdomainDocument>;
}
/**
 * Create the version document and return it
 * @param data -
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function insertOneToHosting(data: ISubdomainDocument): Promise<Document> {
  const db = await getDB();
  return await db.collection(collectionHosting).insertOne(data);
}

export async function updateOneToHosting(id: ObjectId, data: ISubdomainDocument): Promise<Document> {
  const db = await getDB();
  return await db.collection(collectionHosting).updateOne(
    { _id: id },
    {
      $set: data
    }
  );
}
/**
 *
 * @param cid - Hosting cid
 * @returns
 */

export async function findLastModificationDateForHosting(
  cid: string
): Promise<WithId<ISubdomainDocument> | undefined> {
  const db = await getDB();
  const ret = (await db.collection(collectionHosting).findOne(
    {
      ipfsCid: cid
    },
    { projection: { createdAt: 1 } }
  )) as WithId<ISubdomainDocument>;

  return ret;
}
/**
 * Find a subdomain record
 * @param subdomain -
 * @returns a union {@link ISubdomainDocument} document with the {@link WithId}
 */
export async function findOneSubdomain(subdomain: string): Promise<WithId<ISubdomainDocument> | undefined> {
  const db = await getDB();
  return (await db.collection(collectionHosting).findOne({
    subdomain
  })) as WithId<ISubdomainDocument>;
}
/**
 * Find all subdomains owned by the `owner`
 * @param owner -
 * @returns a union {@link ISubdomainDocument} document with the {@link WithId}
 */
export async function findMySubdomains(owner: string): Promise<WithId<ISubdomainDocument>[]> {
  const db = await getDB();
  const r = (await db
    .collection(collectionHosting)
    .find({
      ownerAccount: owner
    })
    .toArray()) as WithId<ISubdomainDocument>[];

  return r;
}
