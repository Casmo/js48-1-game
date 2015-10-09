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
MS.Bullet = function () {

    MS.Element.call(this);

    this.name = 'bullet';

    this.texture = 'tower-basic';

    this.damage = 1;

    this.target = null; // The enemy to shoot at

    this.tween = {};

};

MS.Bullet.prototype = Object.create(MS.Element.prototype);

MS.Bullet.prototype.init = function() {

    MS.Element.prototype.init.call(this);

    this.object = new PIXI.Graphics();
    this.object.beginFill(0xffffff);
    this.object.drawCircle(0,0,5);

};

MS.Bullet.prototype.fire = function(target) {

    if (target != null) {
        this.target = target;
    }

    this.tween = new TWEEN.Tween(this.object.position);
    var to = {x:[],y:[]};
    to.x.push(this.target.object.position.x);
    to.y.push(this.target.object.position.y);
    var duration = 250;
    this.tween.to(to, duration);
    this.tween.onUpdate(function(p, tween) {
        //console.log(tween);
        // @todo update the tween.last to values based on tween.Element.target;
        if (tween.Element.target != null) {
        }
        tween.Element.object.position.x = this.x;
        tween.Element.object.position.y = this.y;
    });
    this.tween.onComplete(function (tween) {
        tween.Element.tween = null; // Is already gone in TWEEN
        tween.Element.remove();
        if (tween.Element.target != null) {
            tween.Element.target.hit(tween.Element.damage);
        }
    });
    this.tween.Element = this;
    this.tween.start();

};