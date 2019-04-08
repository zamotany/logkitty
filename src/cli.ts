import yargs from 'yargs';
import {
  logkitty,
  makeAppFilter,
  makeTagsFilter,
  makeMatchFilter,
  makeCustomFilter,
  FilterCreator,
} from './api';
import { formatEntry, formatError } from './formatters';
import { CodeError } from './errors';
import { getMinPriority } from './utils';
import { Entry } from './types';

const priorityOptions = {
  U: {
    alias: 'u',
    boolean: true,
    default: false,
    describe: 'unknown priority',
  },
  V: {
    alias: 'v',
    boolean: true,
    default: false,
    describe: 'verbose priority',
  },
  D: { alias: 'd', boolean: true, default: false, describe: 'debug priority' },
  I: { alias: 'i', boolean: true, default: false, describe: 'info priority' },
  W: { alias: 'w', boolean: true, default: false, describe: 'warn priority' },
  E: { alias: 'e', boolean: true, default: false, describe: 'error priority' },
  F: { alias: 'f', boolean: true, default: false, describe: 'fatal priority' },
  S: { alias: 's', boolean: true, default: false, describe: 'silent priority' },
};

const {
  argv: {
    _: [command],
    ...args
  },
} = yargs
  .usage('Usage: $0 [options] <command>')
  .command('tag <tags ...>', 'Show logs matching given tags', priorityOptions)
  .command(
    'app <appId>',
    'Show logs from application with given identifier',
    priorityOptions
  )
  .command(
    'match <regexes...>',
    'Show logs matching given patterns',
    priorityOptions
  )
  .command(
    'custom <patterns ...>',
    'Filter using custom patterns <tag>:<priority>'
  )
  .command('all', 'Show all logs', priorityOptions)
  .demandCommand(1)
  .option('adb-path', {
    type: 'string',
    describe: 'Use custom path to ADB',
  })
  .example('$0 tag MyTag', 'Filter logs to only include ones with MyTag tag')
  .example(
    '$0 tag MyTag -I',
    'Filter logs to only include ones with MyTag tag and priority INFO and above'
  )
  .example('$0 app com.example.myApp', 'Show all logs from com.example.myApp')
  .example('$0 match device', 'Show all logs matching /device/gm regex')
  .example(
    '$0 app com.example.myApp -E',
    'Show all logs from com.example.myApp with priority ERROR and above'
  )
  .example(
    '$0 custom *:S MyTag:D',
    'Silence all logs and show only ones with MyTag with priority DEBUG and above'
  )
  .help('h')
  .alias('h', 'help')
  .alias('v', 'version')
  .version();

const selectedPriorities = {
  U: Boolean(args.u),
  V: Boolean(args.v),
  D: Boolean(args.d),
  I: Boolean(args.i),
  W: Boolean(args.w),
  E: Boolean(args.e),
  F: Boolean(args.f),
  S: Boolean(args.s),
};

try {
  let filter: FilterCreator | undefined;
  switch (command) {
    case 'app':
      filter = makeAppFilter(args.appId as string);
      break;
    case 'tag':
      filter = makeTagsFilter(...(args.tags as string[]));
      break;
    case 'match':
      filter = makeMatchFilter(
        ...(args.regexes as string[]).map(
          (value: string) => new RegExp(value, 'gm')
        )
      );
      break;
    case 'custom':
      filter = makeCustomFilter(...(args.patterns as string[]));
      break;
    case 'all':
    default:
  }

  const emitter = logkitty({
    platform: 'android',
    priority: getMinPriority(selectedPriorities),
    filter,
  });

  emitter.on('entry', (entry: Entry) => {
    process.stdout.write(formatEntry(entry));
  });

  emitter.on('error', (error: Error) => {
    terminate(error);
  });
} catch (error) {
  terminate(error as Error | CodeError);
}

function terminate(error: CodeError | Error) {
  // tslint:disable-next-line: no-console
  console.log(formatError(error));
  process.exit(1);
}
