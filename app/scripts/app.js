/*global define */
define(['d3'], function (d3) {
    'use strict';

    d3.select('#test_oncoprint').append('p').text('hello, world.');

    d3.json('../data/test_HotNet_4.json', function (data) {
      console.log(data);
    });

    return '\'Allo \'Allo!';
});