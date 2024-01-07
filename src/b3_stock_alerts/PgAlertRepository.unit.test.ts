/* eslint-disable @typescript-eslint/no-explicit-any */
import Postgres from "@shared/Postgres";
import PgAlertRepository from './PgAlertRepository';

const getClientSpy = jest.spyOn(Postgres, 'getClient');

afterEach(() => {
  getClientSpy.mockClear();
});

describe('PgAlertRepository', () => {
  const queryMock = jest.fn();
  getClientSpy.mockImplementation(() => ({ query: queryMock } as any));
  const repository = new PgAlertRepository();

  afterEach(() => {
    queryMock.mockClear();
  });

  describe('PgAlertRepository.createAlert', () => {
    it.todo('inserts a new alert')
  });

  describe('PgAlertRepository.deleteAlert', () => {
    it.todo('deletes an alert by id');
  })

  describe('PgAlertRepository.getAlert', () => {
    it.todo('returns an alert by id');
    it.todo("returns NULL if alert doesn't exist");
  });
});