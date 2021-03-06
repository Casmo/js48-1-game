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
MS.Potion = function () {

    MS.Element.call(this);

    this.name = 'upgrade';

    this.texture = 'potion-basic';

    this.speed = 50; // Speed of bullets

    this.nextShot = 0;

    this.price = 10;

    this.damage = 1;

    this.range = 128;

    this.duration = 750; // duration of bullet animation

    this.effect = null;

};

MS.Potion.prototype = Object.create(MS.Element.prototype);

/**
 * Build tower on selected tile
 */
MS.Potion.prototype.select = function() {

    if (!MS.Element.prototype.select.call(this)) {
        return false;
    }

    if (this.price > MS.money) {
        MS.hideBuildMenu();
        return false;
    }
    MS.addMoney(-(this.price));

    // Build potion and add to the table
    var Potion = new MS.Potion(); // this;
    for (var property in this) {
        Potion[property] = this[property];
    }
    Potion.selectable = false;
    Potion.init();
    Potion.object.position = {
        x: -18,
        y: -(this.object.height / 2)
    };
    if (MS.selectedTile.Tower.potions.length >= 1) {
        Potion.object.position.x = 18;
    }
    MS.selectedTile.Tower.object.addChild(Potion.object);
    MS.selectedTile.Tower.potions.push(Potion);

    MS.hideBuildMenu();
    return true;

};

/**
 * Update takes place in the tower/table object. This is for the menu...
 * @param time
 * @returns {boolean}
 * @todo might animate this
 */
MS.Potion.prototype.update = function(time) {

    return false;

};