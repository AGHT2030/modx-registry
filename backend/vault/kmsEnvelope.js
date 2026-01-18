/**
 * AGHT Vault – AWS KMS Envelope Encryption
 * AES-256-GCM
 * © AG Holdings Trust
 */

import crypto from "crypto";
import {
  KMSClient,
  GenerateDataKeyCommand,
  DecryptCommand
} from "@aws-sdk/client-kms";

/**
 * KMS client (IAM role or env creds)
 */
const kms = new KMSClient({
  region: process.env.AWS_REGION
});

/**
 * Encrypt a JSON object using KMS envelope encryption
 */
export async function encryptJsonEnvelope({
  kmsKeyId,
  plaintextObject,
  aadObject
}) {
  if (!kmsKeyId) throw new Error("Missing kmsKeyId");

  const plaintext = Buffer.from(
    JSON.stringify(plaintextObject),
    "utf8"
  );

  const aad = Buffer.from(
    JSON.stringify(aadObject || {}),
    "utf8"
  );

  // 1️⃣ Generate data key (DEK)
  const { Plaintext, CiphertextBlob, KeyId } = await kms.send(
    new GenerateDataKeyCommand({
      KeyId: kmsKeyId,
      KeySpec: "AES_256"
    })
  );

  const dek = Buffer.from(Plaintext); // 32 bytes
  const encryptedDek = Buffer.from(CiphertextBlob);

  // 2️⃣ Encrypt payload with AES-256-GCM
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", dek, iv);
  cipher.setAAD(aad);

  const ciphertext = Buffer.concat([
    cipher.update(plaintext),
    cipher.final()
  ]);

  const authTag = cipher.getAuthTag();

  // 3️⃣ Build encrypted envelope
  return {
    v: 1,
    alg: "AES-256-GCM",
    kmsKeyId: KeyId,
    iv: iv.toString("base64"),
    ciphertext: ciphertext.toString("base64"),
    tag: authTag.toString("base64"),
    edk: encryptedDek.toString("base64"),
    aad: aadObject || {}
  };
}

/**
 * Decrypt a previously encrypted envelope
 * (requires KMS Decrypt permission)
 */
export async function decryptJsonEnvelope(envelope) {
  if (!envelope?.edk) throw new Error("Invalid envelope");

  const aad = Buffer.from(
    JSON.stringify(envelope.aad || {}),
    "utf8"
  );

  // 1️⃣ Decrypt DEK using KMS
  const { Plaintext } = await kms.send(
    new DecryptCommand({
      CiphertextBlob: Buffer.from(envelope.edk, "base64"),
      KeyId: envelope.kmsKeyId
    })
  );

  const dek = Buffer.from(Plaintext);

  // 2️⃣ AES-256-GCM decrypt
  const iv = Buffer.from(envelope.iv, "base64");
  const ciphertext = Buffer.from(envelope.ciphertext, "base64");
  const tag = Buffer.from(envelope.tag, "base64");

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    dek,
    iv
  );

  decipher.setAAD(aad);
  decipher.setAuthTag(tag);

  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ]);

  return JSON.parse(plaintext.toString("utf8"));
}
