'use strict';

const { Client } = require('@elastic/elasticsearch');

var client;
var elasticsearchIndexPrefix = 'api-syukur';

exports.connect = function (options) {
  client = new Client({ node: options.elasticsearch });

  // Set prefix
  elasticsearchIndexPrefix = options.elasticsearchIndexPrefix;
}

exports.save = async function (input) {
  try {
    await client.index({
      index: elasticsearchIndexPrefix + formatDate(),
      body: input,
    });
  } catch (error) {
    console.error('Failed to write to db', error);
  }
};

function formatDate() {
  var d = new Date(),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('.');
}
