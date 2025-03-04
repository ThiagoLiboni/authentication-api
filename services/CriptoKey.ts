import bcrypt from 'bcrypt'
import { encryptRound } from "../utils/constants.ts";

class CriptoKey {
  static async hasherKey(password: string) {
    try {
      const hash = await bcrypt.hash(password, encryptRound.saltRound);
      return hash;
    } catch (err) {
      throw new Error("Error when hashing the key");
    }
  }
  static async verifyKey(password: string, hash: string) {
    try {
      const match = await bcrypt.compare(password, hash);
        return match;
    } catch (err) {
      throw new Error("Error to compare the key");
    }
  }
}
export default CriptoKey;
