/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Couchfriends
 * www.couchfriends.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
var MS = {
    settings: {
        // Resolution
        width: 1920,
        height: 1080,
        sound: 10, // 0-10 where 0 is off
        music: 10, // 01-10 where 0 is off
        assetsPath: 'assets/',
        debug: false
    },
    _objects: [],
    _stage: {}, // Pixi contrainer for all objects
    _renderer: {}, // Pixi renderer
    _resources: {}, // List with key => asset
    timer: 0,
    loadingBar: {},

    init: function () {

        window.addEventListener('resize', MS._resizeGame, false);
        window.addEventListener('orientationchange', MS._resizeGame, false);

        var renderer = new PIXI.autoDetectRenderer(
            this.settings.width,
            this.settings.height,
            {
                transparent: true
            }
        );
        document.getElementById('gameArea').innerHTML = '';
        renderer.view.id = 'gameCanvas';
        document.getElementById('gameArea').appendChild(renderer.view);
        this._renderer = renderer;
        this._stage = new PIXI.Container();
        PIXI.loader.on('progress', MS.loading);

        // Loader bar
        var loadingBar = new MS.Element();
        loadingBar.z = 100;
        loadingBar.name = 'loading';
        loadingBar.object = new PIXI.Graphics();
        loadingBar.object.beginFill(0xff0000);
        loadingBar.object.drawRect(0, 0, 10, 16);
        loadingBar.object.position = {x: 0, y: 0};
        loadingBar.add();
        this.loadingBar = loadingBar;
        this._resizeGame();
    },

    /**
     * Resize the game depending on the resolution
     * @private
     * @todo make a min width and height
     */
    _resizeGame: function () {

        var gameArea = document.getElementById('gameArea');
        var widthToHeight = 16 / 9;
        var newWidth = window.innerWidth;
        var newHeight = window.innerHeight;
        var newWidthToHeight = newWidth / newHeight;

        if (newWidthToHeight > widthToHeight) {
            newWidth = newHeight * widthToHeight;
            gameArea.style.height = newHeight + 'px';
            gameArea.style.width = newWidth + 'px';
        } else {
            newHeight = newWidth / widthToHeight;
            gameArea.style.width = newWidth + 'px';
            gameArea.style.height = newHeight + 'px';
        }

        gameArea.style.marginTop = -(newHeight / 2) + 'px';
        gameArea.style.marginLeft = -(newWidth / 2) + 'px';

    },

    /**
     * Loads up a list of assets. Calls callback on completion or if no assets
     * are given.
     * @param assets
     * @param callback
     */
    load: function (assets, callback) {

        var loading = false;
        for (var i = 0; i < assets.length; i++) {
            var asset = assets[i];
            asset.options = asset.options || {};
            // Check if asset is already added
            if (this._resources[asset.key] != null) {
                continue;
            }
            loading = true;
            PIXI.loader.add(asset.key, MS.settings.assetsPath + asset.src, asset.options);
        }
        if (loading == false && typeof callback == 'function') {
            return callback();
        }
        PIXI.loader.load(function (loader, resources) {
            // @todo do not override assets but push them in the array
            MS._resources = resources;
            if (typeof callback == 'function') {
                callback();
            }
        });

    },
    /**
     * Callback when an assets is loaded
     * @param loader
     */
    loading: function (loader) {
        var percent = Math.round(loader.progress);
        if (percent >= 100) {
            MS.loadingBar.object.visible = false;
            return;
        }
        MS.loadingBar.object.visible = true;
        var width = MS.settings.width / 100 * percent;
        MS.loadingBar.object.drawRect(0, 0, width, 16);
    },

    update: function (time) {
        this.timer++;
        for (var i = 0; i < this._objects.length; i++) {
            this._objects[i].update(time);
        }
        this._renderer.render(this._stage);
    },

    /**
     * Remove all objects and reset the scene
     */
    reset: function () {
        for (var i = 0; i < this._objects.length; i++) {
            this._objects[i].remove();
        }
    },

    _updateLayers: function () {
        this._stage.children.sort(function (a, b) {
            a.z = a.Element.z || 0;
            b.z = b.Element.z || 0;
            return a.z - b.z
        });
    }

};