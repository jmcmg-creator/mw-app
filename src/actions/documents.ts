"use server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DocumentType } from "@/generated/prisma/enums";

const BUCKET = "documents";

async function assertAssetOwned(assetId: string, userId: string) {
  const asset = await prisma.asset.findFirst({
    where: { id: assetId, portfolio: { userId } },
  });
  if (!asset) {
    throw new Error("Asset not found.");
  }
}

/** Uploads a file to Supabase Storage and records it as a Document. */
export async function uploadDocument(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const assetId = String(formData.get("assetId") ?? "");
  const type = String(formData.get("type") ?? "AUTRE") as DocumentType;
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("No file provided.");
  }
  await assertAssetOwned(assetId, userId);

  const path = `${userId}/${assetId}/${crypto.randomUUID()}-${file.name}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const admin = createAdminClient();
  const { error } = await admin.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type || undefined });
  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  await prisma.document.create({
    data: {
      assetId,
      type,
      title: file.name,
      storageBucket: BUCKET,
      storagePath: path,
      mimeType: file.type || null,
      fileSize: file.size,
    },
  });
}

/** Returns a short-lived signed URL to download a document. */
export async function getDocumentUrl(documentId: string): Promise<string> {
  const userId = await requireUserId();
  const document = await prisma.document.findFirst({
    where: { id: documentId, asset: { portfolio: { userId } } },
  });
  if (!document) {
    throw new Error("Document not found.");
  }

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(document.storageBucket)
    .createSignedUrl(document.storagePath, 120);
  if (error || !data) {
    throw new Error("Could not generate the download link.");
  }
  return data.signedUrl;
}

/** Deletes a document from Storage and the database. */
export async function deleteDocument(documentId: string): Promise<void> {
  const userId = await requireUserId();
  const document = await prisma.document.findFirst({
    where: { id: documentId, asset: { portfolio: { userId } } },
  });
  if (!document) {
    throw new Error("Document not found.");
  }

  const admin = createAdminClient();
  await admin.storage
    .from(document.storageBucket)
    .remove([document.storagePath]);
  await prisma.document.delete({ where: { id: documentId } });
}
