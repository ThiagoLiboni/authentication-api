declare class CriptoKey {
    static hasherKey(password: string): Promise<string>;
    static verifyKey(password: string, hash: string): Promise<boolean>;
}
export default CriptoKey;
