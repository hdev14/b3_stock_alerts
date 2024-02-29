import Server from '@app/Server';
import Postgres from '@shared/Postgres';
import { execSync } from 'child_process';
import { resolve } from 'path';
import { isMainThread, Worker } from 'worker_threads';

const isDev = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'test_e2e';
const isProd = process.env.NODE_ENV === 'production';

function createJobWorker() {
  if (isMainThread) {
    const worker = new Worker(resolve(__dirname, './job_worker.js'));

    worker.on('message', (message) => {
      console.log(message);
    });

    worker.on('messageerror', (error) => {
      console.error(error);
    });

    worker.on('error', (error) => {
      console.error('Worker Error:', error);
      worker.terminate()
        .then(() => console.log('Worker stopped'))
        .catch((error) => console.error('Worker error:', error.stack));
    });
  }
}

(async function main() {
  const db_client = Postgres.getClient();

  try {
    const server = new Server();
    await db_client.connect();

    if (isDev) {
      console.log(execSync('npm run css:dev').toString());
    }

    if (isProd) {
      console.log(execSync('npm run css:prod').toString());
    }

    server.application.listen(process.env.SERVER_PORT, () => {
      console.log('PID: ', process.pid);

      createJobWorker(); // new thread

      if (isDev || isTest) {
        console.info(`Server is running on http://localhost:${process.env.SERVER_PORT}/`);
      } else {
        console.info('Server is running!');
      }
    });
  } catch (e: any) {
    console.error(e.stack, e.message);
    await db_client.end();

    process.exit(1);
  }
}());
