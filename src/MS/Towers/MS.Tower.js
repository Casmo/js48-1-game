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

/**
 * Each tile is part of a grid.
 * @constructor
 */
MS.Tower = function () {

    MS.Element.call(this);

    this.name = 'tower'; // Actually a table, but hey? Who cares and read this anyways...

    this.texture = 'tower-basic';

    this.potionSpots = 2; // How many potions can you place on this table?
    /**
     * List with potions that fires at creeps
     * @type {Array}
     */
    this.potions = [];

    this.price = 1;

    this.Tile = null;

};

MS.Tower.prototype = Object.create(MS.Element.prototype);

/**
 * Build tower on selected tile
 */
MS.Tower.prototype.select = function() {

    if (!MS.Element.prototype.select.call(this)) {
        return false;
    }

    if (this.price > MS.money) {
        MS.hideBuildMenu();
        return false;
    }
    MS.addMoney(-(this.price));
    // if above checks are true then...
    var grid = MS.setGraph(true);
    grid[MS.selectedTile.x][MS.selectedTile.y] = 0;
    var graph = new Graph(grid);
    var start = graph.grid[MS.gridSettings.start.x][MS.gridSettings.start.y];
    var end = graph.grid[MS.gridSettings.end.x][MS.gridSettings.end.y];
    var path = astar.search(graph, start, end);
    if (path.length <= 0) {
        MS.hideBuildMenu();
        return false;
    }

    // Build table
    var Table = new MS.Tower();
    Table.init();
    Table.object.position = {
        x: MS.selectedTile.object.position.x,
        y: MS.selectedTile.object.position.y
    };
    Table.add();
    Table.Tile = MS.selectedTile;
    MS.selectedTile.Tower = Table;

    // Close grid
    MS.grid[MS.selectedTile.x][MS.selectedTile.y].open = 0;
    MS.setGraph();

    MS.hideBuildMenu();
    return true;

};

MS.Tower.prototype.remove = function() {

    if (this.Tile != null) {
        this.Tile.Tower = null;
        MS.grid[this.Tile.x][this.Tile.y].open = 1;
        MS.setGraph();
    }
    MS.Element.prototype.remove.call(this);

};

MS.Tower.prototype.update = function(time) {

    if (!MS.Element.prototype.update.call(this, time)) {
        return false;
    }

    // Loop through potions and let them shoot
    for (var i = 0; i < this.potions.length; i++) {
        var potion = this.potions[i];
        if (MS.timer < potion.nextShot) {
            return false; // Just shot recently
        }
        potion.nextShot = MS.timer + potion.speed;
        var enemy = MS.findEnemyInRange(this.object.position, potion.range);
        if (enemy != false) {
            var bullet = new MS.Bullet();
            bullet.init();
            bullet.target = enemy;
            bullet.object.position = {
                x: this.Tile.object.position.x,
                y: this.Tile.object.position.y
            };
            bullet.add();
            bullet.fire();
        }
    }

};