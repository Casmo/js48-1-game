module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/**\n * @link www.couchfriends.com\n * @license MIT\n */\n'
            },
            build: {
                src: [
                    'src/utils/howler.js', // Load howler before Pixi for loading audio files
                    'src/utils/pixi.js',
                    'src/utils/tween.js',
                    'src/utils/randomcolor.js',
                    'src/utils/astar.js',
                    'src/MS/MS.js',
                    'src/MS/MS.Element.js',
                    'src/MS/Tiles/MS.Tile.js',
                    'src/MS/Creeps/MS.Creep.js',
                    'src/MS/Creeps/MS.CreepBunny.js',
                    'src/MS/Towers/MS.Tower.js',
                    'src/MS/Towers/MS.Potion.js',
                    'src/MS/Towers/MS.PotionPoison.js',
                    'src/MS/Towers/MS.Bullet.js',
                    'src/game.js'
                ],
                dest: 'build/game.js'
            }
        },
        less: {
            production: {
                options: {
                    compress: true,
                    plugins: [
                        new (require('less-plugin-clean-css'))({})
                    ]
                },
                files: {
                    "build/assets/game.css": [
                        'src/assets/game.less'
                    ]
                }
            }
        },
        copy: {
            main: {
                src: ['**', '!*.less', '!*.css'],
                dest: 'build/assets/',
                cwd: 'src/assets/',
                expand: true
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task(s).
    grunt.registerTask('default', ['uglify', 'less', 'copy']);

    grunt.loadNpmTasks('grunt-contrib-less');

    grunt.loadNpmTasks('grunt-contrib-copy');

};