import Server from "@app/Server";
import cron from 'node-cron';
import { schedule_handler } from "./bootstrap";

const THIRTY_MIN = '30 * * * *';

(async function main() {
  let task: cron.ScheduledTask | null = null;

  try {
    const server = new Server();

    task = cron.schedule(THIRTY_MIN, schedule_handler.handle.bind(schedule_handler), {
      timezone: 'America/Sao_Paulo'
    });

    task.start();

    server.application.listen(process.env.SERVER_PORT, () => {
      console.info(`Server is running on port ${process.env.SERVER_PORT}`)
    });
  } catch (e: any) {
    console.error(e.stack, e.message);
    if (task) {
      task.stop();
    }
    process.exit(1);
  }
})();