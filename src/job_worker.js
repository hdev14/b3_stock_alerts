const cron = require('node-cron');
const { parentPort, threadId } = require('worker_threads');
// eslint-disable-next-line import/no-unresolved, import/extensions
const { schedule_handler, stock_event_handler } = require('./bootstrap');

const THIRTY_MIN = '30 * * * *';

const task = cron.schedule(THIRTY_MIN, schedule_handler.handle.bind(schedule_handler), {
  timezone: 'America/Sao_Paulo',
});

schedule_handler.on('stock_event', stock_event_handler.handle.bind(stock_event_handler));

schedule_handler.on('message', (message) => {
  parentPort.postMessage(message);
});

schedule_handler.on('uncaughtException', (error) => {
  parentPort.postMessage('Job UncaughtException: ', error.stack);
  parentPort.postMessage('Stopping task...');
  task.stop();
});

schedule_handler.on('error', (error) => {
  parentPort.postMessage('Job error:', error.stack);
});

task.start();

parentPort.postMessage(`Job is running on thread ${threadId}`);
