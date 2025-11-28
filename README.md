[![GitHub release](https://img.shields.io/github/release/docker/setup-docker-action.svg?style=flat-square)](https://github.com/docker/setup-docker-action/releases/latest)
[![GitHub marketplace](https://img.shields.io/badge/marketplace-docker--setup--docker-blue?logo=github&style=flat-square)](https://github.com/marketplace/actions/docker-setup-docker)
[![CI workflow](https://img.shields.io/github/actions/workflow/status/docker/setup-docker-action/ci.yml?branch=master&label=ci&logo=github&style=flat-square)](https://github.com/docker/setup-docker-action/actions?workflow=ci)
[![Test workflow](https://img.shields.io/github/actions/workflow/status/docker/setup-docker-action/test.yml?branch=master&label=test&logo=github&style=flat-square)](https://github.com/docker/setup-docker-action/actions?workflow=test)
[![Codecov](https://img.shields.io/codecov/c/github/docker/setup-docker-action?logo=codecov&style=flat-square)](https://codecov.io/gh/docker/setup-docker-action)

## About

GitHub Action to set up (download and install) [Docker CE](https://docs.docker.com/engine/).
Works on Linux, macOS and Windows.

> [!NOTE]
> This action is useful if you want to pin against a specific Docker version or
> set up a custom daemon configuration or if Docker is not available on your
> runner. If you're using [GitHub-hosted runners](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners/about-github-hosted-runners#supported-runners-and-hardware-resources)
> on Linux or Windows, Docker is already up and running, so it might not be
> necessary to use this action.

> [!WARNING]
> Does not work on macOS runners with ARM architecture (no nested virtualization):
> * https://github.com/crazy-max/ghaction-setup-docker/pull/53
> * https://github.com/docker/actions-toolkit/issues/317

![Screenshot](.github/setup-docker-action.png)

___

* [Usage](#usage)
  * [Quick start](#quick-start)
  * [Daemon configuration](#daemon-configuration)
  * [Define custom `limactl start` arguments (macOS)](#define-custom-limactl-start-arguments-macos)
* [Customizing](#customizing)
  * [inputs](#inputs)
  * [inputs.version](#inputsversion)
  * [outputs](#outputs)
* [Contributing](#contributing)
* [License](#license)

## Usage

### Quick start

```yaml
name: ci

on:
  push:

jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      -
        name: Set up Docker
        uses: docker/setup-docker-action@v4
```

### Daemon configuration

You can [configure the Docker daemon](https://docs.docker.com/engine/reference/commandline/dockerd/#daemon-configuration-file)
using the `daemon-config` input. In the following example, we configure the
Docker daemon to enable debug and the [containerd image store](https://docs.docker.com/storage/containerd/)
feature:

```yaml
name: ci

on:
  push:

jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      -
        name: Set up Docker
        uses: docker/setup-docker-action@v4
        with:
          daemon-config: |
            {
              "debug": true,
              "features": {
                "containerd-snapshotter": true
              }
            }
```

### Define custom `limactl start` arguments (macOS)

You can define custom [`limactl start` arguments](https://lima-vm.io/docs/reference/limactl_start/)
using the `LIMA_START_ARGS` environment variable to customize the VM:

```yaml
name: ci

on:
  push:

jobs:
  docker:
    runs-on: macos-latest
    steps:
      -
        name: Set up Docker
        uses: docker/setup-docker-action@v4
        env:
          LIMA_START_ARGS: --cpus 4 --memory 8
```

## Customizing

### inputs

The following inputs can be used as `step.with` keys

| Name              | Type   | Default                      | Description                                                                                                                                                  |
|-------------------|--------|------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `version`         | String | `latest`                     | Docker version to use. See [inputs.version](#inputs.version).                                                                                                |
| `channel`         | String | `stable`                     | Docker CE [channel](https://download.docker.com/linux/static/) (`stable` or `test`). Only applicable to `type=archive`                                       |
| `daemon-config`   | String |                              | [Docker daemon JSON configuration](https://docs.docker.com/engine/reference/commandline/dockerd/#daemon-configuration-file)                                  |
| `tcp-port`        | Number |                              | TCP port to expose the Docker API locally                                                                                                                    |
| `context`         | String | `setup-docker-action`        | Docker context name.                                                                                                                                         |
| `set-host`        | Bool   | `false`                      | Set `DOCKER_HOST` environment variable to docker socket path.                                                                                                |
| `rootless`        | Bool   | `false`                      | Start daemon in rootless mode                                                                                                                                |
| `runtime-basedir` | String | `<home>/setup-docker-action` | Docker runtime base directory                                                                                                                                |
| `github-token`    | String | `${{ github.token }}`        | Optional GitHub Token used to get releases and download assets to avoid rate limitation. On GitHub Enterprise, you might need to set a PAT for `github.com`. |

### inputs.version

By default, the latest stable version of Docker is fetched from download.docker.com.

You can specify a specific version number (e.g. `v27.4.0`).
Which is a shorthand for the full comma separated value:

`type=archive,channel=stable,version=v27.4.0`

You can also use this full csv format instead.

Currently supported source types are:
- `archive`
- `image`

#### `type=archive`
| Key       |  Default   | Description                                                                          |
|-----------|------------|--------------------------------------------------------------------------------------| 
| `type`    | `archive`  | The source type of the Docker binaries. Possible values are `archive` and `image`.   | 
| `channel` | `stable`   | The download.docker.com channel (`stable` or `test`).                                | 
| `version` | `latest`   | The Docker version to use.                                                           | 

Examples:
```yaml
# last stable released version
version: latest
version: type=archive                 # same as above
version: version=latest               # same as above
version: type=archive,version=latest  # same as above
```

```yaml
# v27.3.0-rc.1 from test channel
version: type=archive,version=27.3.0-rc.1,channel=test
```

#### `type=image`

Other possible source type is `image` which will pull the Docker binaries from the `moby/moby-bin` and
`dockereng/cli-bin` Docker Hub repositories.
The advantage of using this source type is that these images are built by the Moby and Docker CI pipelines
for each branch and PR, so you can use the `tag` input to install a specific version or branch (e.g. `master`).

| Key       |  Default   | Description                                                                          |
|-----------|------------|--------------------------------------------------------------------------------------|
| `tag`     | `latest`   | The image tag to use.                                                                |

See https://hub.docker.com/r/moby/moby-bin/tags and https://hub.docker.com/r/dockereng/cli-bin/tags for available tags.

Examples:
```yaml
# install last stable released version from bin images
version: type=image
version: type=image,tag=latest        # same as above
```

```yaml
# a cutting-edge version from the `master` branch
version: type=image,tag=master
```

```yaml
# install v27.4.0 from bin images
version: type=image,tag=27.4.0
```

### outputs

The following outputs are available

| Name   | Type   | Description                           |
|--------|--------|---------------------------------------|
| `sock` | String | Docker socket path                    |
| `tcp`  | String | Docker TCP address if tcp-port is set |

## Contributing

Want to contribute? Awesome! You can find information about contributing to
this project in the [CONTRIBUTING.md](/.github/CONTRIBUTING.md)

## License

Apache-2.0. See `LICENSE` for more details.
