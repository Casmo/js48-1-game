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

    this.hp = 10;

    this.status = 'alive'; // || dead

    this.money = 1;

    this.fly = false;

    this.deadSound = null;

    this.currentTile = {};
    this.endTile = {};
    this.nextTile = {x:0,y:0};
    this.path = [];
    this.tween = null;

    this.isSlowed = false;

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
    var path = [];
    if (this.fly == true && 1==2) {
        // @todo doesnt work, fuck
        path = astar.search(MS.graphOpen, start, end);
    }
    else {
        path = astar.search(MS.graph, start, end);
    }
    if (path.length <= 0) {
        return false;
    }

    this.path = path;
    if (this.tween != null) {
        //this.tween.stop();
    }
    this.tween = new TWEEN.Tween(this.object.position);
    var to = {x:[],y:[],tileX:[], tileY:[]};
    for (var i = 0; i < this.path.length; i++) {
        var Tile = MS.grid[this.path[i].x][this.path[i].y].Element;
        to.x.push(Tile.object.position.x);
        to.y.push(Tile.object.position.y);
        to.tileX.push(this.path[i].x);
        to.tileY.push(this.path[i].y);
    }
    var duration = this.speed * this.path.length;
    this.tween.to(to, duration);
    this.tween.onUpdate(function(p, tween) {
        tween.Element.object.position.x = this.x;
        tween.Element.object.position.y = this.y;
        var x = Math.ceil(this.tileX);
        var y = Math.ceil(this.tileY);
        if (isNaN(x)) {
            x = 0;
        }
        if (isNaN(y)) {
            y = 0;
        }
        if (tween.Element.currentTile.x != x || tween.Element.currentTile.y != y) {
            tween.Element.currentTile = MS.grid[x][y].Element;
        }
    });
    this.tween.onComplete(function (tween) {
        if (tween.Element.status == 'alive') {
            MS.addLives(-1);
        }
        tween.Element.remove();
    });
    this.tween.Element = this;
    this.tween.start();
};

MS.Creep.prototype.update = function(time) {

    if (!MS.Element.prototype.update.call(this, time)) {
        return false;
    }

};

/**
 *
 * @param damage
 * @returns {boolean} wether the creep is dead
 */
MS.Creep.prototype.hit = function (damage, effect) {

    effect = effect || false;
    damage = damage || 1;

    this.hp -= damage;
    if (this.hp < 0 && this.status == 'alive') {
        this.status = 'dead'; // since other objects might have the references
        // @todo effect here
        if (this.deadSound != null) {
            MS._resources[this.deadSound].data.play();
        }
        MS.addMoney(this.money);
        this.remove();
        return true;
    }
    if (effect != false) {
        switch (effect) {
            case 'slow':
                if (this.isSlowed == false) {
                    this.speed *= 1.5;
                    this.object.tint = 0xbbd1ff;
                    this.isSlowed = true;
                    //this.calculatePath();
                }
            break;
            case 'poison':
                // @todo
            break;
        }
    }
    return false;

};
MS.Creep.prototype.add = function () {

    if (this.object != null) {
        this.object.Element = this;
        MS._stage.addChild(this.object);
    }
    MS._objects.push(this);
    MS._updateLayers();

};