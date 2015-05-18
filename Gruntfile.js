
module.exports = function(grunt) {

grunt.initConfig({
  jshint: {
    all: ['Gruntfile.js', 'lib/**/*.js', 'tests/**/*.js']
  },
  mochaTest: {
    test: {
      src: ['tests/**/*.js']
    }
  },
  watch: {
    scripts: {
      files: ['lib/**/*.js', 'tests/**/*.js'],
      tasks: ['default'],
      options: {
        spawn: false,
      },
    },
  }
});
  
grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-mocha-test');
grunt.loadNpmTasks('grunt-contrib-clean');
grunt.loadNpmTasks('grunt-contrib-watch');
  
grunt.registerTask('test', ['jshint', 'mochaTest']);

};
