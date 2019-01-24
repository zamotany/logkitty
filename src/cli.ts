import { spawn, execSync } from 'child_process';
import logcat, { Priority } from 'adbkit-logcat';
import yargs from 'yargs';
import processEntry from './processEntry';

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
    'Show logs only from given application',
    priorityOptions
  )
  .command(
    'custom <patterns ...>',
    'Filter using custom patterns <tag>:<priority>'
  )
  .command('all', 'Show all logs', priorityOptions)
  .demandCommand(1)
  .example('$0 tag MyTag', 'Filter logs to only include ones with MyTag tag')
  .example(
    '$0 tag MyTag -I',
    'Filter logs to only include ones with MyTag tag and priority INFO and above'
  )
  .example('$0 app com.example.myApp', 'Show all logs from com.example.myApp')
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

// Clear buffer
execSync('adb logcat -c');

const pid =
  command === 'app'
    ? parseInt(execSync(`adb shell pidof -s ${args.appId}`).toString(), 10)
    : -1;

const logcatProcess = spawn('adb', ['logcat', '-B'], {
  stdio: 'pipe',
});

process.on('exit', () => {
  logcatProcess.kill();
});

const reader = logcat.readStream(logcatProcess.stdout, { fixLineFeeds: false });
if (command === 'custom') {
  (args.patterns as string[]).forEach((patter: string) => {
    const [tag, priorityLetter] = patter.split(':');
    const priority = Priority.fromLetter(priorityLetter);
    if (tag === '*' && priority === Priority.SILENT) {
      reader.excludeAll();
    } else if (tag === '*' && priority !== Priority.SILENT) {
      reader.includeAll(priority);
    } else {
      reader.include(tag, priority);
    }
  });
}

reader.on(
  'entry',
  processEntry(command, {
    priorities: selectedPriorities,
    pid,
    tags: (args.tags as string[]) || [],
  })
);
