'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
  Concatenates input node files into a single ES6 module that will be
  used as the assets store for the inline strategy.

  Required options:
    idGen
    stripPath
    outputFile

  Optional options:
    annotation

  Examples of input and output:

  Input node:
  ├── alarm.svg
  └── cat.svg

  Output node:
  └── output.js

  output.js can content:
  export default {
    'alarm': { content: '<path>', attrs: { viewBox: '' } },
    'cat': { content: '<path>', attrs: { viewBox: '' } }
  }
*/
var path = require('path');
var _ = require('lodash');
var fp = require('lodash/fp');
var CachingWriter = require('broccoli-caching-writer');

var _require = require('./utils'),
    filePathsOnly = _require.filePathsOnly,
    relativePathFor = _require.relativePathFor,
    makeAssetId = _require.makeAssetId,
    svgDataFor = _require.svgDataFor,
    readFile = _require.readFile,
    saveToFile = _require.saveToFile;

var extractSvgData = fp.pipe(readFile, svgDataFor);

var InlinePacker = function (_CachingWriter) {
  _inherits(InlinePacker, _CachingWriter);

  function InlinePacker(inputNode) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, InlinePacker);

    var _this = _possibleConstructorReturn(this, (InlinePacker.__proto__ || Object.getPrototypeOf(InlinePacker)).call(this, [inputNode], {
      name: 'InlinePacker',
      annotation: options.annotation
    }));

    _this.options = options;
    return _this;
  }

  _createClass(InlinePacker, [{
    key: 'build',
    value: function build() {
      var _options = this.options,
          stripPath = _options.stripPath,
          idGen = _options.idGen,
          outputFile = _options.outputFile;

      var inputPath = this.inputPaths[0];
      var outputFilePath = path.join(this.outputPath, outputFile);

      var toRelativePath = _.partial(relativePathFor, _, inputPath);
      var relativePathToId = _.partial(makeAssetId, _, stripPath, idGen);
      var pathToId = fp.pipe(toRelativePath, relativePathToId);

      fp.pipe(filePathsOnly, fp.map(function (filePath) {
        return [pathToId(filePath), extractSvgData(filePath)];
      }), _.fromPairs, JSON.stringify, function (json) {
        return 'export default ' + json;
      }, saveToFile(outputFilePath))(this.listFiles());
    }
  }]);

  return InlinePacker;
}(CachingWriter);

module.exports = InlinePacker;