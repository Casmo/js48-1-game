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
MS.Coin = function () {

    MS.Element.call(this);

    this.name = 'coin';

    this.texture = [
        'coin-001',
        'coin-002',
        'coin-003',
        'coin-004',
        'coin-005',
        'coin-006',
        'coin-007',
        'coin-008',
        'coin-009'
    ];

    this.animationSpeed = .5;
    this.duration = 750;

};

MS.Coin.prototype = Object.create(MS.Element.prototype);


MS.Coin.prototype.animate = function () {

    this.tween = new TWEEN.Tween(this.object.position);
    var to = {x: [], y: []};
    var random = -75 + (Math.random() * 150);
    to.x.push(this.object.position.y - random);
    to.y.push(this.object.position.y - random);
    var random = -75 + (Math.random() * 150);
    to.x.push(this.object.position.y - random);
    to.y.push(this.object.position.y - random);
    to.x.push(MS.settings.width);
    to.y.push(MS.settings.height);
    var duration = (this.duration + Math.random() * 750);
    this.tween.propTo = to;
    this.tween.interpolation(TWEEN.Interpolation.Bezier);
    this.tween.to(to, duration);
    this.tween.onUpdate(function (p, tween) {
        tween.Element.object.position.x = this.x;
        tween.Element.object.position.y = this.y;
    });
    this.tween.onComplete(function (tween) {
        tween.Element.tween = null; // Is already gone in TWEEN
        MS._resources['sound-coin'].data.play();
        MS.addMoney(1);
        tween.Element.remove();
    });
    this.tween.Element = this;
    this.tween.start();

};