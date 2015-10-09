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
MS.Tile = function (x, y) {

    MS.Element.call(this);

    /**
     * The position on the grid
     * @type {*|number}
     */
    this.x = x || 0;
    this.y = y || 0;

    this.name = 'tile';

    this.texture = 'tile-basic';

    this.status = '';
    this.selectable = true;

    /**
     * Can the enemy walk on this tile?
     * @type {boolean}
     */
    this.open = true;

};

MS.Tile.prototype = Object.create(MS.Element.prototype);

MS.Tile.prototype.init = function() {

    MS.Element.prototype.init.call(this);

    if (this.selectable == true) {
        this.object.tint = 0xcccccc;
        this.object.interactive = true;
        this.object.on('mousedown', this.select, this);
        this.object.on('touchstart', this.select, this);
    }

};

/**
 * Select the current tile
 */
MS.Tile.prototype.select = function() {

    if (this.selectable == false) {
        return false;
    }
    MS.hideBuildMenu();
    this.status = 'selected';
    MS.showBuildMenu(this);
    this.object.tint = 0xffffff;

};