import {beforeEach, describe, expect, test} from 'vitest';
import * as os from 'os';
import * as path from 'path';

import * as context from '../src/context.js';

describe('getInputs', () => {
  beforeEach(() => {
    process.env = Object.keys(process.env).reduce((object, key) => {
      if (!key.startsWith('INPUT_')) {
        object[key] = process.env[key];
      }
      return object;
    }, {});
  });

  // prettier-ignore
  const cases: [number, Map<string, string>, context.Inputs][] = [
    [
      0,
      new Map<string, string>([
        ['version', 'v24.0.8'],
        ['set-host', 'false'],
        ['rootless', 'false'],
      ]),
      {
        source: {
          type: 'archive',
          version: 'v24.0.8',
          channel: 'stable'
        },
        context: '',
        daemonConfig: '',
        rootless: false,
        setHost: false,
        runtimeBasedir: path.join(os.homedir(), `setup-docker-action`),
        githubToken: '',
      }
    ],
    [
      1,
      new Map<string, string>([
        ['version', 'v24.0.0-rc.4'],
        ['channel', 'test'],
        ['context', 'foo'],
        ['daemon-config', `{"debug":true,"features":{"containerd-snapshotter":true}}`],
        ['set-host', 'false'],
        ['rootless', 'false'],
      ]),
      {
        source: {
          type: 'archive',
          version: 'v24.0.0-rc.4',
          channel: 'test'
        },
        context: 'foo',
        daemonConfig: `{"debug":true,"features":{"containerd-snapshotter":true}}`,
        rootless: false,
        setHost: false,
        runtimeBasedir: path.join(os.homedir(), `setup-docker-action`),
        githubToken: '',
      }
    ],
    [
      2,
      new Map<string, string>([
        ['set-host', 'true'],
        ['rootless', 'false'],
      ]),
      {
        source: {
          type: 'archive',
          version: 'latest',
          channel: 'stable',
        },
        context: '',
        daemonConfig: '',
        rootless: false,
        setHost: true,
        runtimeBasedir: path.join(os.homedir(), `setup-docker-action`),
        githubToken: '',
      }
    ],
    [
    3,
      new Map<string, string>([
        ['version', 'type=image,tag=master'],
        ['context', 'foo'],
        ['daemon-config', `{"debug":true,"features":{"containerd-snapshotter":true}}`],
        ['set-host', 'false'],
        ['rootless', 'false'],
      ]),
      {
        source: {
          type: 'image',
          tag: 'master',
        },
        context: 'foo',
        daemonConfig: `{"debug":true,"features":{"containerd-snapshotter":true}}`,
        rootless: false,
        setHost: false,
        runtimeBasedir: path.join(os.homedir(), `setup-docker-action`),
        githubToken: '',
      }
    ],
    [
      4,
      new Map<string, string>([
        ['version', 'type=image'],
        ['set-host', 'false'],
        ['rootless', 'false'],
      ]),
      {
        source: {
          type: 'image',
          tag: 'latest',
        },
        context: '',
        daemonConfig: '',
        rootless: false,
        setHost: false,
        runtimeBasedir: path.join(os.homedir(), `setup-docker-action`),
        githubToken: '',
      }
    ],
    [
      5,
      new Map<string, string>([
        ['version', 'type=archive'],
        ['set-host', 'false'],
        ['rootless', 'false'],
      ]),
      {
        source: {
          type: 'archive',
          version: 'latest',
          channel: 'stable',
        },
        setHost: false,
        context: '',
        daemonConfig: '',
        rootless: false,
        runtimeBasedir: path.join(os.homedir(), `setup-docker-action`),
        githubToken: '',
      }
    ],
    [
      6,
      new Map<string, string>([
        ['version', 'version=v27.2.0,channel=test'],
        ['set-host', 'false'],
        ['rootless', 'false'],
      ]),
      {
        source: {
          type: 'archive',
          version: 'v27.2.0',
          channel: 'test',
        },
        setHost: false,
        context: '',
        daemonConfig: '',
        rootless: false,
        runtimeBasedir: path.join(os.homedir(), `setup-docker-action`),
        githubToken: '',
      }
    ],
    [
      7,
      new Map<string, string>([
        ['version', 'type=image,tag=27.2.1'],
        ['set-host', 'false'],
        ['rootless', 'false'],
      ]),
      {
        source: {
          type: 'image',
          tag: '27.2.1',
        },
        setHost: false,
        context: '',
        daemonConfig: '',
        rootless: false,
        runtimeBasedir: path.join(os.homedir(), `setup-docker-action`),
        githubToken: '',
      }
    ],
    [
      8,
      new Map<string, string>([
        ['version', 'type=image,tag=27.2.1'],
        ['set-host', 'false'],
        ['rootless', 'true']
      ]),
      {
        source: {
          type: 'image',
          tag: '27.2.1',
        },
        setHost: false,
        context: '',
        daemonConfig: '',
        rootless: true,
        runtimeBasedir: path.join(os.homedir(), `setup-docker-action`),
        githubToken: '',
      }
    ],
    [
      9,
      new Map<string, string>([
        ['version', 'v24.0.8'],
        ['tcp-port', '2378'],
        ['set-host', 'false'],
        ['rootless', 'false'],
      ]),
      {
        source: {
          type: 'archive',
          version: 'v24.0.8',
          channel: 'stable'
        },
        context: '',
        daemonConfig: '',
        tcpPort: 2378,
        rootless: false,
        setHost: false,
        runtimeBasedir: path.join(os.homedir(), `setup-docker-action`),
        githubToken: '',
      }
    ],
  ];
  test.each(cases)(
    '[%d] given %o as inputs, returns %o',
    async (num: number, inputs: Map<string, string>, expected: context.Inputs) => {
      inputs.forEach((value: string, name: string) => {
        setInput(name, value);
      });
      const res = await context.getInputs();
      expect(res).toEqual(expected);
    }
  );
});

// See: https://github.com/actions/toolkit/blob/master/packages/core/src/core.ts#L67
function getInputName(name: string): string {
  return `INPUT_${name.replace(/ /g, '_').toUpperCase()}`;
}

function setInput(name: string, value: string): void {
  process.env[getInputName(name)] = value;
}
