# expressjs-traffic
API Traffic Tracking

## How to use

example code

```javascript
const express = require('express');
const app = express();
const port = 3000;
const apiTraffic = require('@syukurilexs/expressjs-traffic')

app.use(
  apiTraffic.forRoot({
    elasticsearch: 'http://elasticsearch-syukur.apps.cp.tmrnd.com.my/',
    elasticsearchIndexPrefix: 'api-test-syukur'
  })
);

app.get('/', (req, res) => res.send('Hello World!!'));
app.get('/haha', (req, res) => {
    res.status(400).send({message: 'error ni boh'});
});

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
```
