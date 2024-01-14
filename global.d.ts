declare module globalThis {
  declare var request: import('supertest/lib/agent')<import('supertest').Test>;
  declare var db_client: import('pg').Client;
}