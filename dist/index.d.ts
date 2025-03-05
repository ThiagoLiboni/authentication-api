import { UserLogger } from "./utils/contract.ts";
import RedisCache from "./services/RedisHandler.ts";
declare class Authenticate extends RedisCache {
    protected connect(): Promise<void>;
    private userLogged;
    db_connection: string | null;
    private secretKey;
    constructor(userLogged: UserLogger, databaseURL: string);
    logIn(): Promise<void>;
    logOut(): Promise<void>;
    authorize(Token?: string): Promise<string | false | import("jsonwebtoken").JwtPayload | undefined>;
}
export default Authenticate;
