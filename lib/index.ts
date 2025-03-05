import CriptoKey from "./services/CriptoKey.ts";
import JwToken from "./services/JwToken.ts";
import { UserLogger } from "./utils/contract.ts";
import dotenv from "dotenv";
import axios from "axios";
import RedisCache from "./services/RedisHandler.ts";

dotenv.config();
const BASE_URL = "/api/user";

class Authenticate extends RedisCache {
  protected async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (err) {
      console.error("Erro ao conectar ao Redis:", err);
    }
  }
  private userLogged;
  public db_connection: string | null;
  private secretKey;

  constructor(userLogged: UserLogger, databaseURL: string) {
    super();
    this.userLogged = userLogged || null;
    this.db_connection = databaseURL || null;
    this.secretKey = process.env.SECRET_KEY || "";
  }
  async logIn() {
    try {
      const { email, password } = this.userLogged;
      const response = await axios.get(
        `${this.db_connection}/${BASE_URL}?email=${email}`
      );

      if (!response) {
        throw new Error("User email is incorrect");
      }
      const user = response.data;
      const isMatch = await CriptoKey.verifyKey(password, user.password);
      if (isMatch) {
        const { password, ...userData } = user;
        const token = new JwToken(this.secretKey, userData);
        await token.generateToken();
        await this.set(`Accessed-IBM:`, userData.id);
      } else {
        throw new Error("Password incorrect");
      }
    } catch (err) {
      console.error("Unable to relize login");
    }
  }
  async logOut() {
    try {
      const idLogged = await this.get("Accessed-IBM");

      if (idLogged) {
        await this.clearCache(`token:${idLogged}`);
        await this.clearCache(`refreshToken:${idLogged}`);
        await this.clearCache(`Accessed-IBM`);
      } else {
        throw new Error("User is not logged in");
      }
    } catch (err) {
      console.error("Error while cleaning cache:", err);
      throw new Error("Error to clean cache");
    }
  }
  async authorize(Token?: string) {
    try {
      const jwt = new JwToken(this.secretKey);
      if (Token) {
        const isTokenValid = await jwt.justVerify(Token);
        if (isTokenValid?.valid) {
          return isTokenValid.payload;
        }
      }
      const userIdCache = await this.get("Accessed-IBM");
      const token = await this.get(`token:${userIdCache}`);

      if (!userIdCache) {
        console.log("No user has logged. Redirecting to login.");
        return false;
      }

      if (!token) {
        throw new Error("Error to get token value in cache");
      }
      const isCacheTokenValid = await jwt.justVerify(token);
      if (isCacheTokenValid?.valid) {
        return token;
      }

      const tokenRefresh = await this.get(`refreshToken:${userIdCache}`);
      if (tokenRefresh) {
        const newToken = await jwt.refreshToken(tokenRefresh);
        return newToken;
      }
      console.log("Refresh token not available. Redirecting to login.");
      return false;
    } catch (err) {
      console.error("Unable to authorize", err);
      throw new Error("Error with authorization method");
    }
  }
}
export default Authenticate;
