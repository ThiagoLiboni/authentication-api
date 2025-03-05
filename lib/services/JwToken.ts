import dotenv from "dotenv";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { validate, visitorBody } from "../utils/constants.js";
import RedisCache from "./RedisHandler.ts";
import { Payload } from "../utils/contract.ts";

dotenv.config();

class JwToken extends RedisCache {
  protected async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (err) {
      console.error("Erro ao conectar ao Redis:", err);
    }
  }
  private secretKey: string;
  public payload: Payload | null;
  public options: SignOptions;
  public optionsRefresh: SignOptions;

  constructor(secretKey: string, payload?: Payload) {
    super();
    this.secretKey = secretKey;
    this.payload = payload || null;
    this.options = {
      expiresIn: validate.expIn,
    };
    this.optionsRefresh = {
      expiresIn: validate.expRefreshIn,
    };
  }

  async generateToken() {
    if (!this.payload) {
      throw new Error("Payload wasn't informed");
    }
    const token = jwt.sign(this.payload, this.secretKey, this.options);
    await this.set(`token:${this.payload.id}`, token);
    await this.generateRefreshToken();
    return token;
  }
  async generateRefreshToken() {
    if (!this.payload) {
      throw new Error("Payload wasn't informed");
    }
    const refreshToken = `refreshToken:${this.payload.id}`;
    const token = jwt.sign(this.payload, this.secretKey, this.optionsRefresh);
    await this.set(refreshToken, token);
    return;
  }
  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, this.secretKey);
      const userId = (decoded as JwtPayload).id;

      const storedRefreshToken = await this.get(`refreshToken:${userId}`);
      if (refreshToken !== storedRefreshToken) {
        throw new Error("Token de refresh não corresponde ao armazenado.");
      }
      await this.clearCache(`refreshToken:${userId}`);
      const newToken = await this.generateToken();
      return newToken;
    } catch (err) {
      console.error("Erro ao atualizar token:", err);
      throw new Error("Falha na atualização do token.");
    }
  }
  async justVerify(token: string) {
    try {
        const payload = jwt.verify(token, this.secretKey);
        return { valid: true, payload };
    } catch (err) {
        return { valid: false, error: err };
    }
}
  static async generateTokenTemporary(secretKey: string) {
    const dataTemp = {
      ...visitorBody
    };
    const expIn: SignOptions = { expiresIn: validate.tempExpIn };
    try {
      const token = jwt.sign(dataTemp, secretKey, expIn);
      return token
    } catch (error) {
      console.error("Erro ao gerar o token:", error);
      throw new Error("Não foi possível gerar o token temporário.");
    }
  }
}

export default JwToken;
