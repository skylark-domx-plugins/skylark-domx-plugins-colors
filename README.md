# Skylark Colorpicker

<!--version-->

[Skylark Colorpicker](https://github.com/farbelous/skylark-ui-colorpicker/) is a modular color picker for html5 application development using skylark.

## Dependences

| Project                                                      | Status | Description                                           |
| ------------------------------------------------------------ | ------ | ----------------------------------------------------- |
| [skylark-langx](https://github.com/skylarklangx/skylark-langx) |        | Javascript language extension library                 |
| [skylark-utils](https://github.com/skylarkutils/skylark-utils) |        | An Universal HTML5 Javascript Library                 |
| [skylark-utils-color](https://github.com/skylarkutils/skylark-utils-color) |        | The dom layout features enhancement for skylark utils |
| [skylark-utils-interact](https://github.com/skylarkutils/skylark-utils-interact) |        | The interact features enhancement for skylark utils   |
| [skylark-ui-swt](https://github.com/skylarkutils/skylark-ui-swt) |        | The skylark standard widget tookit                    |
| [skylark-utils-dom](https://github.com/skylarkutils/skylark-utils-dom) |        | An Universal DOM Utility Library                      |

## Different builds

builds are in the directory dist.

|                      | build                                      | Description              |
| -------------------- | ------------------------------------------ | ------------------------ |
| full                 | skylark-ui-colorpicker-all.js              | included dependences     |
| only                 | skylark-ui-colorpicker.js                  | not included dependences |
| full （development） | uncompressed/skylark-ui-colorpicker-all.js | included dependences     |
| only （development） | uncompressed/skylark-ui-colorpicker.js     | not included dependences |

Please use the "full" version when using this library alone, and use the "only" version when using other skylark libraries.

## Installation

You can get the latest version in many different ways:

- Downloading [a ZIP file from master](https://github.com/skylarkui/skylark-ui-colorpicker/archive/master.zip)
- Cloning using Git: `git clone https://github.com/skylarkui/skylark-ui-colorpicker.git`
- Installing via NPM: `npm install https://github.com/skylarkui/skylark-ui-colorpicker.git#master --save`

## Building 

- Ensure that Node.js is installed.
- Run npm install https://github.com/skylarkjs/skylark-bundle-cli.git -g to ensure sbundle is installed.
- Run npm install to ensure the required dependencies are installed.
- Run npm run build. The builds will be placed in the dist/ directory.

## License

Released under the [MIT](http://opensource.org/licenses/MIT)

