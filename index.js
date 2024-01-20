#!/usr/bin/env node
import { stdin, stdout, exit } from 'node:process';
import { printErrors } from './util.js';
import chalk from 'chalk';
import mqtt from 'mqtt'; 

const args = process.argv.slice(2);
const topicString = args[0] || '#';
const cxString = args[1] ? `mqtt://${args[1]}` : 'mqtt://localhost:1883';
let client;

try {
  stdout.write('Connecting...');
  client = await mqtt.connectAsync(cxString, { connectTimeout: 3000 });
  stdout.write(`${chalk.green('success!')}\n`);
}
catch (err) {
  stdout.write(`${chalk.red('failed')}\n\n`);
  printErrors(err);
  exit(2);
}

client.on('connect', connack => {
  console.log(`${chalk.green('CONNECT')} (code ${connack})`);
});

client.on('disconnect', () => {
  console.log(`${chalk.yellow('DISCONNECT')} event fired`);
});

client.on('reconnect', () => {
  console.log(`${chalk.yellow('RECONNECT')} event fired`);
});

client.on('offline', () => {
  console.log(`${chalk.yellow('OFFLINE')} event fired`);
});

client.on('close', () => {
  console.log(`${chalk.yellow('CLOSE')} event fired`);
});

client.on('end', () => {
  console.log(`${chalk.yellow('END')} event fired`);
});

client.on('error', err => {
  printErrors(err);
});

client.on('message', (topic, message) => {
  console.log(`${chalk.black.bgGreen('RECD')} ${chalk.cyan(topic)}: ${message.toString()}`);
});

// Start listening!
await client.subscribeAsync(topicString);
console.log(`Listening for messages on ${chalk.cyan(topicString)}\n`);