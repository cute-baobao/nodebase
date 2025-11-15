import { env } from "@/env";
import Cryptr from "cryptr";

const cryptr = new Cryptr(env.ENCRYPTION_KEY);

export function encrypt(text: string): string {
  return cryptr.encrypt(text);
}

export function decrypt(encryptedText: string): string {
  return cryptr.decrypt(encryptedText);
}
