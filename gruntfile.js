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
                    'src/utils/randomcolor.js',
                    'src/MS/MS.js',
                    'src/MS/MS.Element.js',
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