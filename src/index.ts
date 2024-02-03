import Server from "@app/Server";
import cron from 'node-cron';
import { schedule_handler } from "./bootstrap";

const THIRTY_MIN = '1 * * * *';

(async function main() {
  try {
    const server = new Server();

    cron.schedule(THIRTY_MIN, schedule_handler.handle.bind(schedule_handler), {
      timezone: 'America/Sao_Paulo'
    });

    server.application.listen(process.env.SERVER_PORT, () => {
      console.info(`Server is running on port ${process.env.SERVER_PORT}`)
    });
  } catch (e: any) {
    console.error(e.stack, e.message);
    process.exit(1);
  }
})();