/*global define */
define(['crossfilter', 'd3'], function (crossfilter, d3) {
    'use strict';

    d3.select('#test_oncoprint').append('p').text('hello, world.');

    d3.json('../data/test_HotNet_4.json', function (data) {
      var rows = data.table_rows,
          rowKeys = {},
          sample = crossfilter(data.samples);

      for (var i = 0; i < rows.length; i++) {
        rowKeys[rows[i][0]] = i;
      }
      console.log(sample);
      console.log(rowKeys);
    });

    return '\'Allo \'Allo!';
});