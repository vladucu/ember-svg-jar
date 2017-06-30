'use strict';

var fs = require('fs');
var mkdirp = require('mkdirp');
var cheerio = require('cheerio');
var path = require('path');
var _ = require('lodash');
var fp = require('lodash/fp');

function ensurePosix(filePath) {
  return path.sep !== '/' ? filePath.split(path.sep).join('/') : filePath;
}

function stripExtension(filePath) {
  return filePath.replace(/\.[^/.]+$/, '');
}

function makeAssetId(relativePath, stripDirs, idGen) {
  return fp.pipe(ensurePosix, function (idGenPath) {
    return stripDirs ? path.basename(idGenPath) : idGenPath;
  }, stripExtension, idGen)(relativePath);
}

function filePathsOnly(paths) {
  return _.uniq(paths).filter(function (filePath) {
    var isDirectory = filePath.charAt(filePath.length - 1) === path.sep;
    return !isDirectory;
  });
}

function relativePathFor(filePath, inputPath) {
  return filePath.replace('' + inputPath + path.sep, '');
}

function svgDataFor(svgContent) {
  var $svg = cheerio.load(svgContent, { xmlMode: true })('svg');

  return {
    content: $svg.html(),
    attrs: $svg.attr()
  };
}

var readFile = _.partial(fs.readFileSync, _, 'UTF-8');

var saveToFile = _.curry(function (filePath, data) {
  mkdirp.sync(path.dirname(filePath));
  fs.writeFileSync(filePath, data);
});

module.exports = {
  makeAssetId: makeAssetId,
  filePathsOnly: filePathsOnly,
  relativePathFor: relativePathFor,
  svgDataFor: svgDataFor,
  readFile: readFile,
  saveToFile: saveToFile
};