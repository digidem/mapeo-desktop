# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [6.0.0](https://github.com/digidem/mapeo-desktop/compare/v4.0.1-beta...v6.0.0) (2020-02-07)


### ⚠ BREAKING CHANGES

* New sync protocol incompatible with Mapeo Mobile v1 and Desktop v4

### Features

* 🚀 Export observations to GeoJSON, CSV, Smart CSV with option to include photos ([67b7b81](https://github.com/digidem/mapeo-desktop/commit/67b7b811e9e2155d1a7764ab30cb9ea987fe7e75))
* Add ability to delete observations (click 3 vertical-dots icon on Observation Dialog) ([e5879df](https://github.com/digidem/mapeo-desktop/commit/e5879df52f54ccf03712de4ae42ae0a954d8cbe3))
* Add an error boundary to catch errors and show helpful message ([7a1f42f](https://github.com/digidem/mapeo-desktop/commit/7a1f42ff406b75feed69a4c69a05b6970b50d02a))
* Add custom presets to iD, support Mapeo syntax for presets ([0bb1d4d](https://github.com/digidem/mapeo-desktop/commit/0bb1d4d9fa83dfe50c41b50f2494565c112b3efc))
* Add error messages for incompatible mapeo versions ([5947908](https://github.com/digidem/mapeo-desktop/commit/59479083d57d48cfdaa67e3569bda81a3d571448))
* add GeoJSON export with choice of filtered or all ([529efec](https://github.com/digidem/mapeo-desktop/commit/529efec60ac7944ba766e517c0ef39edd7bba5f2))
* Add map export dialog ([5d3ccbd](https://github.com/digidem/mapeo-desktop/commit/5d3ccbd222ee4fb871324a8366a774c9a43f4194))
* Add react-intl i18n support ([954229a](https://github.com/digidem/mapeo-desktop/commit/954229af640e2d79ba385127a8015e2d45c58412))
* Add right-click menu for copy/paste text and save/copy image ([4416740](https://github.com/digidem/mapeo-desktop/commit/4416740652a1713a6ce8750a6d9e3605b2dd4679))
* Add support for read-only multi-select fields ([01c0eea](https://github.com/digidem/mapeo-desktop/commit/01c0eeaeeb9dd95bec91acf5b93f310b9638bec4))
* Add sync button + storybook ([f47dffb](https://github.com/digidem/mapeo-desktop/commit/f47dffb8a20a0efc8aa193c43e44d3d764742794))
* Add sync tab components ([c1af588](https://github.com/digidem/mapeo-desktop/commit/c1af58890efb434aa034199d7c7222fb1a20be0c))
* Add tabs sidebar UI ([8580f3d](https://github.com/digidem/mapeo-desktop/commit/8580f3d051358e68c2c86443f694fd88129dcd74))
* Add translations ([3254bd0](https://github.com/digidem/mapeo-desktop/commit/3254bd0929f18712985676708d20965e65da33e0))
* Add translations / i18n ([e87d62b](https://github.com/digidem/mapeo-desktop/commit/e87d62b00ad253a6f57b89148366bdc948e3a0d8))
* Add version number to left-panel ([7887da4](https://github.com/digidem/mapeo-desktop/commit/7887da4a0f68f60a17e092f3e4c89fab37b403a3))
* Add Windows Code signing ([7627e7b](https://github.com/digidem/mapeo-desktop/commit/7627e7b69ac49e808a1a3fc79d1f4e7539c4cd9b))
* Allow hack to change minEditableZoom in iD ([e925e02](https://github.com/digidem/mapeo-desktop/commit/e925e02fc7e38868a1dbac9ca5edb4afcd69f6f7))
* Encrypt sync with projectKey ([5268909](https://github.com/digidem/mapeo-desktop/commit/5268909feceebd5684edbef5f62369905a713cbf))
* Only sync with peers with matching projectKey ([f442fec](https://github.com/digidem/mapeo-desktop/commit/f442fecb58ddc23ff8f27fb5de886dc049b76c27))
* reload observations after sync ([f09243e](https://github.com/digidem/mapeo-desktop/commit/f09243ef4a71befc99cb37bfd60d2b127782dfae))
* Remember window size and position ([cca4bc7](https://github.com/digidem/mapeo-desktop/commit/cca4bc789106a2407405387784221334e1ca9728))
* Show reload menu ([a22e448](https://github.com/digidem/mapeo-desktop/commit/a22e448ad7cd3a2addb9c9c2bb5fc1febd8133b3))
* sync with file ([0a92f4a](https://github.com/digidem/mapeo-desktop/commit/0a92f4a4837686f340aaba7c1c58fc65ecb69388))
* Translations ([a38678c](https://github.com/digidem/mapeo-desktop/commit/a38678c87d5379c8f8d287a166cac5e5429b2e2f))
* Update Home with persisted state and translations ([16c4d6d](https://github.com/digidem/mapeo-desktop/commit/16c4d6dab24f4a508a38f65958cab3a180e6bd69))
* Upgrade to electron v6 and electron-builder v21 ([c3796db](https://github.com/digidem/mapeo-desktop/commit/c3796db5efc09012e9ad11334eb1957319252bfe))
* Use electron-log instead of custom solution ([c3e3da0](https://github.com/digidem/mapeo-desktop/commit/c3e3da0f264e52a082647e2ac8249701f32755de))
* **UI:** Style toolbar in iD Editor to match MapFilter toolbar ([e39509d](https://github.com/digidem/mapeo-desktop/commit/e39509d59de0e64bcfac1103a03c0ac3aab6cbb6))
* Use new MapFitler ([8e008b4](https://github.com/digidem/mapeo-desktop/commit/8e008b4c6b2977899f64bbb99834dd4e96537bab))
* Work with offline maps ([a314abd](https://github.com/digidem/mapeo-desktop/commit/a314abd8c66ae6421abbd82c9b69f6a146885971))


### Bug Fixes

* add ES translations for sync errors ([3999e7e](https://github.com/digidem/mapeo-desktop/commit/3999e7eaa98f578bbd7891a6c3ead66bfd97db30))
* argh I'll get these build scripts right eventually ([efcc0a3](https://github.com/digidem/mapeo-desktop/commit/efcc0a34f2f6231cf5a83840c4a89501cdd078e6))
* Avoid crash on close if app has crashed before iD loads ([541d141](https://github.com/digidem/mapeo-desktop/commit/541d14153c96bd8e7105d5300523da762441f925))
* build, again ([2b4581a](https://github.com/digidem/mapeo-desktop/commit/2b4581a78bf57df8609516d633ed2ca66d95a9b3))
* cleanup i18n ([335211c](https://github.com/digidem/mapeo-desktop/commit/335211c136b9f6fe24011347e4ec0a88fa64d01f))
* Disable form inputs during export saving TODO: Add progress bar ([c2ebc3a](https://github.com/digidem/mapeo-desktop/commit/c2ebc3ae92f7cf023aa3b330cf23e21118479ecf))
* Don't force "syncing during close" menu to be on top of other windows ([74c2ac6](https://github.com/digidem/mapeo-desktop/commit/74c2ac6d372bb12ab42b3e177f5566931795a78b))
* Don't include broken files for missing images in Webmap export ([5ec2554](https://github.com/digidem/mapeo-desktop/commit/5ec2554cca8ff27ce11bb388a9e6e1840ec260c4))
* Fix build error (npm ci) ([0a9834b](https://github.com/digidem/mapeo-desktop/commit/0a9834b9795ce9fc0e30c0fc5acf2fb090313b28))
* Fix cancelling import from File menu causing crash ([60531b3](https://github.com/digidem/mapeo-desktop/commit/60531b37f511841759517ec961578a752271f7da))
* Fix date distance i18n ([b738ec2](https://github.com/digidem/mapeo-desktop/commit/b738ec2e576c0dfebccd8afd35a251c35fc4cc53))
* Fix errors with background imagery when using custom backgrounds ([e45278d](https://github.com/digidem/mapeo-desktop/commit/e45278ddd68992bc5d37b8085e2f1e648289388f))
* Fix filter error ([cc59d0e](https://github.com/digidem/mapeo-desktop/commit/cc59d0eeaced13766482804a44b6593e4fb40568))
* Fix localization of Menu ([348dfeb](https://github.com/digidem/mapeo-desktop/commit/348dfebea7e062a9f27e60f5d569b64b99f72bd9))
* Fix map view appearing wrong size on first load ([e485657](https://github.com/digidem/mapeo-desktop/commit/e485657fb585f99b7640ecc94f74d501f8abc3be))
* fix package.json scripts to work on Windows ([c876b12](https://github.com/digidem/mapeo-desktop/commit/c876b12b522c630b73d89aa79d131e08969c64aa))
* Fix strange bug causing Map accessToken error, resulting in crash ([7a3a08d](https://github.com/digidem/mapeo-desktop/commit/7a3a08d936fb6a41a59d250ba7a53dc95ded2db4))
* Fix sync error by updating mapeo-server ([e3b44ba](https://github.com/digidem/mapeo-desktop/commit/e3b44ba1a4a580f9b0aeb55fd777ec80ea844759))
* Fix syncfile when using projectKey ([9323194](https://github.com/digidem/mapeo-desktop/commit/93231946f7be201d68f4eeacc86106751ae2d6a0))
* Fix Windows CI/CD for automated builds ([#277](https://github.com/digidem/mapeo-desktop/issues/277)) ([d265d20](https://github.com/digidem/mapeo-desktop/commit/d265d208375ab961773988ea7eeb1cc478e0fcaf))
* hackily fixes react dependency bug ([b6d8eac](https://github.com/digidem/mapeo-desktop/commit/b6d8eac09d6d64a3e9c0a7ac4d23a930242f3050))
* include peer deps ([00a1a76](https://github.com/digidem/mapeo-desktop/commit/00a1a76d7579a2f3cb3a35a7257b3fb50ede5ba3))
* Integrate new mapeo core that de-forks observations ([a03712c](https://github.com/digidem/mapeo-desktop/commit/a03712cb0068f62906b2985ee946182b674b4329))
* **Territory:** Fix display of feature properties in LH pane ([25a5193](https://github.com/digidem/mapeo-desktop/commit/25a519388076024c993d3b166bc83654d59a855e))
* jungle presets load correctly on startup ([2397d59](https://github.com/digidem/mapeo-desktop/commit/2397d59a7dadbba11b3808ec99fe97624c8425d9))
* only install dev tools in dev environment ([b9a67e5](https://github.com/digidem/mapeo-desktop/commit/b9a67e52ef4b3bc02f4366ceb0fe11ae557eaa42))
* pin discovery-swarm to 6 for now until sync works ([#264](https://github.com/digidem/mapeo-desktop/issues/264)) ([9793880](https://github.com/digidem/mapeo-desktop/commit/97938806154365c4aa6617a60918ec41203065b6))
* refresh iD editor after sync ([7200e87](https://github.com/digidem/mapeo-desktop/commit/7200e87f8931909690c0119d0dcb59f1feab2746))
* refresh page after preset import ([33dd768](https://github.com/digidem/mapeo-desktop/commit/33dd768986d11ca6456c21565d1ea2d7f85e4135))
* Remove asar from the import menu ([#262](https://github.com/digidem/mapeo-desktop/issues/262)) ([b2e0924](https://github.com/digidem/mapeo-desktop/commit/b2e0924b0a8bf29101091a49bcecab77754249e9))
* remove export of mapeodata file from file menu ([f7a6832](https://github.com/digidem/mapeo-desktop/commit/f7a6832d96fd3cac19d7943f3e00b449cf777fb0))
* report import progress, completion + errors using dialogs ([f75c252](https://github.com/digidem/mapeo-desktop/commit/f75c252519ed35d3c8cca04d81bcef9c27cc6a23))
* Restore ability to drag/move window on MacOS ([ee2fa4f](https://github.com/digidem/mapeo-desktop/commit/ee2fa4fa1841f9402e487f1ad8158b1ff83420a6))
* Save exports with atomic write stream to avoid problems with half-written files ([cb8acee](https://github.com/digidem/mapeo-desktop/commit/cb8acee70f10d15cf87466da9e12e630d4bf32e3))
* scrolling is now possible in sync screen ([259f167](https://github.com/digidem/mapeo-desktop/commit/259f1677945efd463e17413e6939a1cfbb5dca0e))
* Show sync progress when sync is initiated by other side ([627dc20](https://github.com/digidem/mapeo-desktop/commit/627dc200638bfcbbd5fe19ed195c2c7cdd89bd85))
* Show window while waiting for sync to complete ([7435f59](https://github.com/digidem/mapeo-desktop/commit/7435f593066fb84c3eb174782404ddf976308658))
* skip release notes upload - it was breaking release process ([da5cd58](https://github.com/digidem/mapeo-desktop/commit/da5cd58506f6503f68d5d2b76f1ebac619a0382c))
* **MapFilter:** Fix translation of Delete Observation menu item ([8f71205](https://github.com/digidem/mapeo-desktop/commit/8f712058ebc3a000f2e1e73b8f6906ccd20f4b8e))
* **perf:** Don't show searching animation when sync tab is hidden ([4bbe8e0](https://github.com/digidem/mapeo-desktop/commit/4bbe8e0f5aba1a602a01ab37292ab5c80723571c))
* **UX:** Fix sidebar buttons not working when iD is showing a dialog ([4f477f4](https://github.com/digidem/mapeo-desktop/commit/4f477f4f73154015f58f64d3f01c24a8dfb4efb7))
* update iD to fix build error ([2878139](https://github.com/digidem/mapeo-desktop/commit/28781391dcd69c6b96a4a6a619d4ba9b98df915f))
* update MapFilter for latest fixes ([46a9bed](https://github.com/digidem/mapeo-desktop/commit/46a9bed24080732092627060ab5698568a06bbb6))
* update osm-p2p-server to work with Electron v6 ([bf64e07](https://github.com/digidem/mapeo-desktop/commit/bf64e07927ddaceba0b78536a9cd701593be75f5))
* update to latest iD with fix for slowdown at startup ([14416e9](https://github.com/digidem/mapeo-desktop/commit/14416e943c7b69512796d11ec67273c731382cbe))
* Use Windows line-endings in exported text files ([089e774](https://github.com/digidem/mapeo-desktop/commit/089e7748c00e6e480f8b3b0b7d48a56a661b39e7))
* Windows build ([8838ae2](https://github.com/digidem/mapeo-desktop/commit/8838ae22eeee8004f542e970714e753c8389a070))
* Zoom to data now works in both MapEditor and Observation views ([fa4bdb0](https://github.com/digidem/mapeo-desktop/commit/fa4bdb01cc29150209158653e76abaa330c257b8))


* New sync protocol incompatible with Mapeo Mobile v1 and Desktop v4 ([e2923a3](https://github.com/digidem/mapeo-desktop/commit/e2923a374b91f1e978854be28be5d5a219957e37))

### [5.0.2](https://github.com/digidem/mapeo-desktop/compare/v5.0.1...v5.0.2) (2020-02-05)

*  Fix a bug in Observations view that would prevent displaying Mapeo. Reverts ([b6d8eac](https://github.com/digidem/mapeo-desktop/commit/b6d8eac09d6d64a3e9c0a7ac4d23a930242f3050))

### [5.0.1](https://github.com/digidem/mapeo-desktop/compare/v5.0.0...v5.0.1) (2020-02-04)


### Bug Fixes

* fixes some bugs in multifeed and osm-p2p-syncfile
* hackily fixes react dependency bug ([b6d8eac](https://github.com/digidem/mapeo-desktop/commit/b6d8eac09d6d64a3e9c0a7ac4d23a930242f3050))
* pin discovery-swarm to 6 for now until sync works ([#264](https://github.com/digidem/mapeo-desktop/issues/264)) ([9793880](https://github.com/digidem/mapeo-desktop/commit/97938806154365c4aa6617a60918ec41203065b6))
* Remove asar from the import menu ([#262](https://github.com/digidem/mapeo-desktop/issues/262)) ([b2e0924](https://github.com/digidem/mapeo-desktop/commit/b2e0924b0a8bf29101091a49bcecab77754249e9))

## [5.0.0](https://github.com/digidem/mapeo-desktop/compare/v5.0.0-beta.3...v5.0.0) (2019-11-25)

## [5.0.0-beta.3](https://github.com/digidem/mapeo-desktop/compare/v5.0.0-beta.2...v5.0.0-beta.3) (2019-11-25)


### Bug Fixes

* Fix syncfile when using projectKey ([9323194](https://github.com/digidem/mapeo-desktop/commit/93231946f7be201d68f4eeacc86106751ae2d6a0))

## [5.0.0-beta.2](https://github.com/digidem/mapeo-desktop/compare/v5.0.0-beta.1...v5.0.0-beta.2) (2019-11-23)


### Bug Fixes

* Fix filter error ([cc59d0e](https://github.com/digidem/mapeo-desktop/commit/cc59d0eeaced13766482804a44b6593e4fb40568))

## [5.0.0-beta.1](https://github.com/digidem/mapeo-desktop/compare/v5.0.0-beta.0...v5.0.0-beta.1) (2019-11-19)


### Bug Fixes

* scrolling is now possible in sync screen ([259f167](https://github.com/digidem/mapeo-desktop/commit/259f1677945efd463e17413e6939a1cfbb5dca0e))

## [5.0.0-beta.0](https://github.com/digidem/mapeo-desktop/compare/v4.5.2...v5.0.0-beta.0) (2019-11-19)


### ⚠ BREAKING CHANGES

* New sync protocol incompatible with Mapeo Mobile v1 and Desktop v4

### Features

* Add error messages for incompatible mapeo versions ([5947908](https://github.com/digidem/mapeo-desktop/commit/59479083d57d48cfdaa67e3569bda81a3d571448))
* Encrypt sync with projectKey ([5268909](https://github.com/digidem/mapeo-desktop/commit/5268909feceebd5684edbef5f62369905a713cbf))
* Only sync with peers with matching projectKey ([f442fec](https://github.com/digidem/mapeo-desktop/commit/f442fecb58ddc23ff8f27fb5de886dc049b76c27))


### Bug Fixes

* add ES translations for sync errors ([3999e7e](https://github.com/digidem/mapeo-desktop/commit/3999e7eaa98f578bbd7891a6c3ead66bfd97db30))


* New sync protocol incompatible with Mapeo Mobile v1 and Desktop v4 ([e2923a3](https://github.com/digidem/mapeo-desktop/commit/e2923a374b91f1e978854be28be5d5a219957e37))

### [4.5.2](https://github.com/digidem/mapeo-desktop/compare/v4.5.1...v4.5.2) (2019-11-19)


### Bug Fixes

* **Territory:** Fix display of feature properties in LH pane ([25a5193](https://github.com/digidem/mapeo-desktop/commit/25a519388076024c993d3b166bc83654d59a855e))

### [4.5.1](https://github.com/digidem/mapeo-desktop/compare/v4.5.0...v4.5.1) (2019-11-18)


### Bug Fixes

* **MapFilter:** Fix translation of Delete Observation menu item ([8f71205](https://github.com/digidem/mapeo-desktop/commit/8f712058ebc3a000f2e1e73b8f6906ccd20f4b8e))
* Don't force "syncing during close" menu to be on top of other windows ([74c2ac6](https://github.com/digidem/mapeo-desktop/commit/74c2ac6d372bb12ab42b3e177f5566931795a78b))

## [4.5.0](https://github.com/digidem/mapeo-desktop/compare/v4.4.0...v4.5.0) (2019-11-12)


### Features

* Add button to MapEditor for exporting GeoJSON of map data (#254)
* Add support for read-only multi-select fields ([01c0eea](https://github.com/digidem/mapeo-desktop/commit/01c0eeaeeb9dd95bec91acf5b93f310b9638bec4))

## [4.4.0](https://github.com/digidem/mapeo-desktop/compare/v4.3.0...v4.4.0) (2019-11-08)


### Features

* **UI:** Style toolbar in iD Editor to match MapFilter toolbar ([e39509d](https://github.com/digidem/mapeo-desktop/commit/e39509d59de0e64bcfac1103a03c0ac3aab6cbb6))
* 🚀 Export observations to GeoJSON, CSV, Smart CSV with option to include photos ([67b7b81](https://github.com/digidem/mapeo-desktop/commit/67b7b811e9e2155d1a7764ab30cb9ea987fe7e75))
* Add right-click menu for copy/paste text and save/copy image ([4416740](https://github.com/digidem/mapeo-desktop/commit/4416740652a1713a6ce8750a6d9e3605b2dd4679))


### Bug Fixes

* **perf:** Don't show searching animation when sync tab is hidden ([4bbe8e0](https://github.com/digidem/mapeo-desktop/commit/4bbe8e0f5aba1a602a01ab37292ab5c80723571c))
* **UX:** Fix sidebar buttons not working when iD is showing a dialog ([4f477f4](https://github.com/digidem/mapeo-desktop/commit/4f477f4f73154015f58f64d3f01c24a8dfb4efb7))
* Disable form inputs during export saving TODO: Add progress bar ([c2ebc3a](https://github.com/digidem/mapeo-desktop/commit/c2ebc3ae92f7cf023aa3b330cf23e21118479ecf))
* Don't include broken files for missing images in Webmap export ([5ec2554](https://github.com/digidem/mapeo-desktop/commit/5ec2554cca8ff27ce11bb388a9e6e1840ec260c4))
* Save exports with atomic write stream to avoid problems with half-written files ([cb8acee](https://github.com/digidem/mapeo-desktop/commit/cb8acee70f10d15cf87466da9e12e630d4bf32e3))
* Use Windows line-endings in exported text files ([089e774](https://github.com/digidem/mapeo-desktop/commit/089e7748c00e6e480f8b3b0b7d48a56a661b39e7))

## [4.3.0](https://github.com/digidem/mapeo-desktop/compare/v4.2.0...v4.3.0) (2019-10-31)


### Features

* Add ability to delete observations (click 3 vertical-dots icon on Observation Dialog) ([e5879df](https://github.com/digidem/mapeo-desktop/commit/e5879df52f54ccf03712de4ae42ae0a954d8cbe3))
* Add an error boundary to catch errors and show helpful message ([7a1f42f](https://github.com/digidem/mapeo-desktop/commit/7a1f42ff406b75feed69a4c69a05b6970b50d02a))
* Add version number to left-panel ([7887da4](https://github.com/digidem/mapeo-desktop/commit/7887da4a0f68f60a17e092f3e4c89fab37b403a3))


### Bug Fixes

* Avoid crash on close if app has crashed before iD loads ([541d141](https://github.com/digidem/mapeo-desktop/commit/541d14153c96bd8e7105d5300523da762441f925))
* Fix date distance i18n ([b738ec2](https://github.com/digidem/mapeo-desktop/commit/b738ec2e576c0dfebccd8afd35a251c35fc4cc53))
* Fix strange bug causing Map accessToken error, resulting in crash ([7a3a08d](https://github.com/digidem/mapeo-desktop/commit/7a3a08d936fb6a41a59d250ba7a53dc95ded2db4))

## [4.2.0](https://github.com/digidem/mapeo-desktop/compare/v4.1.1...v4.2.0) (2019-10-13)


### Features

* Allow hack to change minEditableZoom in iD ([e925e02](https://github.com/digidem/mapeo-desktop/commit/e925e02))

### [4.1.1](https://github.com/digidem/mapeo-desktop/compare/v4.1.0...v4.1.1) (2019-10-09)


### Bug Fixes

* skip release notes upload - it was breaking release process ([da5cd58](https://github.com/digidem/mapeo-desktop/commit/da5cd58))

## [4.1.0](https://github.com/digidem/mapeo-desktop/compare/v4.1.0-beta.4...v4.1.0) (2019-10-09)


### Bug Fixes

* argh I'll get these build scripts right eventually ([efcc0a3](https://github.com/digidem/mapeo-desktop/commit/efcc0a3))
* cleanup i18n ([335211c](https://github.com/digidem/mapeo-desktop/commit/335211c))
* Fix build error (npm ci) ([0a9834b](https://github.com/digidem/mapeo-desktop/commit/0a9834b))
* Fix cancelling import from File menu causing crash ([60531b3](https://github.com/digidem/mapeo-desktop/commit/60531b3))
* Fix localization of Menu ([348dfeb](https://github.com/digidem/mapeo-desktop/commit/348dfeb))
* Fix map view appearing wrong size on first load ([e485657](https://github.com/digidem/mapeo-desktop/commit/e485657))
* fix package.json scripts to work on Windows ([c876b12](https://github.com/digidem/mapeo-desktop/commit/c876b12))
* include peer deps ([00a1a76](https://github.com/digidem/mapeo-desktop/commit/00a1a76))
* only install dev tools in dev environment ([b9a67e5](https://github.com/digidem/mapeo-desktop/commit/b9a67e5))
* refresh iD editor after sync ([7200e87](https://github.com/digidem/mapeo-desktop/commit/7200e87))
* refresh page after preset import ([33dd768](https://github.com/digidem/mapeo-desktop/commit/33dd768))
* Show sync progress when sync is initiated by other side ([627dc20](https://github.com/digidem/mapeo-desktop/commit/627dc20))
* Show window while waiting for sync to complete ([7435f59](https://github.com/digidem/mapeo-desktop/commit/7435f59))
* update iD to fix build error ([2878139](https://github.com/digidem/mapeo-desktop/commit/2878139))
* update osm-p2p-server to work with Electron v6 ([bf64e07](https://github.com/digidem/mapeo-desktop/commit/bf64e07))
* Zoom to data now works in both MapEditor and Observation views ([fa4bdb0](https://github.com/digidem/mapeo-desktop/commit/fa4bdb0))


### Features

* Add custom presets to iD, support Mapeo syntax for presets ([0bb1d4d](https://github.com/digidem/mapeo-desktop/commit/0bb1d4d))
* add GeoJSON export with choice of filtered or all ([529efec](https://github.com/digidem/mapeo-desktop/commit/529efec))
* Add map export dialog ([5d3ccbd](https://github.com/digidem/mapeo-desktop/commit/5d3ccbd))
* Add react-intl i18n support ([954229a](https://github.com/digidem/mapeo-desktop/commit/954229a))
* Add sync button + storybook ([f47dffb](https://github.com/digidem/mapeo-desktop/commit/f47dffb))
* Add sync tab components ([c1af588](https://github.com/digidem/mapeo-desktop/commit/c1af588))
* Add tabs sidebar UI ([8580f3d](https://github.com/digidem/mapeo-desktop/commit/8580f3d))
* Add translations ([3254bd0](https://github.com/digidem/mapeo-desktop/commit/3254bd0))
* Add translations / i18n ([e87d62b](https://github.com/digidem/mapeo-desktop/commit/e87d62b))
* reload observations after sync ([f09243e](https://github.com/digidem/mapeo-desktop/commit/f09243e))
* Remember window size and position ([cca4bc7](https://github.com/digidem/mapeo-desktop/commit/cca4bc7))
* Show reload menu ([a22e448](https://github.com/digidem/mapeo-desktop/commit/a22e448))
* sync with file ([0a92f4a](https://github.com/digidem/mapeo-desktop/commit/0a92f4a))
* Translations ([a38678c](https://github.com/digidem/mapeo-desktop/commit/a38678c))
* Update Home with persisted state and translations ([16c4d6d](https://github.com/digidem/mapeo-desktop/commit/16c4d6d))
* Upgrade to electron v6 and electron-builder v21 ([c3796db](https://github.com/digidem/mapeo-desktop/commit/c3796db))
* Use electron-log instead of custom solution ([c3e3da0](https://github.com/digidem/mapeo-desktop/commit/c3e3da0))
* Use new MapFitler ([8e008b4](https://github.com/digidem/mapeo-desktop/commit/8e008b4))
* Work with offline maps ([a314abd](https://github.com/digidem/mapeo-desktop/commit/a314abd))

## [4.1.0-beta.4](https://github.com/digidem/mapeo-desktop/compare/v4.1.0-beta.3...v4.1.0-beta.4) (2019-09-17)


### Bug Fixes

* Fix sync error by updating mapeo-server ([e3b44ba](https://github.com/digidem/mapeo-desktop/commit/e3b44ba))

## [4.1.0-beta.3](https://github.com/digidem/mapeo-desktop/compare/v4.1.0-beta.2...v4.1.0-beta.3) (2019-09-17)


### Bug Fixes

* Fix errors with background imagery when using custom backgrounds ([e45278d](https://github.com/digidem/mapeo-desktop/commit/e45278d))
* update to latest iD with fix for slowdown at startup ([14416e9](https://github.com/digidem/mapeo-desktop/commit/14416e9))

## [4.1.0-beta.2](https://github.com/digidem/mapeo-desktop/compare/v4.1.0-beta.1...v4.1.0-beta.2) (2019-09-13)


### Features

* Add Windows Code signing ([7627e7b](https://github.com/digidem/mapeo-desktop/commit/7627e7b))

## [4.1.0-beta.1](https://github.com/digidem/mapeo-desktop/compare/v4.1.0-beta.0...v4.1.0-beta.1) (2019-09-13)

## [4.1.0-beta.0](https://github.com/digidem/mapeo-desktop/compare/v4.0.1-beta...v4.1.0-beta.0) (2019-09-13)


### Bug Fixes

* Fix Windows build
* Fix ability to drag/move window on Mac
* Fix "generando indices" never completing after failed sync
* New Mapeo-Core: only show most recently edited observation if two different people have edited the same observation on different devices
* Latest updates to MapFilter
* Fix import progress

### New Features

* Mac app is signed, no need to right-click to open on first install
* Export ShapeFile from MapEditor

## 4.0.1-beta

### New Features

- **Database upgrade to Kappa**, which brings speed and reliability improvements.
  This also means that your existing data will need to be migrated, which
currently is a manual process. Please see the
[mapeo-migrate](http://github.com/digidem/mapeo-migrate) repository for details
on how to migrate your data.

- **Import from asar files** You can now import `asar` files and `tar` files
  directly. Raw directories are no longer supported from the Import Files menu,
but you can import them in the filesystem under `styles/default/tiles`

- **Sync progress** will now be shown in the Sync screen.

- **Faster Startup** Mapeo should load much faster now.

### Breaking Changes

- Spanish by default.

- Map tiles and aerial imagery now must be referenced from under a `styles`
  directory. If you were using background imagery in 3.x, you will need to
change your URL from `/Offline-Maps/...` to `/styles/Offline-Maps/...`.

- You can override mapfilter styles by importing into the user data folder
  `styles/default`, instead of `styles/mapfilter-style`. This will make feature
parity between mobile and desktop.


- Presets require a namespace now, which is `default`. If you don't see your
  presets from a previous installation, you'll need to re-import the
configuration file from **File->Import configuration**

### Bug Fixes

- Map Filter should work much faster and more reliably now, a number of bug
  fixes were introduced.

### Known Issues

- See the [KNOWN_ISSUES.md](/docs/KNOWN_ISSUES.md) file for the complete set of
  known issues.

## 3.1.1

### Bug Fixes
- Typo: change a misnamed function

## 3.1.0

### New Features
- Users can now override mapfilter styles by importing into the user data folder under `styles/mapfilter-style`

## 3.0.6

### Cleanup
- Remove unused appDmg dependency

## 3.0.5

### New Features
- Zoom to Data is now more accurate: now it zooms to the location with the most data, rather than the middle of the dataset, using a low-resolution node density tilemap

### Bug Fixes
- Update to the lastest Map Filter with latest fixes

## 3.0.4

### Bug Fixes
- Remove electron-devtools-installer

## 3.0.3

### Bug Fixes
- Fix map zooming bug in Map Filter view
- Properly display timestamp of when a point was created
- Update to the lastest Map Filter with latest fixes
## 3.0.2

### Bug fixes

-  Welcome pages are now scrollable and in view when on tiny screens and the
   links are now colors that match the text
-  Syncing while on the MapFilter view no longer refreshes the page when
   finished
-  When closing the sync modal, the page you were on stays the same

## 3.0.1

### Bug fixes

- Fixed a bug where some fields in an observation in the MapFilter view were
  not editable.

## 3.0.0

### Breaking Changes

- The new syncfile format created by Mapeo 3.0.0 is not compatible with older
  versions of Mapeo Desktop.

### New Features

- **Two-way syncronization with Mapeo Mobile.** You can now export and import a file that will syncronize your media, observations, and places between both Desktop and Mobile.
- Switch more easily between the Editor and Filter views with an improved menu

### Bug Fixes

- Images attached to observations in Mapeo mobile will now display in MapFilter
- Errors are handled more gracefully during sync
- Fix print layout in Filter View
- Improve feature handling in Filter View

### Code Improvements

- Implemented a new integration test harness that automates the workflow of
  a user.

## 1.13.1 - 2017-12-02
### Fixed
- GeoJSON export works again

## 1.13.0 - 2017-11-14
### Fixed
- 'Jungle' presets are used instead of Bengal presets when choosing to start a jungle map on 1st launch
### Changed
- Major improvements to 'Zoom to Data' feature

## 1.12.0 - 2017-10-27
## Added
- Added a live `lat, lon` label to the bottom right corner, indicating where in
  the world the view currently is
- Added a 'Go to Lat/Lon' feature in the menu that lets you enter a lat,lon pair
  of numbers and have the map zoom there

## 1.11.3 - 2017-10-20
## Fixed
- Welcome screen fixes & improvements

## 1.11.2 - 2017-10-20
## Fixed
- Welcome screen fixes & improvements

## 1.11.1 - 2017-10-20
## Fixed
- Welcome screen fixes & improvements

## 1.11.0 - 2017-10-20
## Added
- The first time app is loaded, show welcome page with example datasets to pick
  from
- English translation


## 1.10.2 - 2017-08-30
### Fixed
- Fixed broken Windows/Mac builds
- Removed unused development dependencies

## 1.10.1 - 2017-08-30
**BROKEN BUILD**
### Fixed
- Tried to fix broken builds (failed)

## 1.10.0 - 2017-08-30
### Fixed
- GeoJSON export now contains the same data as the visual map display
### Optimized
- 'Regenerating Indexes' only takes ~60% as long as before!

## 1.9.5 - 2017-07-17
### Fixed
- Fixed electron version bundling issue that was causing the Windows installer to crash
- Re-enabled `npm prune` during Windows packaging (results in smaller EXE sizes)
- Fixed Windows builds by forcing Appveyor to use npm@5.2.0

## 1.9.4 - 2017-07-17
**BROKEN BUILD**
### Notes
- Tried to fix build by disabling `npm prune` during Windows packaging

## 1.9.3 - 2017-07-17
**BROKEN BUILD**
### Fixed
- Add missing dependencies

## 1.9.2 - 2017-07-17
**BROKEN BUILD**
### Fixed
- App no longer crashes when a GeoJSON export is performed

## 1.9.1 - 2017-07-14
**BROKEN BUILD**
### Fixed
- Fixed 'unknown entity' errors caused by osm-p2p-server omitting deleted nodes

## 1.9.0 - 2017-07-11
**BROKEN BUILD**
### Added
- Added versioning information to osm-p2p-db indexes
- Added an "indexes generating" dialog when index generation is in progress on
  start-up
### Removed
- Took out old (unused) data migration logic

## 1.8.3 - 2017-07-06
### Fixed
- App no longer crashes when no presets are present

## 1.8.2 - 2017-05-19

## 1.8.1 - 2017-05-17
### Fixed
- Fixed 'Export as GeoJSON..' menu option

## [1.8.0] - 2017-05-06
### Changed
- Removed 255 char restriction on text fields

## [1.7.0] - 2017-04-30
### Added
- Add deforking to GeoJSON export
- Add GeoJSON Export menu item
### Fixed
- Use latest metadata.json for displaying dialogs
- Removed unused dev dep: browserify


## [1.2.3] - 2016-10-30

### Changed
- Use osm-p2p-geojson for export

### Added
- Cloud build scripts for Mac & Windows
- Create DMG installer for Mac

## [1.2.2] - 2016-09-22

### Changed
- Update dep to osm-p2p-server-veta3

## [1.2.0] - 2016-08-17
### Added
- Custom icons

### Changed
- Import settings / configuration from a single file

## 1.1.0 - 2016-08-05

Start of Change Log

[1.8.0]: https://github.com/digidem/mapeo-desktop/compare/v1.7.0...v1.8.0
[1.7.0]: https://github.com/digidem/mapeo-desktop/compare/v1.2.3...v1.7.0
[1.2.3]: https://github.com/digidem/mapeo-desktop/compare/v1.2.2...v1.2.3
[1.2.2]: https://github.com/digidem/mapeo-desktop/compare/v1.2.0...v1.2.2
[1.2.0]: https://github.com/digidem/mapeo-desktop/compare/v1.1.0...v1.2.0
