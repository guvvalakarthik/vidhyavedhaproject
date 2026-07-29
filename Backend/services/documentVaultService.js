import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const storageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../storage/documents");
const keyFromEnvironment = () => {
  const value = process.env.DOCUMENT_ENCRYPTION_KEY;
  if (!value) throw Object.assign(new Error("Document vault is not configured."), { code: "VAULT_UNAVAILABLE" });
  const key = Buffer.from(value, "base64");
  if (key.length !== 32) throw Object.assign(new Error("DOCUMENT_ENCRYPTION_KEY must be a base64-encoded 32-byte key."), { code: "VAULT_UNAVAILABLE" });
  return key;
};
export const encryptValue = (value, key = keyFromEnvironment()) => {
  const iv = randomBytes(12); const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(value), cipher.final()]);
  return { ciphertext, iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64") };
};
export const decryptValue = ({ ciphertext, iv, tag }, key = keyFromEnvironment()) => {
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
};
export const storeEncryptedDocument = async ({ documentId, buffer, originalName }) => {
  const content = encryptValue(buffer); const name = encryptValue(Buffer.from(originalName, "utf8"));
  await mkdir(storageRoot, { recursive: true });
  const storageName = `${documentId}.vault`;
  await writeFile(path.join(storageRoot, storageName), content.ciphertext, { flag: "wx", mode: 0o600 });
  return { storageName, contentIv: content.iv, contentTag: content.tag, nameCiphertext: name.ciphertext.toString("base64"), nameIv: name.iv, nameTag: name.tag };
};
export const readEncryptedDocument = async (metadata) => {
  const ciphertext = await readFile(path.join(storageRoot, metadata.storageName));
  const buffer = decryptValue({ ciphertext, iv: metadata.contentIv, tag: metadata.contentTag });
  const originalName = decryptValue({ ciphertext: Buffer.from(metadata.nameCiphertext, "base64"), iv: metadata.nameIv, tag: metadata.nameTag }).toString("utf8");
  return { buffer, originalName };
};
export const destroyEncryptedDocument = async (storageName) => {
  try { await unlink(path.join(storageRoot, storageName)); } catch (error) { if (error.code !== "ENOENT") throw error; }
};
