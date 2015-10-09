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
 * Basic Element of each creep in the game
 * @constructor
 */
MS.Creep = function () {

    MS.Element.call(this);

    this.name = 'creep';

    this.texture = 'creep-basic';

    this.speed = 1000; // How many MS per tile

    this.hp = 1;

    this.currentTile = {};
    this.endTile = {};
    this.nextTile = {x:0,y:0};
    this.path = [];
    this.tween = {};

};

MS.Creep.prototype = Object.create(MS.Element.prototype);

/**
 * (re) Calculate the path to crawl through the maze based on A*
 */
MS.Creep.prototype.calculatePath = function() {

    if (this.currentTile == null || this.endTile == null) {
        return false;
    }

    var start = MS.graph.grid[this.currentTile.x][this.currentTile.y];
    var end = MS.graph.grid[this.endTile.x][this.endTile.y];
    this.path = astar.search(MS.graph, start, end);
    if (this.path.length <= 0) {
        return false;
    }

    this.tween = new TWEEN.Tween(this.object.position);
    var to = {x:[],y:[]};
    for (var i = 0; i < this.path.length; i++) {
        var Tile = MS.grid[this.path[i].x][this.path[i].y].Element;
        to.x.push(Tile.object.position.x);
        to.y.push(Tile.object.position.y);
    }
    var duration = this.speed * this.path.length;
    this.tween.to(to, duration);
    this.tween.onUpdate(function(p, tween) {
        tween.Element.object.position.x = this.x;
        tween.Element.object.position.y = this.y;
    });
    this.tween.onComplete(function (tween) {
        tween.Element.tween = null; // Is already gone in TWEEN
        tween.Element.remove();
    });
    this.tween.Element = this;
    this.tween.start();
};

MS.Creep.prototype.update = function(time) {

    if (!MS.Element.prototype.update.call(this. time) || this.nextTile == null) {
        return false;
    }

};

MS.Creep.prototype.hit = function (damage) {

    console.log('creep hit with ' + damage + ' damage');

};