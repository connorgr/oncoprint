/*global define */

define(['crossfilter', 'd3'], function (crossfilter, d3) {
  'use strict';

  function addOncoprint(dataPath, containerName) {
    d3.json(dataPath, function (data) {
      // Constants
      var SVG_HEIGHT = 400,
          SVG_WIDTH = 1200,

          ROW_HEIGHT = 20,
          ROW_LABEL_WIDTH,

          COL_WIDTH = 2,

          LABEL_PADDING = 5,

          CELL_COLOR = d3.scale.category10();


      // Build the matrix row lines, and other general-use, overlaid lines
      function buildMatrixLines(svg) {
        // Build matrix lines
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
      }

      // Returns a dictionary of gene names with the corresponding number of
      //   mutations for all samples
      function getGeneMutationFrequency(samples) {
        var rank = {};
        for (var s in samples) {
          var genes = samples[s].genes;
          for (var g in genes) {
            var geneName = genes[g].gene;
            rank[geneName] = geneName in rank ? rank[geneName] + 1 : 1;
          }
        }
        return rank;
      }

      // The oncoprint data needs to be sorted on-load to cluster co-occurring
      //    samples, otherwise the visualization will look too noisy.
      // The sorting happens in the following stages (each in its own function):
      // 1. Rank frequency of genes with the sample mutated.
      // 2. Exclusivity.
      // 3. Cancer type.
      // 4. Mutation type: inactivating SNVs, SNVs, amps, dels.
      // 5. Sample name.
      //
      // samples - samples in format [{genes:['',...], ...},...]
      function sortSamples(samples) {
        function sortOnCancerType(a, b) {
          var aCancer = a.cancer,
              bCancer = b.cancer;

          if (aCancer == bCancer) {
            return sortOnMutationType(a, b);
          } else if (aCancer > bCancer) {
            return 1;
          } else { //(aCancer < bCancer)
            return -1;
          }
        }
        function sortOnExclusivity(a, b) {
          var aMutations = a.genes.length,
              bMutations = b.genes.length;

          if (aMutations == bMutations) {
            return sortOnCancerType(a,b);
          } else if (aMutations < bMutations) {
            return -1;
          } else { // a > b
            return 1;
          }
        }
        function sortOnGeneMutationRank(a, b) {
          var aCancer = a.cancer,
              bCancer = b.cancer,
              aGenes = a.genes.map(function(d){return d.gene}),
              bGenes = b.genes.map(function(d){return d.gene}),
              aRanks = aGenes.map(function(d){return rank.indexOf(d)}),
              bRanks = bGenes.map(function(d){return rank.indexOf(d)}),
              aRank = Math.min.apply(null, aRanks),
              bRank = Math.min.apply(null, bRanks);

          if (aRank == bRank) {
            return sortOnExclusivity(a,b);
          } else if (aRank < bRank) {
            return -1
          } else {
            return 1;
          }
        }
        function sortOnMutationType(a, b) {
          // mutation type is a string, so sort lexicographically
          if (a == b) {
            return sortOnSampleName(a,b);
          } else if (a < b) {
            return -1;
          } else {
            return 1;
          }
        }
        function sortOnSampleName(a, b) {
          // name type is a string, so sort lexicographically
          if (a == b) {
            return 0;
          } else if (a < b) {
            return -1;
          } else {
            return 1;
          }
        }

        samples.sort(sortOnGeneMutationRank);
      } // End sort()

      // Get the barebones set up
      // TODO cancerTypes will ideally be provided by the data JSON
      var cancerTypes = {'BLCA':0,'BRCA':1,'COADREAD':2,'GBM':3,'HNSC':4,
              'KIRC':5,'LAML':6,'LUAD':7,'LUSC':8,'OV':9,'UCEC':10},
          rows = data.table_rows,
          rowKeys = {},
          samples = data.samples,
          // sample = crossfilter(data.samples),
          // sampleGenes = sample.dimension(function(d){ return d.genes; }),
          svg = d3.select(oncoElem).append('svg');

      var geneFreq = getGeneMutationFrequency(samples),
          rank = Object.keys(geneFreq).sort(function(a,b) {
            var freqA = geneFreq[a],
                freqB = geneFreq[b];
            if (freqA > freqB) {
              return -1; // A preceeds B in ordering, and is higher order
            } else if (freqA < freqB) {
              return 1; // B preceeds A in ordering
            } else { // freqA === freqB
              return 0;
            }
          });

      // Populate rowKeys object, calculate rank
      // Purpose: be able to hash gene row number based on gene name
      for (var i = 1; i < rows.length; i++) {
        rowKeys[rows[i][0]] = rank.indexOf(rows[i][0]); // i
      }
      console.log(rowKeys);


      // Process the data
      console.log(data);
      sortSamples(samples);

      svg.attr('height', SVG_HEIGHT)
          .attr('width', SVG_WIDTH);

      // Add row labels (i.e., names of the genes in the dataset)
      var matrixRowLabels = svg.append('g');

      matrixRowLabels.selectAll('text')
        .data(Object.keys(rowKeys))
        .enter()
        .append('text')
          .attr('x', 10)
          .attr('y', function(d) { return rowKeys[d] * ROW_HEIGHT; })
          .style('color', '#ff0000')
          .text(function (d) { return d;});

      // Assign constant its value based on label widths
      ROW_LABEL_WIDTH = matrixRowLabels.node().getBBox().width + LABEL_PADDING;

      // Build matrix, columns first (i.e., build by sample first)
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

      buildMatrixLines(svg);

    });
  }

  var dataPath = '../data/test_HotNet_4.json',
      oncoElem = '#test_oncoprint';

  addOncoprint(dataPath, oncoElem);

  return '\'Allo \'Allo!';
});