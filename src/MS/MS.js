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
    score: 0,
    lives: 10,
    money: 100,
    pause: false,
    waveSettings: {
        currentWave: 1,
        waveCreeps: 10,
        waveInterval: 250,
        nextSpawn: 1000
    },
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
            key: 'creep-elephant',
            src: 'creeps/elephant.png'
        },
        {
            key: 'creep-giraffe',
            src: 'creeps/giraffe.png'
        },
        {
            key: 'creep-hippo',
            src: 'creeps/hippo.png'
        },
        {
            key: 'creep-monkey',
            src: 'creeps/monkey.png'
        },
        {
            key: 'creep-panda',
            src: 'creeps/panda.png'
        },
        {
            key: 'creep-parrot',
            src: 'creeps/parrot.png'
        },
        {
            key: 'creep-penguin',
            src: 'creeps/penguin.png'
        },
        {
            key: 'creep-pig',
            src: 'creeps/pig.png'
        },
        {
            key: 'creep-snake',
            src: 'creeps/snake.png'
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
        },
        {
            key: 'tower-delete',
            src: 'towers/delete.png'
        },
        // sounds
        {
            key: 'sound-bunny',
            src: 'sounds/effects/bunny.wav'
        },
        {
            key: 'sound-elephant',
            src: 'sounds/effects/elephant.wav'
        },
        {
            key: 'sound-giraffe',
            src: 'sounds/effects/giraffe.wav'
        },
        {
            key: 'sound-hippo',
            src: 'sounds/effects/hippo.wav'
        },
        {
            key: 'sound-monkey',
            src: 'sounds/effects/monkey.wav'
        },
        {
            key: 'sound-panda',
            src: 'sounds/effects/panda.ogg'
        },
        {
            key: 'sound-parrot',
            src: 'sounds/effects/parrot.wav'
        },
        {
            key: 'sound-penguin',
            src: 'sounds/effects/penguin.ogg'
        },
        {
            key: 'sound-pig',
            src: 'sounds/effects/pig.ogg'
        },
        {
            key: 'sound-snake',
            src: 'sounds/effects/snake.wav'
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

        this.reset();
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

        // Set money and lives
        var money = new MS.Element();
        money.money = 0;
        money.init();
        money.object = new PIXI.Text(
            this.money,
            {
                font: 'bold 24px Arial',
                fill: '#007700',
                align: 'right',
                stroke: '#FFFFFF',
                strokeThickness: 3
            }
        );
        money.object.position = {
            x: MS.settings.width,
            y: MS.settings.height
        };
        money.object.anchor.x = 1;
        money.object.anchor.y = 1;
        money.update = function (time) {
            if (this.money < MS.money) {
                this.money++;
            }
            else if (this.money > MS.money) {
                this.money--;
            }
            else {
                return;
            }
            this.object.text = '$ ' + this.money + ',-';
        };
        money.add();

        var life = new MS.Element();
        life.lives = 0;
        life.init();
        life.object = new PIXI.Text(
            this.lives,
            {
                font: 'bold 24px Arial',
                fill: '#779900',
                align: 'right',
                stroke: '#FFFFFF',
                strokeThickness: 3
            }
        );
        life.object.position = {
            x: MS.settings.width,
            y: (MS.settings.height - 32)
        };
        life.object.anchor.x = 1;
        life.object.anchor.y = 1;
        life.update = function (time) {
            if (this.lives < MS.lives) {
                this.lives++;
            }
            else if (this.lives > MS.lives) {
                this.lives--;
            }
            else {
                return;
            }
            var label = 'lives';
            if (this.lives == 1) {
                label = 'life';
            }
            this.object.text = this.lives + ' ' + label;
        };
        life.add();

        var waveCounter = new MS.Element();
        waveCounter.wave = 1;
        waveCounter.init();
        waveCounter.object = new PIXI.Text(
            'wave: ' + this.waveSettings.currentWave,
            {
                font: 'bold 24px Arial',
                fill: '#779900',
                align: 'right',
                stroke: '#FFFFFF',
                strokeThickness: 3
            }
        );
        waveCounter.object.position = {
            x: MS.settings.width - 256,
            y: (MS.settings.height - 32)
        };
        waveCounter.object.anchor.x = 1;
        waveCounter.object.anchor.y = 1;
        waveCounter.update = function (time) {
            if (this.wave < MS.waveSettings.currentWave) {
                this.wave++;
            }
            else if (this.wave > MS.waveSettings.currentWave) {
                this.wave--;
            }
            else {
                return;
            }
            var label = 'wave';
            this.object.text = label +': ' + this.wave;
        };
        waveCounter.add();

        var nextSpawn = new MS.Element();
        nextSpawn.timer = 0;
        nextSpawn.init();
        nextSpawn.object = new PIXI.Text(
            'Next: ' + this.waveSettings.nextSpawn,
            {
                font: 'bold 24px Arial',
                fill: '#007700',
                align: 'right',
                stroke: '#FFFFFF',
                strokeThickness: 3
            }
        );
        nextSpawn.object.position = {
            x: MS.settings.width - 256,
            y: MS.settings.height
        };
        nextSpawn.object.anchor.x = 1;
        nextSpawn.object.anchor.y = 1;
        nextSpawn.update = function (time) {
            this.timer = MS.waveSettings.nextSpawn - MS.timer;
            this.object.text = 'Next: ' + this.timer;
        };
        nextSpawn.add();

    },

    /**
     * Set graph after building a new tower. See A* documentation
     * @link https://github.com/bgrins/javascript-astar
     * @param returnGraph boolean wether to return the grid or set it as final
     */
    setGraph: function (returnGrid) {

        returnGrid = returnGrid || false;
        var grid = [];
        for (var x = 0; x < this.gridSettings.sizeX; x++) {
            grid[x] = [];
            for (var y = 0; y < this.gridSettings.sizeY; y++) {
                grid[x][y] = this.grid[x][y].open;
            }
        }

        if (returnGrid) {
            return grid;
        }
        this.graph = new Graph(grid);

    },

    _waveOptions: [
        {
            texture: 'creep-bunny',
            sound: 'sound-bunny',
            speed: 750,
            baseHp: 5
        },
        {
            texture: 'creep-penguin',
            sound: 'sound-penguin',
            speed: 1000,
            baseHp: 6
        },
        {
            texture: 'creep-pig',
            sound: 'sound-pig',
            speed: 1250,
            baseHp: 7
        },
        {
            texture: 'creep-snake',
            sound: 'sound-snake',
            speed: 750,
            baseHp: 6
        },
        {
            texture: 'creep-monkey',
            sound: 'sound-monkey',
            speed: 850,
            baseHp: 8
        },
        {
            texture: 'creep-panda',
            sound: 'sound-panda',
            speed: 1250,
            baseHp: 10
        },
        {
            texture: 'creep-parrot',
            sound: 'sound-parrot',
            speed: 750,
            baseHp: 5,
            fly: true // @todo
        },
        {
            texture: 'creep-elephant',
            sound: 'sound-elephant',
            speed: 2000,
            baseHp: 15
        },
        {
            texture: 'creep-hippo',
            sound: 'sound-hippo',
            speed: 1500,
            baseHp: 12
        }
    ],
    /**
     * Temporary function to spawn creeps.
     *
     * Not so temporary anymore... Since time is running out.
     */
    spawnCreep: function (wave) {

        var startTile = this.grid[this.gridSettings.start.x][this.gridSettings.start.y].Element;
        var endTile = this.grid[this.gridSettings.end.x][this.gridSettings.end.y].Element;
        var index = wave - 1;
        var Creep = new MS.Creep();
        var CreepInfo = {};
        if (this._waveOptions[index] == null) {
            // Get a random one
            var random = Math.floor(Math.random() * this._waveOptions.length);
            CreepInfo = this._waveOptions[random];
        }
        else {
            // Setup the creep info
            CreepInfo = this._waveOptions[index];
        }
        Creep.hp = CreepInfo.baseHp + (wave * 2);
        Creep.texture = CreepInfo.texture;
        Creep.speed = CreepInfo.speed;
        Creep.money = wave;
        Creep.deadSound = CreepInfo.sound;
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
        this._renderer.render(this._stage);
        if (this.pause == false) {
            this.timer++;
            for (var i = 0; i < this._objects.length; i++) {
                this._objects[i].update(time);
            }
            TWEEN.update(time);

            if (this.timer > this.waveSettings.nextSpawn) {
                // Spawn creep
                this.spawnCreep(this.waveSettings.currentWave);
                this.waveSettings.waveCreeps--;
                this.waveSettings.nextSpawn += this.waveSettings.waveInterval;
                if (this.waveSettings.waveCreeps < 0) {
                    // Next wave
                    this.setNextWave();
                }
            }

        }
    },

    setNextWave: function() {

        this.waveSettings.currentWave++;
        this.waveSettings.nextSpawn += 500;
        this.waveSettings.waveCreeps = 10 + Math.round(this.waveSettings.currentWave * 1.75);
        this.waveSettings.waveInterval = Math.round(250 * (1 / this.waveSettings.currentWave));
        if (this.waveSettings.waveInterval < 50) {
            this.waveSettings.waveInterval = 50;
        }

    },

    /**
     * Pause or continue the game
     * @param pause
     */
    togglePause: function () {

        var pause = true;
        if (this.pause == true) {
            pause = false;
        }
        if (pause == false) {
            TWEEN.play();
        }
        else {
            TWEEN.pause();
        }
        this.pause = pause;

    },

    /**
     * Remove all objects and reset the scene
     */
    reset: function () {
        for (var i = 0; i < this._objects.length; i++) {
            this._objects[i].remove();
        }
        this.timer = 0;
        this.lives = 10;
        this.score = 0;
        this.money = 100;
        this.addMoney(0);
        this.addScore(0);
        this.addLives(0);

        this.waveSettings = {
            currentWave: 1,
            waveCreeps: 10,
            waveInterval: 250,
            nextSpawn: 1000
        };
    },

    addMoney: function (money) {

        this.money += money;

    },

    addScore: function (score) {

        this.score += score;

    },

    addLives: function (lives) {

        this.lives += lives;

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
            if (Tile.Tower.potions.length < Tile.Tower.potionSpots) {
                var Potion = new MS.Potion();
                Potion.selectable = true;
                upgrades.push(Potion);
                var Potion = new MS.PotionPoison();
                Potion.selectable = true;
                upgrades.push(Potion);
                // @todo more here...
            }
            // Show delete
            var deleteButton = new MS.Element;
            deleteButton.texture = 'tower-delete';
            deleteButton.selectable = true;
            deleteButton.towerObject = Tile.Tower;
            deleteButton.select = function () {
                this.towerObject.remove();
                MS.hideBuildMenu();
            };
            upgrades.push(deleteButton);
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
    },

    /**
     * Find an (the first) enemy in range
     * @param pos
     * @param range
     */
    findEnemyInRange: function (pos, range) {

        for (var i = 0; i < this._objects.length; i++) {
            var object = this._objects[i];
            if (object.name != 'creep') {
                continue;
            }
            var targetPos = object.object.position;

            var dx = Math.abs(pos.x - targetPos.x);
            var dy = Math.abs(pos.y - targetPos.y);
            if (dx < range && dy < range) {
                return object;
            }
        }
        return false;

    }

};