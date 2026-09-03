import { createReadStream, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

import { DATA_DIR } from "@/lib/db";

const BUCKET = process.env.RUSTFS_BUCKET ?? "arkib";

let s3: import("@aws-sdk/client-s3").S3Client | null = null;
let ensureBucketPromise: Promise<void> | null = null;

function endpoint() {
  return process.env.RUSTFS_ENDPOINT?.trim() || "";
}

function isS3Configured() {
  return Boolean(endpoint() && process.env.RUSTFS_ACCESS_KEY && process.env.RUSTFS_SECRET_KEY);
}

export function storageBackend(): "s3" | "local" {
  return isS3Configured() ? "s3" : "local";
}

async function s3Client() {
  if (!s3) {
    const { S3Client } = await import("@aws-sdk/client-s3");
    s3 = new S3Client({
      region: process.env.RUSTFS_REGION ?? "us-east-1",
      endpoint: endpoint(),
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.RUSTFS_ACCESS_KEY as string,
        secretAccessKey: process.env.RUSTFS_SECRET_KEY as string,
      },
      maxAttempts: 3,
    });
  }
  return s3;
}

async function ensureBucket() {
  if (!ensureBucketPromise) {
    ensureBucketPromise = (async () => {
      const { CreateBucketCommand, HeadBucketCommand } = await import(
        "@aws-sdk/client-s3"
      );
      const client = await s3Client();
      try {
        await client.send(
          new HeadBucketCommand({ Bucket: BUCKET })
        );
      } catch {
        await client
          .send(new CreateBucketCommand({ Bucket: BUCKET }))
          .catch((err) => {
            if (!String(err?.name ?? "").includes("BucketAlready")) throw err;
          });
      }
    })();
  }
  return ensureBucketPromise;
}

function uploadsDir() {
  return path.join(DATA_DIR, "uploads");
}

function localPath(key: string) {
  const safe = key.replace(/\//g, "_");
  return path.join(uploadsDir(), safe);
}

export async function putObject(
  key: string,
  body: Uint8Array | Buffer,
  contentType = "application/pdf"
): Promise<void> {
  if (!isS3Configured()) {
    mkdirSync(uploadsDir(), { recursive: true });
    await import("node:fs/promises").then((f) =>
      f.writeFile(localPath(key), body)
    );
    return;
  }

  const [{ PutObjectCommand }, client] = [await import("@aws-sdk/client-s3"), await s3Client()];
  await ensureBucket();
  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

export async function deleteObject(key: string | null | undefined): Promise<void> {
  if (!key) return;
  if (!isS3Configured()) {
    if (existsSync(localPath(key))) {
      await import("node:fs/promises").then((f) => f.unlink(localPath(key)));
    }
    return;
  }
  const [{ DeleteObjectCommand }, client] = [await import("@aws-sdk/client-s3"), await s3Client()];
  await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export async function objectExists(key: string): Promise<boolean> {
  if (!isS3Configured()) return existsSync(localPath(key));
  const [{ HeadObjectCommand }, client] = [await import("@aws-sdk/client-s3"), await s3Client()];
  try {
    await client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

export async function createPresignedUrl(key: string, filename: string): Promise<string> {
  const [{ GetObjectCommand }, { getSignedUrl }, client] = [
    await import("@aws-sdk/client-s3"),
    await import("@aws-sdk/s3-request-presigner"),
    await s3Client(),
  ];
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${encodeURIComponent(filename)}"`,
    }),
    { expiresIn: 300 }
  );
}

export function localFileStream(key: string) {
  return createReadStream(localPath(key));
}

export function hasLocalObject(key: string) {
  return existsSync(localPath(key));
}
