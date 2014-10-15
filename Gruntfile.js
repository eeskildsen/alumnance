'use strict';

var proxySnippet = require('grunt-connect-proxy/lib/utils').proxyRequest;

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt); 

  grunt.initConfig({
    yeoman: {
      // configurable paths
      app: require('./bower.json').appPath || 'public',
      dist: 'build'
    },
	clean: {
		dist: {
			src: '<%= yeoman.dist %>'
		}
	},
	concat: {
		css: {
			src: '<%= yeoman.app %>/css/**/*',
			dest: '<%= yeoman.dist %>/css/concat.css'
		},
		js: {
			src: '<%= yeoman.app %>/js/**/*',
			dest: '<%= yeoman.dist %>/js/concat.js'
		},
	},
	min: {
		css: {
			src: '<%= yeoman.app %>/css/**/*',
			dest: '<%= yeoman.dist %>/css/concat.css'
		},
		js: {
			src: '<%= yeoman.app %>/js/**/*',
			dest: '<%= yeoman.dist %>/js/concat.js'
		}
	},
    sync: {
      dist: {
        files: [{
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: '**'
        }]
      }
    },
    watch: {
      options: {
        livereload: 35729
      },
      src: {
        files: [
          '<%= yeoman.app %>/*.html',
          '<%= yeoman.app %>/css/**/*',
          '<%= yeoman.app %>/js/**/*',
          '<%= yeoman.app %>/views/**/*'
        ],
        //tasks: ['sync:dist']
      }
    },
    connect: {
      proxies: [
        {
          context: '/alumnance',
          host: 'localhost',
          port: 8080,
          https: false,
          changeOrigin: false
        }
      ],
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          base: [
            '<%= yeoman.app %>'
          ],
          middleware: function (connect) {
            return [
              proxySnippet,
              connect.static(require('path').resolve('public'))
            ];
          }
        }
      },
      /*
      dist: {
        options: {
          base: '<%= yeoman.dist %>'
        }
      }
      */
    },
    // Put files not handled in other tasks here
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: '**'
        }]
      },
    },
    // Test settings
    karma: {
      unit: {
        configFile: 'test/config/karma.conf.js',
        singleRun: true
      }
    },
    bowercopy: {
      options: {
        destPrefix: '<%= yeoman.app %>'
      },
      test: {
        files: {
          'test/lib/angular-mocks': 'angular-mocks',
          'test/lib/angular-scenario': 'angular-scenario'
        }
      }
    },
	useminPrepare: {
		options: {
			dest: '<%= yeoman.dist %>'
		},
		html: '<%= yeoman.app %>/index.html',
		css: '<%= yeoman.app %>/index.html'
	},
	rev: {
		files: {
			src: [
				'<%= yeoman.dist %>/js/**/*.js',
				'<%= yeoman.dist %>/css/**/*.css'
			]
		}
	}
  });
  
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  
  grunt.registerTask('build', [
	'clean:dist',
	'useminPrepare',
	'concat:generated',
	'cssmin:generated',
	'uglify:generated',
	'copy:dist',
	'rev',
	'usemin',
	'htmlmin'
  ]);

  grunt.registerTask('server', function (target) {
    grunt.task.run([
      //'copy:dist',
      'configureProxies',
      'connect:livereload',
      'watch'
    ]);
  });
  
  grunt.registerTask('default', ['build']);
};
