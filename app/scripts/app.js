/*global define */

define(['crossfilter', 'd3'], function (crossfilter, d3) {
  'use strict';

  function addOncoprint(dataPath, containerName) {
    d3.json(dataPath, function (data) {
      // TODO: add cancer types field to the data

      console.log(data);

      // Constants
      var SVG_HEIGHT = 400,
          SVG_WIDTH = 1200,

          ROW_HEIGHT = 20,
          ROW_LABEL_WIDTH,

          COL_WIDTH = 2,

          LABEL_PADDING = 5,

          CELL_COLOR = d3.scale.category10();

      // Get the barebones set up
      var cancerTypes = {'BLCA':0,'BRCA':1,'COADREAD':2,'GBM':3,'HNSC':4,'KIRC':5,'LAML':6,'LUAD':7,'LUSC':8,'OV':9,'UCEC':10},
          rows = data.table_rows,
          rowKeys = {},
          samples = data.samples,
          // sample = crossfilter(data.samples),
          // sampleGenes = sample.dimension(function(d){ return d.genes; }),
          svg = d3.select(oncoElem).append('svg');

      // Populate rowKeys object
      // Purpose: be able to hash gene row number based on gene name
      for (var i = 1; i < rows.length; i++) {
        rowKeys[rows[i][0]] = i;
      }

      svg.attr('height', SVG_HEIGHT)
          .attr('width', SVG_WIDTH);

      // Add labels
      var tableRowLabels = svg.append('g');

      tableRowLabels.selectAll('text')
        .data(Object.keys(rowKeys))
        .enter()
        .append('text')
          .attr('x', 10)
          .attr('y', function(d) { return rowKeys[d] * ROW_HEIGHT; })
          .style('color', '#ff0000')
          .text(function (d) { return d;});

      // Assign constant its value based on label widths
      ROW_LABEL_WIDTH = tableRowLabels.node().getBBox().width + LABEL_PADDING;//getComputedTextLength();

      // Build matrix, columns first
      var matrixCols = svg.selectAll('g')
        .data(samples)
        .enter()
        .append('g')
          .attr('transform', function(d){
          var moveX = ROW_LABEL_WIDTH + (samples.indexOf(d) * (COL_WIDTH+1));
          return 'translate(' + moveX + ',0)'
        });

      // Add rows to the matrix
      matrixCols.selectAll('rect')
        .data(function(d) { return d.genes})
        .enter()
        .append('rect')
          .attr('class', function(d) { return d.cancer;})
          .attr('height', ROW_HEIGHT)
          .attr('width', COL_WIDTH)
          .attr('y', function(d) { return ROW_HEIGHT * (rowKeys[d.gene]-1);})
          .style('fill', function(d) {
            return CELL_COLOR(cancerTypes[d.cancer])
          });

      // Build table lines
      var matrixLines = svg.append('g')
        .attr('transform', function(d){
          var moveX = ROW_LABEL_WIDTH + (samples.indexOf(d) * (COL_WIDTH+1));
          return 'translate(' + moveX + ',0)'
        });
      matrixLines.selectAll('line')
          .data(Object.keys(rowKeys))
          .enter()
          .append('line')
            .attr('x1', 0)
            .attr('x2', SVG_WIDTH)
            .attr('y1', function(d) { return rowKeys[d] * ROW_HEIGHT; })
            .attr('y2', function(d) { return rowKeys[d] * ROW_HEIGHT; })
            .style('stroke', '#ddd');
    });
  }

  var dataPath = '../data/test_HotNet_4.json',
      oncoElem = '#test_oncoprint';

  d3.select(oncoElem).append('p').text('hello, world.');

  addOncoprint(dataPath, oncoElem);

  return '\'Allo \'Allo!';
});