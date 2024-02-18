import Server from '@app/Server';
import Postgres from '@shared/Postgres';
import { execSync } from 'child_process';
import cron from 'node-cron';
import { schedule_handler } from './bootstrap';

const THIRTY_MIN = '30 * * * *';

(async function main() {
  let task: cron.ScheduledTask | null = null;
  const db_client = Postgres.getClient();

  try {
    const server = new Server();
    await db_client.connect();

    task = cron.schedule(THIRTY_MIN, schedule_handler.handle.bind(schedule_handler), {
      timezone: 'America/Sao_Paulo',
    });

    task.start();

    if (process.env.NODE_ENV !== 'production') {
      const buffer = execSync('npm run css:dev');
      console.log(buffer.toString());
    } else {
      const buffer = execSync('npm run css:prod');
      console.log(buffer.toString());
    }

    server.application.listen(process.env.SERVER_PORT, () => {
      if (process.env.NODE_ENV === 'development') {
        console.info(`Server is running on http://localhost:${process.env.SERVER_PORT}/`);
      } else {
        console.info('Server is running!');
      }
    });
  } catch (e: any) {
    console.error(e.stack, e.message);
    await db_client.end();

    if (task) {
      task.stop();
    }

    process.exit(1);
  }
}());
