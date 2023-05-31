## Contributing
Any development should be done on a branch or a fork, then create a Pull Request to the `master` branch. When ready to merge choose "Rebase" and enter a commit message that follows the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-beta.4/#examples) specification, which at it's most basic is:

* Any new feature: start the commit message with `feat: `
* Any bugfix: start the commit message with `fix: `
* Anything else: start the commit message with `chore: `

These commit messages are important because they help others understand the changes and they are used to generate the [CHANGELOG](CHANGELOG.md).

Each Pull Request should only include a single fix or feature.

### Debugging

Data is stored in `USERDATA/Mapeo` on your machine, which will be different
depending on your operating system.

USERDATA is the per-user application data directory, which by default points to:
  * %APPDATA% on Windows
  * $XDG_CONFIG_HOME or ~/.config on Linux
  * ~/Library/Application Support on macOS

To simulate a reinstall, remove this `Mapeo` directory.

To only delete data and not presets or tiles, delete the `Mapeo/kappa.db`
directory.

In production mode, `info` and `error` messages are written to
`USERDATA/Mapeo/logs/$DATE.log` and kept for 1 year.

In debug mode and development mode (via `npm run dev` or in the Help menu),
Mapeo will verbosely write all messages for 1 day. 

### Styles and tiles

Create a project configuration and styles using the [User
Guide](https://docs.mapeo.app) and load it into your application. You can use
one of our private configurations, such as [2020
demo](https://github.com/digidem/mapeo-config-2020-demo-en). 

If you want even better test coverage, ask the program team for an example
dataset.


### Run a mock device

This runs a mock testing device that will broadcast itself on the local
network. This device saves it's data in `bin/test-data`. This can be helpful
for testing syncronization with a fake device on your machine.  This script
adds some dummy data based upon the given settings and preset categories. To use
different settings, remove the data folder with `rm -rf bin/test-data`. 

```sh
DEBUG=* node `/bin/mock.js` --settings /path/to/my/file.mapeosettings
```


Alternatively, you can use settings already in Mapeo Desktop by providing the
local `userDataPath`, and these settings will be copied to the test device. 

```sh
DEBUG=* node `/bin/mock.js` ~/.config/Mapeo/
```


### Run integration tests

```sh
npm run test-integration
```

The integration tests use Spectron and Tape. They click through the app, taking screenshots and
comparing each one to a reference. Why screenshots?

* Ad-hoc checking makes the tests a lot more work to write
* Even diffing the whole HTML is not as thorough as screenshot diffing. For example, it wouldn't
  catch an bug where hitting ESC from a video doesn't correctly restore window size.
* Chrome's own integration tests use screenshot diffing iirc
* Small UI changes will break a few tests, but the fix is as easy as deleting the offending
  screenshots and running the tests, which will recreate them with the new look.
* The resulting Github PR will then show, pixel by pixel, the exact UI changes that were made! See
  https://github.com/blog/817-behold-image-view-modes

For MacOS, you'll need a Retina screen for the integration tests to pass. Your screen should have
the same resolution as a 2016 12" Macbook.

For Windows, you'll need Windows 10 with a 1366x768 screen.

When running integration tests, keep the mouse on the edge of the screen and don't touch the mouse
or keyboard while the tests are running.


### Testing Automatic Updates

To test automatic updates, you may need to configure your local development
installation. 

1. Ensure `dev-app-update.yml` exists in the root directory (the same as
package.json).

```
provider: generic
url: https://downloads.mapeo.app/desktop
channel: latest
```

2. Downgrade your current version of Mapeo manually by changing `version` in
   `package.json` down one patch, e.g., `5.2.1` -> `5.2.0`.

3. Downloaded updates are stored in `USERDATA/.cache/Mapeo/pending/`, be sure
   to delete these if you want to re-create a full update flow.


### Running a local update server

You can also run an automatic update server locally, in case you don't have access to
the Internet or want to test new behavior:

```
$ mkdir updates
$ cd updates && wget https://downloads.mapeo.app/desktop/latest-{platform}.yml 
```

1. Then, open latest-linux.yml and find the `url` key. 

2. Download this url (e.g., `https://downloads.mapeo.ap/desktop/Install_Mapeo_{version}_{platform}.{ext}..` to the `updates` directory. 

3. Run `npx http-server` to host your update server locally, note the
   PORT.

4. Open `dev-app-update.yml` and change the url to `http://localhost:PORT`. 

**You can run this update server on a local network and create a proxy to that
server from https://downloads.mapeo.app to prioritize local updates.** 


### Building locally

Mapeo uses [Electron](http://electron.atom.io/). To package the Electron app as
a native Windows `.exe` or macOS `.dmg`, execute

```sh
npm run pack
```

The resultant installer or DMG will be placed in the `./dist` folder. You can only build Mapeo for the platform you run this command on, e.g. you need to run this on a Mac in order to build the Mac version of Mapeo.

### Deploy workflow

Every push to Github is built automatically on Windows, Mac and Linux. The output of these builds can be seen in [the Actions tab](https://github.com/digidem/mapeo-desktop/actions). Each build creates installers which can be downloaded from the "Artifacts" button in the top-right of the logs of each build. These installers should only be used for internal testing. They will likely be unstable.

When you are ready to create a release, you need to create a git tag and update the [Changelog](CHANGELOG.md). The best way to do this is by running:

```sh
npm run release
```

This will use the commit messages to update the changelog and bump the version number. Then push the commit and tag to Github:

```sh
git push --follow-tags origin master
```

This will trigger a build that will upload the installers to the [releases](https://github.com/digidem/mapeo-desktop/releases) page. It will also upload the reference to the latest versino on the https://mapeo.world website using `bin/release-latest.js`.


