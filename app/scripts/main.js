require.config({
  paths: {
      crossfilter: '../bower_components/crossfilter/crossfilter',
      d3: '../bower_components/d3/d3',
      jquery: '../bower_components/jquery/jquery'
  },
  shim: {
    crossfilter: {
      exports: 'crossfilter'
    },
    d3: {
      exports: 'd3'
    }
  }
});

require(['app', 'jquery', 'd3', 'crossfilter'], function (app, $, d3, crossfilter) {
    'use strict';
    // use app here
    console.log(app);
    console.log('Running jQuery %s', $().jquery);
    console.log('Running d3 %s', d3.version);
    console.log('Running CrossFilter %s', crossfilter.version);
});
