"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDBPrebuilt = void 0;
var Debug = require('debug');
var Glob = require("glob").Glob;
var path_1 = require("path");
var os_1 = require("os");
var mongodb_download_1 = require("mongodb-download");
var MongoDBPrebuilt = /** @class */ (function () {
    function MongoDBPrebuilt(mongoDBDownload) {
        this.mongoDBDownload = mongoDBDownload;
        this.debug = Debug('mongodb-prebuilt-MongoDBPrebuilt');
        if (!this.mongoDBDownload || !(this.mongoDBDownload instanceof mongodb_download_1.MongoDBDownload)) {
            var downloadOpts = this.mongoDBDownload || {
                downloadDir: this.getHomeDirectory()
            };
            downloadOpts.downloadDir = downloadOpts.downloadDir || this.getHomeDirectory();
            this.mongoDBDownload = new mongodb_download_1.MongoDBDownload(downloadOpts);
        }
    }
    MongoDBPrebuilt.prototype.getHomeDirectory = function () {
        var homeDir = (0, path_1.resolve)((0, os_1.homedir)(), '.mongodb-prebuilt');
        this.debug("getHomeDirectory(): ".concat(homeDir));
        return homeDir;
    };
    MongoDBPrebuilt.prototype.getBinPath = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.binPath !== undefined) {
                _this.debug("getBinPath() cached: ".concat(_this.binPath));
                return resolve(_this.binPath);
            }
            _this.mongoDBDownload.downloadAndExtract().then(function (extractLocation) {
                _this.resolveBinPath(extractLocation).then(function (binPath) {
                    resolve(binPath);
                }, function (e) {
                    reject(e);
                });
            });
        });
    };
    MongoDBPrebuilt.prototype.resolveBinPath = function (extractLocation) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var binPath = "".concat(extractLocation, "/*/bin");
            var mg = new Glob(binPath, {}, function (err, files) {
                if (err) {
                    _this.debug("resolveBinPath() error ".concat(err));
                    reject(err);
                }
                else {
                    if (_this.hasValidBinPath(files) === true) {
                        var resolvedBinPath = files[0];
                        _this.debug("resolveBinPath(): ".concat(resolvedBinPath));
                        resolve(resolvedBinPath);
                    }
                    else {
                        reject("path not found");
                    }
                }
            });
        });
    };
    MongoDBPrebuilt.prototype.hasValidBinPath = function (files) {
        if (files.length === 1) {
            return true;
        }
        else if (files.length > 1) {
            this.debug("getBinPath() directory corrupted, only one installation per hash can exist");
            return false;
        }
        else {
            this.debug("getBinPath() doesn't exist, files: ".concat(files));
            return false;
        }
    };
    return MongoDBPrebuilt;
}());
exports.MongoDBPrebuilt = MongoDBPrebuilt;
//# sourceMappingURL=../src/mongodb-prebuilt.js.map