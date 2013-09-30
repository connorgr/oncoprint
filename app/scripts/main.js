require.config({
  paths: {
      d3: '../bower_components/d3/d3',
      jquery: '../bower_components/jquery/jquery'
  },
  shim: {
    d3: {
      exports: 'd3'
    }
  }
});

require(['app', 'jquery', 'd3'], function (app, $, d3) {
    'use strict';
    // use app here
    console.log(app);
    console.log('Running jQuery %s', $().jquery);
    console.log('Running d3 %s', d3.version);
});
