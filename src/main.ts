import * as crypto from 'crypto';
import path from 'path';
import * as core from '@actions/core';
import * as actionsToolkit from '@docker/actions-toolkit';
import {Install} from '@docker/actions-toolkit/lib/docker/install.js';
import {Docker} from '@docker/actions-toolkit/lib/docker/docker.js';
import {Install as RegclientInstall} from '@docker/actions-toolkit/lib/regclient/install.js';
import {Install as UndockInstall} from '@docker/actions-toolkit/lib/undock/install.js';

import * as context from './context.js';
import * as stateHelper from './state-helper.js';

const regctlDefaultVersion = 'v0.8.3';
const undockDefaultVersion = 'v0.10.0';

actionsToolkit.run(
  // main
  async () => {
    const input: context.Inputs = context.getInputs();
    const runDir = path.join(input.runtimeBasedir, `run-${crypto.randomUUID().slice(0, 8)}`);

    if (input.context == 'default') {
      throw new Error(`'default' context cannot be used.`);
    }

    if (input.source.type === 'image') {
      await core.group(`Download and install regctl`, async () => {
        const regclientInstall = new RegclientInstall({githubToken: input.githubToken});
        const regclientBinPath = await regclientInstall.download(
          process.env.REGCTL_VERSION && process.env.REGCTL_VERSION.trim()
            ? process.env.REGCTL_VERSION
            : regctlDefaultVersion,
          true
        );
        await regclientInstall.install(regclientBinPath);
      });
      await core.group(`Download and install undock`, async () => {
        const undockInstall = new UndockInstall({githubToken: input.githubToken});
        const undockBinPath = await undockInstall.download(
          process.env.UNDOCK_VERSION && process.env.UNDOCK_VERSION.trim()
            ? process.env.UNDOCK_VERSION
            : undockDefaultVersion,
          true
        );
        await undockInstall.install(undockBinPath);
      });
    }

    let tcpPort: number | undefined;
    let tcpAddress: string | undefined;
    if (input.tcpPort) {
      tcpPort = input.tcpPort;
      tcpAddress = `tcp://127.0.0.1:${tcpPort}`;
    }

    const install = new Install({
      runDir: runDir,
      source: input.source,
      rootless: input.rootless,
      contextName: input.context || 'setup-docker-action',
      daemonConfig: input.daemonConfig,
      localTCPPort: tcpPort,
      githubToken: input.githubToken
    });
    let toolDir;
    if (!(await Docker.isAvailable()) || input.source) {
      await core.group(`Download docker`, async () => {
        toolDir = await install.download();
      });
    }
    if (toolDir) {
      stateHelper.setRunDir(runDir);
      const sockPath = await install.install();
      await core.group(`Setting outputs`, async () => {
        core.info(`sock=${sockPath}`);
        core.setOutput('sock', sockPath);
        if (tcpAddress) {
          core.info(`tcp=${tcpAddress}`);
          core.setOutput('tcp', tcpAddress);
        }
      });

      if (input.setHost) {
        await core.group(`Setting Docker host`, async () => {
          core.exportVariable('DOCKER_HOST', sockPath);
          core.info(`DOCKER_HOST=${sockPath}`);
        });
      }
    }

    await core.group(`Docker info`, async () => {
      await Docker.printVersion();
      await Docker.printInfo();
    });
  },
  // post
  async () => {
    if (stateHelper.runDir.length == 0) {
      return;
    }
    const install = new Install({
      runDir: stateHelper.runDir
    });
    await install.tearDown();
  }
);
