import chalk from 'chalk';

export function sleep(delay) {
  return new Promise(r => setTimeout(r, delay));
}

export function printErrors(err, depth = 0) {
  if (err instanceof AggregateError) {
    console.log(chalk.gray(`${''.padStart(depth * 2, ' ')}(${err.errors.length} errors)`));
    for (const inner of err.errors) {
      printErrors(inner, depth + 1);
    }
  }
  else {
    console.log(`${''.padStart(depth * 2, ' ')}${chalk.black.bgRedBright(' ERROR ')} ${JSON.stringify(err)}`);
  }
}