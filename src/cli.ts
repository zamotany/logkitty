import yargs from 'yargs';
import AndroidParser from './android/AndroidParser';
import { runLoggingProcess, getApplicationPid } from './android/adb';
import { formatEntry, formatError } from './formatters';
import { CodeError } from './errors';
import { Entry, IParser, IFilter } from './types';
import { ChildProcess } from 'child_process';
import { AndroidFilter } from './android/AndroidFilter';

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

const platform = 'android';

try {
  //   const adbPath = getAbdPath(args['adb-path']);
  //   const targetProcessId =
  //     command === 'app'
  //       ? getApplicationPid(args.appId as string, adbPath)
  //       : undefined;
  //   const logcatProcess = spawnLogcatProcess(adbPath);

  //   process.on('exit', () => {
  //     logcatProcess.kill();
  //   });

  //   const reader = new LogcatReader(logcatProcess.stdout);
  //   reader.onEntry = (entry: Entry) => {
  //     process.stdout.write(formatEntry(entry));
  //   };

  //   if (command === 'custom') {
  //     reader.setCustomPatterns(args.patterns as string[]);
  //   } else {
  //     reader.setFilter(command as 'tag' | 'app' | 'all' | 'match', {
  //       tags: args.tags as string[] | undefined,
  //       processId: targetProcessId,
  //       regexes: args.regexes
  //         ? (args.regexes as string[]).map((value: string) => new RegExp(value))
  //         : undefined,
  //       minPriority: getMinPriority(selectedPriorities),
  //     });
  //   }

  let loggingProcess: ChildProcess;
  let parser: IParser;
  let filter: IFilter;

  if (platform === 'android') {
    loggingProcess = runLoggingProcess(args['adb-path']);
    parser = new AndroidParser();
    filter = new AndroidFilter();
  } else {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  process.on('exit', () => {
    loggingProcess.kill();
  });

  loggingProcess.stdout.on('data', (raw: string | Buffer) => {
    const messages = parser.splitMessages(raw.toString());
    const entries = parser.parseMessages(messages);
    entries.forEach((entry: Entry) => {
      if (filter.shouldInclude(entry)) {
        process.stdout.write(formatEntry(entry));
      }
    });
  });

  loggingProcess.stdout.on('error', (error: Error) => {
    terminate(error);
  });
} catch (error) {
  terminate(error as CodeError | Error);
}

function terminate(error: CodeError | Error) {
  // tslint:disable-next-line: no-console
  console.log(formatError(error));
  process.exit(1);
}
