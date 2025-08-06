import {beforeEach, describe, expect, test} from '@jest/globals';
import * as os from 'os';
import * as path from 'path';

import * as context from '../src/context';

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
  test.each([
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
      } as context.Inputs
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
      } as context.Inputs
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
      } as context.Inputs
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
      } as context.Inputs
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
      } as context.Inputs
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
      } as context.Inputs
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
      } as context.Inputs
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
      } as context.Inputs
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
      } as context.Inputs
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
      } as context.Inputs
    ],
  ])(
    '[%d] given %p as inputs, returns %p',
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
