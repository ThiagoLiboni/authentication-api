import jwt, { SignOptions } from "jsonwebtoken";
import RedisCache from "./RedisHandler.js";
import { Payload } from "../utils/contract.js";
declare class JwToken extends RedisCache {
    protected connect(): Promise<void>;
    private secretKey;
    payload: Payload | null;
    options: SignOptions;
    optionsRefresh: SignOptions;
    constructor(secretKey: string, payload?: Payload);
    generateToken(): Promise<string>;
    generateRefreshToken(): Promise<void>;
    refreshToken(refreshToken: string): Promise<string>;
    justVerify(token: string): Promise<{
        valid: boolean;
        payload: string | jwt.JwtPayload;
        error?: undefined;
    } | {
        valid: boolean;
        error: unknown;
        payload?: undefined;
    } | undefined>;
}
export default JwToken;
