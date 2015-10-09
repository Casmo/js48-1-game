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

    /**
     * List with potions that fires at creeps
     * @type {Array}
     */
    this.potions = [];

};

MS.Tower.prototype = Object.create(MS.Element.prototype);

/**
 * Build tower on selected tile
 */
MS.Tower.prototype.select = function() {

    if (!MS.Element.prototype.select.call(this)) {
        return false;
    }

    // @todo check money

    var Table = new MS.Tower();
    Table.init();
    Table.object.position = {
        x: MS.selectedTile.object.position.x,
        y: MS.selectedTile.object.position.y
    };
    Table.add();
    MS.selectedTile.Tower = Table;
    MS.hideBuildMenu();
    return true;

};