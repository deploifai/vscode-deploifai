# Changelog

## [v0.1.2](https://github.com/deploifai/vscode-deploifai/tree/v0.1.2) (2023-09-18)

[Full Changelog](https://github.com/deploifai/vscode-deploifai/compare/v0.1.1...v0.1.2)

**Fixed bugs:**

- ssh connection doesn't seem to work on windows vscode [\#8](https://github.com/deploifai/vscode-deploifai/issues/8)
- fix critical problems with the extension [\#25](https://github.com/deploifai/vscode-deploifai/pull/25) ([98sean98](https://github.com/98sean98))




## [v0.1.1](https://github.com/deploifai/vscode-deploifai/tree/v0.1.1) (2023-09-15)

[Full Changelog](https://github.com/deploifai/vscode-deploifai/compare/v0.1.0...v0.1.1)

**Implemented enhancements:**

- create welcome content when user is not logged in [\#20](https://github.com/deploifai/vscode-deploifai/issues/20)
- add a refresh button to refresh project tree view in `view/title` [\#19](https://github.com/deploifai/vscode-deploifai/issues/19)
- start/stop a server from the extension [\#11](https://github.com/deploifai/vscode-deploifai/issues/11)
- add welcome contents to projects TreeView [\#24](https://github.com/deploifai/vscode-deploifai/pull/24) ([98sean98](https://github.com/98sean98))
- implement start and stop action buttons for each training server [\#23](https://github.com/deploifai/vscode-deploifai/pull/23) ([98sean98](https://github.com/98sean98))
- add refresh button in view/title to refresh current workspace's projects [\#22](https://github.com/deploifai/vscode-deploifai/pull/22) ([98sean98](https://github.com/98sean98))

**Fixed bugs:**

- vscode extension not working properly [\#12](https://github.com/deploifai/vscode-deploifai/issues/12)
- The servers list has no indication of server's status [\#10](https://github.com/deploifai/vscode-deploifai/issues/10)
- add indication to server status, and only allow open remote connection command for running servers [\#21](https://github.com/deploifai/vscode-deploifai/pull/21) ([98sean98](https://github.com/98sean98))




## [v0.1.0](https://github.com/deploifai/vscode-deploifai/tree/v0.1.0) (2023-09-12)

[Full Changelog](https://github.com/deploifai/vscode-deploifai/compare/v0.0.9...v0.1.0)

**Implemented enhancements:**

- add graphql-codegen to generate typescript bindings for graphql queries and mutation [\#17](https://github.com/deploifai/vscode-deploifai/issues/17)
- add graphql-codegen to generate typescript bindings [\#18](https://github.com/deploifai/vscode-deploifai/pull/18) ([98sean98](https://github.com/98sean98))

**Fixed bugs:**

- remove the need to input `username` when logging in [\#13](https://github.com/deploifai/vscode-deploifai/issues/13)
- upgrade dependencies and fix readme [\#16](https://github.com/deploifai/vscode-deploifai/pull/16) ([98sean98](https://github.com/98sean98))
- migrate login functionality [\#15](https://github.com/deploifai/vscode-deploifai/pull/15) ([98sean98](https://github.com/98sean98))

**Closed issues:**

- upgrade dependencies [\#14](https://github.com/deploifai/vscode-deploifai/issues/14)




## [v0.0.9](https://github.com/deploifai/vscode-deploifai/tree/v0.0.9) (2023-06-25)

[Full Changelog](https://github.com/deploifai/vscode-deploifai/compare/v0.0.8...v0.0.9)

**Fixed bugs:**

- The ssh config needs to have a endline at the start and end of appending [\#7](https://github.com/deploifai/vscode-deploifai/issues/7)

**Closed issues:**

- add an open source license [\#5](https://github.com/deploifai/vscode-deploifai/issues/5)

**Merged pull requests:**

- Fix issues with SSH configurations on POSIX systems [\#9](https://github.com/deploifai/vscode-deploifai/pull/9) ([utkarsh867](https://github.com/utkarsh867))
- Create LICENSE [\#6](https://github.com/deploifai/vscode-deploifai/pull/6) ([utkarsh867](https://github.com/utkarsh867))




## [v0.0.8](https://github.com/deploifai/vscode-deploifai/tree/v0.0.8) (2022-10-14)

[Full Changelog](https://github.com/deploifai/vscode-deploifai/compare/v0.0.7...v0.0.8)

**Fixed bugs:**

- BUGFIX: Set context values for login status [\#4](https://github.com/deploifai/vscode-deploifai/pull/4) ([utkarsh867](https://github.com/utkarsh867))




## [v0.0.7](https://github.com/deploifai/vscode-deploifai/tree/v0.0.7) (2022-10-06)

[Full Changelog](https://github.com/deploifai/vscode-deploifai/compare/v0.0.6...v0.0.7)

**Fixed bugs:**

- `keyring` crashes on Ubuntu with segmentation fault [\#2](https://github.com/deploifai/vscode-deploifai/issues/2)

**Merged pull requests:**

- Refactor to use contexts, solve Ubuntu crashes [\#3](https://github.com/deploifai/vscode-deploifai/pull/3) ([utkarsh867](https://github.com/utkarsh867))




## [v0.0.6](https://github.com/deploifai/vscode-deploifai/tree/v0.0.6) (2022-09-26)

[Full Changelog](https://github.com/deploifai/vscode-deploifai/compare/v0.0.2...v0.0.6)

**Implemented enhancements:**

- create cicd to publish releases [\#1](https://github.com/deploifai/vscode-deploifai/pull/1) ([98sean98](https://github.com/98sean98))




## [0.0.2] - 2022 - 09 - 20

### Added

- Bug fix where the personal workspace would not show as a part of the workspace selection.
- Bug fix where the SSL keys did not have the right permissions. Oops.

## [0.0.1] - 2022 - 09 - 16

### Added

- The very first version of the Deploifai VSCode extension
- Connection to training servers directly in VSCode.
