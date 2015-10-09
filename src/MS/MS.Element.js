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
 * Global object class for all objects in MS. All objects should extend
 * from this object.
 * @constructor
 */
MS.Element = function () {

    /**
     * Name of the object. Used for collision detection.
     * @see this.collisionList
     * @type {string}
     */
    this.name = '';

    /**
     * The scene object
     */
    this.object;

    /**
     * The texture or textures of the element
     * @type {null}|object|array
     */
    this.texture = null;

    /**
     * If this.textures is an array of textures we use this number for animation
     * speed.
     * @type {number}
     */
    this.animationSpeed = 1;

    this.selectable = false;

};

MS.Element.prototype = {

    /**
     * Update the object during the gameloop. Might return false if the update
     * is not allowed.
     *
     * @param time
     *
     * @return {boolean}
     */
    update: function (time) {

        return true;

    },

    /**
     * Initial to create a ingame object like a Pixi Sprite
     */
    init: function() {

        // YAK! Dammit JS.
        // http://stackoverflow.com/a/4775737/4071949
        if (this.texture != null && Object.prototype.toString.call( this.texture ) === '[object Array]') {
            var frames = [];
            for (var i = 0; i < this.texture.length; i++) {
                if (typeof MS._resources[this.texture[i]] == 'undefined') {
                    continue; // Texture not found
                }
                frames.push(MS._resources[this.texture[i]].texture);
            }

            this.object = new PIXI.extras.MovieClip(frames);
            this.object.animationSpeed = this.animationSpeed;
            this.object.anchor.set(.5);
            this.object.play();
        }
        else if (this.texture != null) {
            this.object = new PIXI.Sprite();
            if (typeof MS._resources[this.texture] != 'undefined') {
                this.object.texture = MS._resources[this.texture].texture;
            }
            this.object.anchor.set(.5);
        }

        if (this.selectable == true) {
            this.object.tint = 0xcccccc;
            this.object.interactive = true;
            this.object.on('mousedown', this.select, this);
            this.object.on('touchstart', this.select, this);
        }

    },

    add: function () {
        if (this.object != null) {
            this.object.Element = this;
            MS._stage.addChild(this.object);
        }
        MS._objects.push(this);
        MS._updateLayers();
    },

    /**
     * Callback after object is clicked / pressed
     * @return boolean
     */
    select: function() {
        if (this.selectable == false) {
            return false;
        }
        return true;
    },

    remove: function () {
        if (this.object != null) {
            MS._stage.removeChild(this.object);
        }
        var indexOf = MS._objects.indexOf(this);
        MS._objects.splice(indexOf, 1);
    },

    resize: function() {

    }

};