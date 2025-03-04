import redis from 'redis';
import dotenv from 'dotenv';
import { validate } from '../utils/constants.js';

dotenv.config();

abstract class RedisCache {
    protected client;

    constructor() {
        this.client = redis.createClient({
            url: process.env.REDIS_URL,
        });
        this.connect();
    }

    protected abstract connect():Promise<void>

    async get(key:string) {
        try {
            const value = await this.client.get(key);
            return value;
        } catch (err) {
            console.error('Erro ao obter valor do Redis:', err);
            return null;
        }
    }
    async set(key:string, value:string | boolean, ex?:number) {
        try {
            const expiration = validate.expIn || ex;
            await this.client.set(key, value.toString(), {EX: expiration});
        } catch (err) {
            console.error('Erro ao definir valor no Redis:', err);
        }
    }
    async clearCache(key:string) {
        try {
            await this.client.del(key);
            console.log(`Cache limpo para a chave: ${key}`);
        } catch (err) {
            console.error('Erro ao limpar o cache:', err);
        }
    }
    async quit() {
        await this.client.quit();
    }
}

export default RedisCache;