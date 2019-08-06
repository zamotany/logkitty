import DayJS from 'dayjs';

export const IOS_RAW_LOG_FIXTURES = [
  '2019-04-09 16:37:15.464004+0200 0xf3e23    Default     0x0                  52389  0    testApp: (libnetwork.dylib) [com.apple.network:] nw_endpoint_flow_protocol_disconnected [C25.1 ::1.8081 cancelled socket-flow (null)] Output protocol disconnected',
  '2019-04-09 16:37:15.464628+0200 0xf3e23    Default     0x0                  52389  0    testApp: (CFNetwork) [com.apple.CFNetwork:Coalescing] removing all entries config 0x600001f5b600',
  '2019-04-09 16:37:15.576332+0200 0xf3e27    Error       0x0                  52389  0    testApp: JS test message',
  '2019-04-09 16:37:15.614114+0200 0xf3e22    Default     0x0                  52389  0    testApp: (CFNetwork) TCP Conn [26:0x600002a08480] using empty proxy configuration',
  '2019-04-09 16:37:15.614124+0200 0xf1d08    Default     0x0                  52389  0    testApp: Running application testApp ({\n    initialProps =     {\n};\n    rootTag = 71;\n  })',
  '2019-04-09 16:37:15.614170+0200 0xf3e22    Default     0x0                  52389  0    testApp1: (CFNetwork) TCP Conn 0x600002a08480 started',
];

export const IOS_PARSED_LOG_FIXTURES = [
  {
    date: DayJS('2019-04-09 16:37:15.464004+0200').set('millisecond', 0),
    pid: 52389,
    priority: 1,
    tag: 'testApp',
    messages: [
      '(libnetwork.dylib) [com.apple.network:] nw_endpoint_flow_protocol_disconnected [C25.1 ::1.8081 cancelled socket-flow (null)] Output protocol disconnected',
    ],
    platform: 'ios',
  },
  {
    date: DayJS('2019-04-09 16:37:15.464004+0200').set('millisecond', 0),
    pid: 52389,
    priority: 1,
    tag: 'testApp',
    messages: [
      '(CFNetwork) [com.apple.CFNetwork:Coalescing] removing all entries config 0x600001f5b600',
    ],
    platform: 'ios',
  },
  {
    date: DayJS('2019-04-09 16:37:15.464004+0200').set('millisecond', 0),
    pid: 52389,
    priority: 3,
    tag: 'testApp',
    messages: ['JS test message'],
    platform: 'ios',
  },
  {
    date: DayJS('2019-04-09 16:37:15.464004+0200').set('millisecond', 0),
    pid: 52389,
    priority: 1,
    tag: 'testApp',
    messages: [
      '(CFNetwork) TCP Conn [26:0x600002a08480] using empty proxy configuration',
    ],
    platform: 'ios',
  },
  {
    date: DayJS('2019-04-09 16:37:15.464004+0200').set('millisecond', 0),
    pid: 52389,
    priority: 1,
    tag: 'testApp',
    messages: [
      'Running application testApp ({\n    initialProps =     {\n};\n    rootTag = 71;\n  })',
    ],
    platform: 'ios',
  },
  {
    date: DayJS('2019-04-09 16:37:15.464004+0200').set('millisecond', 0),
    pid: 52389,
    priority: 1,
    tag: 'testApp1',
    messages: ['(CFNetwork) TCP Conn 0x600002a08480 started'],
    platform: 'ios',
  },
];
