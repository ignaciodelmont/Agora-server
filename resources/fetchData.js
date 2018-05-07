// WARNING!!!!
// this file creates a data.json file, to make it work you should update the
// 'Cookie' header with your browser's cookie header, otherwise it'll just
// get the first page over and over again... you shall call snippet() function
// several times so you don't overload your ram space


const request = require('request');
const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const $ = require('jquery');
const fs = require('fs');

async function snippet (min, max) {

  for (let j = min; j < max; j++) {
    console.log("Pagina n" + j);
    await request.get({
      'url': 'http://diputados.gov.ar/proyectos/resultados-buscador.html',
      'qs': {pagina: j + 1},
      'method': 'GET',
      'headers': {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        // 'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en,es;q=0.9',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive',
        'Cookie': '_ga=GA1.3.1587256651.1524663275; _gid=GA1.3.618465146.1525527675; JSESSIONID=E1AEDF485079C356B4AEF4AFFFC00B1B',
        'Host': 'diputados.gov.ar',
        'If-Modified-Since': 'Sun, 06 May 2018 14:09:24 GMT',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36'
      }
    }, (error, response, resBody) => {
      // console.log(response);

      // console.log(response.request.url);
      // console.log(response.statusCode);

      var body = new JSDOM(resBody).window;
      var $ = require('jquery')(body);
      body = $('.detalle-proyecto');
      for (var i = 0; i < body.length; i++) {
        var fElements = body[i].getElementsByTagName('span');
        if (fElements[0] != undefined) {
          var startedAt = fElements[0].textContent;
        } else {
          var startedAt = "";
        }
        if (fElements[1] != undefined) {
          var caseFile = fElements[1].textContent;
        } else {
          var caseFile = "";
        }
        if (fElements[2] != undefined) {
          var publishedAt = fElements[2].textContent;
        } else {
          var publishedAt = "";
        }
        if (fElements[3] != undefined) {
          var date = fElements[3].textContent;
        } else {
          var date = "";
        }


        var extract = body[i].getElementsByClassName('dp-texto')[0].textContent;
        if (extract != undefined) {
          extract = extract.toLowerCase();
        } else {
          extract = "";
        }

        if (body[i].getElementsByTagName('a')[0] != undefined) {
          var link = body[i].getElementsByTagName('a')[0].href;
        } else {
          var link = "";
        }

        var projectObj = {
          startedAt,
          caseFile,
          publishedAt,
          date,
          extract,
          link
        }
        fs.appendFile('data.json',JSON.stringify(projectObj, undefined, 2)+',', function (err) {
          if (err) throw err;
        });
      }
    });
  }
  console.log('--------------------------------------------------------------------------------------');
}

snippet(0, 300);
