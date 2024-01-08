export default interface Encryptor {
  createHash(value: string): string;
}