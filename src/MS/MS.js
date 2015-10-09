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
        width: 960,
        height: 640,
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
    grid: [], // Complete grid with [x][y] = {open: true|false, Element: {}};
    graph: [], // Graph from grid used for a* calculations
    selectedTile: null, // Current selected Tile
    gridSettings: {
        sizeX: 15,
        sizeY: 9,
        size: 64,
        start: {
            x: 0,
            y: 0
        },
        end: {
            x: 14,
            y: 8
        }
    },
    menuObjects: [],
    // List with key => object
    assets: [
        {
            key: 'tile-basic',
            src: 'tiles/basic.png'
        },
        {
            key: 'creep-basic',
            src: 'creeps/basic.png'
        },
        {
            key: 'creep-bunny',
            src: 'creeps/bunny.png'
        },
        {
            key: 'tower-basic',
            src: 'towers/basic.png'
        },
        {
            key: 'potion-basic',
            src: 'towers/upgrade-potion-basic.png'
        },
        {
            key: 'potion-poison',
            src: 'towers/upgrade-potion-poison.png'
        }
    ],

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
        this.load(this.assets, function () {
            MS.startGame();
        });
        this._resizeGame();
    },

    /**
     * Resize the game depending on the resolution
     * @private
     */
    _resizeGame: function () {

        var gameArea = document.getElementById('gameArea');
        var widthToHeight = MS.settings.width / MS.settings.height;
        var newWidth = window.innerWidth;
        var newHeight = window.innerHeight;
        var newWidthToHeight = newWidth / newHeight;

        if (newWidthToHeight > widthToHeight) {
            newWidth = newHeight * widthToHeight;
        } else {
            newHeight = newWidth / widthToHeight;
        }

        gameArea.style.width = newWidth + 'px';
        gameArea.style.height = newHeight + 'px';

        gameArea.style.marginTop = -(newHeight / 2) + 'px';
        gameArea.style.marginLeft = -(newWidth / 2) + 'px';

    },

    /**
     * Temporary function to start the first level
     * @todo should be using tiled for generating levels
     * @private
     */
    startGame: function () {

        var gridSizeX = this.gridSettings.sizeX;
        var gridSizeY = this.gridSettings.sizeY;
        var gridSize = this.gridSettings.size;
        var halfGridSize = gridSize / 2;
        var start = this.gridSettings.start;
        var end = this.gridSettings.end;

        for (var x = 0; x < gridSizeX; x++) {
            this.grid[x] = [];
            this.graph[x] = [];
            for (var y = 0; y < gridSizeY; y++) {
                var grid = {};
                var Tile = new MS.Tile(x, y);
                var open = true; // Default open
                Tile.init();
                Tile.object.position = {
                    x: halfGridSize + (x * gridSize),
                    y: halfGridSize + (y * gridSize)
                };
                Tile.add();
                grid.open = Tile.open = this.graph[x][y] = open;
                grid.Element = Tile;
                this.grid[x][y] = grid;
            }
        }

        this.grid[start.x][start.y].Element.object.tint = 0x00ff00;
        this.grid[start.x][start.y].Element.selectable = false;
        this.grid[end.x][end.y].Element.object.tint = 0xff0000;
        this.grid[end.x][end.y].Element.selectable = false;

        this.setGraph();

    },

    /**
     * Set graph after building a new tower. See A* documentation
     * @link https://github.com/bgrins/javascript-astar
     */
    setGraph: function() {

        var graph = [];
        for (var x = 0; x < this.gridSettings.sizeX; x++) {
            graph[x] = [];
            for (var y = 0; y < this.gridSettings.sizeY; y++) {
                graph[x][y] = this.grid[x][y].open;
            }
        }

        this.graph = new Graph(graph);

    },

    /**
     * Temporary function to spawn creeps
     */
    spawnCreep: function () {

        var startTile = this.grid[this.gridSettings.start.x][this.gridSettings.start.y].Element;
        var endTile = this.grid[this.gridSettings.end.x][this.gridSettings.end.y].Element;
        var Creep = new MS.CreepBunny();
        Creep.init();
        Creep.object.position = {
            x: startTile.object.position.x,
            y: startTile.object.position.y
        };
        Creep.currentTile = startTile;
        Creep.endTile = endTile;
        Creep.add();
        Creep.calculatePath();
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
        TWEEN.update(time);
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
    },

    /**
     * Show buildmenu for the selected Tile
     * @param Tile
     */
    showBuildMenu: function (Tile) {
        this.selectedTile = Tile;
        var upgrades = [];
        if (Tile.Tower == null) {
            // Can only build a basic tower (table)
            var Table = new MS.Tower();
            Table.selectable = true;
            upgrades.push(Table);
        }
        else {
            // Show upgrades
            if (Tile.Tower.potions.length >= Tile.Tower.potionSpots) {
                return false; // Can't upgrade anymore...
                // @todo show destroy button?
            }
            var Potion = new MS.Potion();
            Potion.selectable = true;
            upgrades.push(Potion);
            var Potion = new MS.PotionPoison();
            Potion.selectable = true;
            upgrades.push(Potion);
            // @todo more here...
        }

        var x = (this.gridSettings.size / 2);
        var y = (this.gridSettings.size / 2) + this.gridSettings.sizeY * this.gridSettings.size;
        for (var i = 0; i < upgrades.length; i++) {
            var upgrade = upgrades[i];
            upgrade.init();
            upgrade.object.position = {
                x: x,
                y: y
            };
            upgrade.add();
            this.menuObjects.push(upgrade);
            x += this.gridSettings.size;
        }
    },

    /**
     * Hide build menu and deselect all elements
     */
    hideBuildMenu: function () {
        for (var x = 0; x < this.grid.length; x++) {
            for (var y = 0; y < this.grid[x].length; y++) {
                var Tile = this.grid[x][y].Element;
                if (Tile.selectable == true) {
                    Tile.object.tint = 0xcccccc;
                    Tile.status = '';
                }
            }
        }
        for (var i = 0; i < this.menuObjects.length; i++) {
            this.menuObjects[i].remove();
        }
        this.menuObjects = [];
        this.selectedTile = null;
    }

};