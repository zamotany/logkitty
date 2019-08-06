import DayJS from 'dayjs';

export const ANDROID_RAW_LOG_FIXTURES = [
  '04-08 00:58:53.967 E/storaged(  934): getDiskStats failed with result NOT_SUPPORTED and size 0',
  '04-08 01:10:54.261 I/chatty  ( 1383): uid=1000(system) ActivityManager expire 10 lines',
  '04-08 01:10:54.990 V/chatty  ( 1383): uid=1000 system_server expire 3 lines',
  '04-08 01:32:25.371 W/wificond(  935): No pno scan started',
  '04-08 01:32:25.371 D/wificond(  935): Scheduled scan is not running!',
];

export const ANDROID_PARSED_LOG_FIXTURES = [
  {
    date: DayJS()
      .set('month', 4)
      .set('day', 8)
      .set('hour', 0)
      .set('minute', 58)
      .set('second', 53)
      .set('millisecond', 0),
    pid: 934,
    priority: 5,
    tag: 'storaged',
    messages: ['getDiskStats failed with result NOT_SUPPORTED and size 0'],
    platform: 'android',
  },
  {
    date: DayJS()
      .set('month', 4)
      .set('day', 8)
      .set('hour', 1)
      .set('minute', 10)
      .set('second', 54)
      .set('millisecond', 0),
    pid: 1383,
    priority: 3,
    tag: 'chatty',
    messages: ['uid=1000(system) ActivityManager expire 10 lines'],
    platform: 'android',
  },
  {
    date: DayJS()
      .set('month', 4)
      .set('day', 8)
      .set('hour', 1)
      .set('minute', 32)
      .set('second', 25)
      .set('millisecond', 0),
    pid: 935,
    priority: 4,
    tag: 'wificond',
    messages: ['No pno scan started'],
    platform: 'android',
  },
  {
    date: DayJS()
      .set('month', 4)
      .set('day', 8)
      .set('hour', 1)
      .set('minute', 32)
      .set('second', 25)
      .set('millisecond', 0),
    pid: 935,
    priority: 2,
    tag: 'wificond',
    messages: ['Scheduled scan is not running!'],
    platform: 'android',
  },
];
