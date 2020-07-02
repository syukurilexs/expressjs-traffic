var fs = require('fs');
var os = require('os');
var db = require('./src/database');
var _option;

function formatBytes(a, b = 2) {
  if (0 === a) return '0 Bytes';
  const c = 0 > b ? 0 : b,
    d = Math.floor(Math.log(a) / Math.log(1024));
  return (
    parseFloat((a / Math.pow(1024, d)).toFixed(c)) +
    ' ' +
    ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'][d]
  );
}

function getNodeInfo() {
  return {
    hostname: os.hostname(),
    freemem: formatBytes(os.freemem()),
    totalmem: formatBytes(os.totalmem()),
  };
}

function getAppInfo() {
  const { heapTotal, heapUsed, rss } = process.memoryUsage();
  return {
    heapTotal: formatBytes(heapTotal),
    heapUsed: formatBytes(heapUsed),
    rss: formatBytes(rss),
  };
}

const apiTraffic = (req, res, next) => {
  /* Get time when app recieve request */
  const requestStart = Date.now();
  let errorMessage = '';

  req.on('error', (error) => {
    errorMessage = error.message;
  });

  res.on('finish', () => {
    /**
     * Extract info from req
     */
    const {
      httpVersion,
      method,
      url,
      hostname,
      query,
      port,
      path,
      socket,
      headers,
    } = req;

    const { remoteAddress, remoteFamily } = socket;

    /**
     * Extract info from response
     */
    const { statusCode, statusMessage } = res;

    const resheaders = res.getHeaders();

    /* Time on respond finish */
    const responseEnd = Date.now();

    const output = JSON.stringify({
      '@timestamp': new Date(requestStart),
      endts: responseEnd,
      startts: requestStart,
      responsetime: responseEnd - requestStart,
      errorMessage,
      httpVersion,
      method,
      remoteAddress,
      remoteFamily,
      hostname,
      url,
      port,
      path,
      http: {
        request: {
          headers,
          query,
          url,
        },
        response: {
          statusCode,
          statusMessage,
          resheaders,
        },
      },
      node: getNodeInfo(),
      app: getAppInfo(),
    });

    if (_option && _option.elasticsearch) {
      db.save(output).then((result, err) => {
        if (err) {
          console.log('error');
        }
        console.log('save to db')
      });
    }
  });

  next();
};

module.exports.forRoot = function (options) {
  db.connect(options);
  _option = options;
  return apiTraffic;
};
