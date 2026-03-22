#!/usr/bin/env node
import { stdin, stdout, exit } from 'node:process';
import { parseArgs } from 'node:util';
import { sleep, printErrors } from './util.js';
import chalk from 'chalk';
import mqtt from 'mqtt'; 

// CLI args
const args = parseArgs({
  allowPositionals: true,
  options: {
    h: { type: 'string', short: 'h' },
    p: { type: 'string', short: 'p' },
    a: { type: 'string', short: 'a' },
  }
});

// Defaults
const host = args.values.h || 'localhost';
const port = args.values.p || '1883';
const auth = args.values.a || 'admin:password';
const topicFilter = args.positionals[0] || '#';
const propFilter = args.positionals[1] || '';
const valueFilter = args.positionals[2] || '';

// Constants
const opGood = chalk.greenBright('\u{2714}');
const opFail = chalk.redBright('\u{2716}');

// State
const cxString = `mqtt://${auth}@${host}:${port}`;
const topicRegex = new RegExp(topicFilter, 'i');
const propRegex = new RegExp(propFilter, 'i');
const valueRegex = new RegExp(valueFilter, 'i');
const client = mqtt.connect(cxString, { manualConnect: true, connectTimeout: 3000 });

// Event handlers
client.on('connect', ack => {
  if (ack.returnCode === 0) {
    console.log(` ${opGood} Connected! `);
  }
  else {
    console.log(` ${opFail} Connection failed (${ack.returnCode})`);
  }
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

// Process incoming messages
client.on('message', (topic, message) => {
  if (topic.match(topicRegex)) {
    const header = topic.replace(topicRegex, match => chalk.black.bgCyanBright(match));
    const data = JSON.parse(message.toString());
    let output = JSON.stringify(data);
    
    // Find matching properties
    if (propFilter.length) {
      let foundProps = Object.keys(data).filter(key => key.match(propRegex));

      if (valueFilter.length) {
        foundProps = foundProps.filter(prop => JSON.stringify(data[prop]).match(valueRegex));
      }

      output = '{';

      for (const prop of foundProps) {
        const lblProp = `"${prop.replace(propRegex, match => chalk.black.bgRedBright(match))}"`;
        const lblVal = JSON.stringify(data[prop]);

        output += `${chalk.red(lblProp)}:`;

        if (valueFilter.length) {
          output += chalk.yellow(lblVal.replace(valueRegex, match => chalk.black.bgYellowBright(match)));
        }
        else {
          output += lblVal;
        }
        output += ',';
      }

      output = output.slice(0, -1) + '}';
    }

    if (output.length > 1) {
      console.log(`${chalk.cyan(header)}: ${output}`);
    }
  }
});

// Connect
try {
  stdout.write(chalk.blackBright(' Connecting...'));
  stdout.cursorTo(0);
  await sleep(100);
  client.connect();
}
catch (err) {
  printErrors(err);
  exit(2);
}

// Start listening!
await client.subscribeAsync('#');
console.log(` ${opGood} Filters applied:`);
console.log(`   \u{2022} Topic: ${chalk.cyan(topicRegex)}`);
if (propFilter.length) {
  console.log(`   \u{2022} Prop:  ${chalk.red(propRegex)}`);
}
if (valueFilter.length) {
  console.log(`   \u{2022} Value: ${chalk.yellow(valueRegex)}`);
}
console.log(' Listening for messages...\n');