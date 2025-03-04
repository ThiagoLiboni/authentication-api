import { UserLogger } from "../utils/contract.ts";
import RedisCache from "../services/RedisHandler.ts";
declare class Authenticate extends RedisCache {
    protected connect(): Promise<void>;
    private userLogged;
    db_connection: string;
    private secretKey;
    constructor(userLogged: UserLogger, databaseURL: string);
    logIn(): Promise<void>;
    logOut(): Promise<void>;
    authorize(): Promise<boolean>;
}
export default Authenticate;
