const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const SMSru = require('sms_ru');
const cityMap = require('./modules/bd');
const mail = require('./modules/mail');

const app = express();
const cityRouter = express.Router();
const sms = new SMSru('653E4A84-3621-A160-D94E-EB5E2A50200F');

app.set('host', 'localhost');
app.set('port', 5000);
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

let cities = {};
let emptyCity = {
  population: 1000000,
  city: '',
  prepositionalCity: '',
  dativeCity: '',
  state: '',
  dativeState: '',
  accusativeState: '',
  cityEn: '',
  postAddress: '',
  emblem: ''
};

cityMap(function (err, result) {
  cities = result;
});

app.use(express.static('public'));

app.post('/calc', function (req, res) {
  res.sendStatus(200);
  let cityDomainName = req.hostname.replace(/\..*/, '');
  let city = cities.filter(item => item.cityEn.toLowerCase() === cityDomainName)[0];
  let cityUrl = req.headers.referer.split('/').pop();
  let noCity = cities.filter(item => item.cityEn.toLowerCase() === 'stavropol')[0];


  if (!city) {
    city = cities.filter(item => item.cityEn.toLowerCase() === cityUrl)[0];
    if (!city) {
      city = noCity;
    };
  };


  mail.sendMail({
    from: 'zayavki-s-saita26@mail.ru', // разкомментировать перед выгрузкой
    to: 'zayavki-s-saita26@mail.ru',
    subject: 'Заказ таблички из города ' + city.city,
    html: '<span style="margin=0">Размер: ' +
      req.query.size + '</span></br><span style="margin=0">Цвет: ' +
      req.query.color + '</span></br><span style="margin=0">Основа: ' +
      req.query.base + '</span></br><span style="margin=0">Адрес: ' +
      req.query.address + '</span></br><span style="margin=0">Дополнительные опции:</span><span>' +
      req.query.add + '</span></br><span style="margin=0">Количество:' +
      req.query.number + '</span></br><span style="margin=0">Стоимость:' +
      req.query.cost + '</span></br><a href="http://adresnie-tablichki.ru/dist/image/svg/' +
      req.query.form + '.svg">Изображение</a></br><span style="margin=0">Имя: ' +
      req.query.name + '</span></br><span style="margin=0">Телефон: ' +
      req.query.phone + '</span>'
  });
  sms.sms_send({
    to: '79614455665',
    text: 'Имя: ' + req.query.name + ' Телефон: ' + req.query.phone,
    from: '79614455665',
    time: new Date() / 1000 + 60,
    translit: false,
  }, function (e) {
    console.log(e.description);
  });
});

app.post('/callback', function (req, res) {
  res.sendStatus(200);
  let cityDomainName = req.hostname.replace(/\..*/, '');
  let city = cities.filter(item => item.cityEn.toLowerCase() === cityDomainName)[0];
  let cityUrl = req.headers.referer.split('/').pop();
  let noCity = cities.filter(item => item.cityEn.toLowerCase() === 'stavropol')[0];


  if (!city) {
    city = cities.filter(item => item.cityEn.toLowerCase() === cityUrl)[0];
    if (!city) {
      city = noCity;
    };
  };

  mail.sendMail({
    from: 'zayavki-s-saita26@mail.ru', // разкомментировать перед выгрузкой
    to: 'zayavki-s-saita26@mail.ru',
    subject: 'Перезвоните мне, я ' + city.prepositionalCity,
    text: 'Имя: ' + req.body.name + ', телефон: ' + req.body.phone
  });
  sms.sms_send({
    to: '79614455665',
    text: 'Имя: ' + req.body.name + ' Телефон: ' + req.body.phone,
    from: '79614455665',
    time: new Date() / 1000 + 60,
    translit: false,
  }, function (e) {
    console.log(e.description);
  });
});

cityRouter.route('/').get(function (req, res) {
  let cityDomainName = req.hostname.replace(/\..*/, '');
  let city = cities.filter(item => item.cityEn.toLowerCase() === cityDomainName)[0];
  let cityUrlName = req.url.substr(1);
  let noCity = cities.filter(item => item.cityEn.toLowerCase() === 'stavropol')[0];
  emptyCity.postAddress = noCity.postAddress;

  if (!city && req.headers.host != 'adresnie-tablichki.ru') {
    res.render('404');
  } else if (city) {
    let population = parseInt(city.population.replace(/\s/g, ''));
    if (population > 40000) {
      res.render('index', {
        title: 'Home',
        city: city || noCity,
        cities: cities,
      });
    } else {
      res.render('404');
    }
  } else {
    res.render('index', {
      title: 'Home',
      city: emptyCity,
      cities: cities,
    });
  }
});

cityRouter.route('/:cityName').get(function (req, res) {
  let city = cities.filter(item => item.cityEn.toLowerCase() === req.params.cityName)[0];
  let noCity = cities.filter(item => item.cityEn.toLowerCase() === 'stavropol')[0];
  if (req.headers.host == 'adresnie-tablichki.ru' && city) {
    let population = parseInt(city.population.replace(/\s/g, ''));
    if (population > 40000) {
      res.render('index', {
        title: 'Home',
        city: city || noCity,
        cities: cities,
      });
    } else {
      return res.render('404');
    }
  } else {
    res.render('404');
  }

});

// Страницы оплаты

app.get('/oplata', (req, res) => {
  let cityDomainName = req.hostname.replace(/\..*/, '');
  let city = cities.filter(item => item.cityEn.toLowerCase() === cityDomainName)[0];
  let noCity = cities.filter(item => item.cityEn.toLowerCase() === 'stavropol')[0];
  if (city) {
    let population = parseInt(city.population.replace(/\s/g, ''));
    if (population > 40000) {
      res.render('oplata/index.pug', {
        title: 'Pay-online',
        city: city || noCity,
        cities: cities
      });
    } else {
      return res.render('404');
    };

  } else {
    res.render('oplata/index.pug', {
      title: 'Pay-online',
      city: noCity,
      cities: cities
    });
  }

});

// Вложенные страницы

// app.get('/adresnie-znaki-na-dom-s-nomerom', (req, res) => {
//   let cityDomainName = req.hostname.replace(/\..*/, '');
//   let city = cities.filter(item => item.cityEn.toLowerCase() === cityDomainName)[0];
//   let noCity = cities.filter(item => item.cityEn.toLowerCase() === 'stavropol')[0];
//   emptyCity.postAddress = noCity.postAddress;

//   if (city) {
//     let population = parseInt(city.population.replace(/\s/g, ''));
//     if (population > 40000) {
//       res.render('adresnie-znaki-na-dom-s-nomerom/index.pug', {
//         title: 'Home',
//         city: city || noCity,
//         cities: cities
//       });
//     } else {
//       return res.render('404');
//     };
//   } else {
//     res.render('adresnie-znaki-na-dom-s-nomerom/index.pug', {
//       title: 'Home',
//       city: emptyCity,
//       cities: cities
//     });
//   }
// });

// app.get('/adresniy-anshlag-na-dom', (req, res) => {
//   let cityDomainName = req.hostname.replace(/\..*/, '');
//   let city = cities.filter(item => item.cityEn.toLowerCase() === cityDomainName)[0];
//   let noCity = cities.filter(item => item.cityEn.toLowerCase() === 'stavropol')[0];
//   emptyCity.postAddress = noCity.postAddress;

//   if (city) {
//     let population = parseInt(city.population.replace(/\s/g, ''));
//     if (population > 40000) {
//       res.render('adresniy-anshlag-na-dom/index.pug', {
//         title: 'Home',
//         city: city || noCity,
//         cities: cities
//       });
//     } else {
//       return res.render('404');
//     };

//   } else {
//     res.render('adresnie-znaki-na-dom-s-nomerom/index.pug', {
//       title: 'Home',
//       city: emptyCity,
//       cities: cities
//     });
//   }
// });

// app.get('/adresniy-ukazatel-na-dom', (req, res) => {
//   let cityDomainName = req.hostname.replace(/\..*/, '');
//   let city = cities.filter(item => item.cityEn.toLowerCase() === cityDomainName)[0];
//   let noCity = cities.filter(item => item.cityEn.toLowerCase() === 'stavropol')[0];
//   emptyCity.postAddress = noCity.postAddress;

//   if (city) {
//     let population = parseInt(city.population.replace(/\s/g, ''));
//     if (population > 40000) {
//       res.render('adresniy-ukazatel-na-dom/index.pug', {
//         title: 'Home',
//         city: city || noCity,
//         cities: cities
//       });
//     } else {
//       return res.render('404');
//     };

//   } else {
//     res.render('adresnie-znaki-na-dom-s-nomerom/index.pug', {
//       title: 'Home',
//       city: emptyCity,
//       cities: cities
//     });
//   }
// });

// app.get('/adresniy-viveska-na-dom', (req, res) => {
//   let cityDomainName = req.hostname.replace(/\..*/, '');
//   let city = cities.filter(item => item.cityEn.toLowerCase() === cityDomainName)[0];
//   let noCity = cities.filter(item => item.cityEn.toLowerCase() === 'stavropol')[0];
//   emptyCity.postAddress = noCity.postAddress;

//   if (city) {
//     let population = parseInt(city.population.replace(/\s/g, ''));
//     if (population > 40000) {
//       res.render('adresniy-viveska-na-dom/index.pug', {
//         title: 'Home',
//         city: city || noCity,
//         cities: cities
//       });
//     } else {
//       return res.render('404');
//     };

//   } else {
//     res.render('adresnie-znaki-na-dom-s-nomerom/index.pug', {
//       title: 'Home',
//       city: emptyCity,
//       cities: cities
//     });
//   }
// });

// app.get('/tablichki-s-adresom-na-dom', (req, res) => {
//   let cityDomainName = req.hostname.replace(/\..*/, '');
//   let city = cities.filter(item => item.cityEn.toLowerCase() === cityDomainName)[0];
//   let noCity = cities.filter(item => item.cityEn.toLowerCase() === 'stavropol')[0];
//   emptyCity.postAddress = noCity.postAddress;

//   if (city) {
//     let population = parseInt(city.population.replace(/\s/g, ''));
//     if (population > 40000) {
//       res.render('tablichki-s-adresom-na-dom/index.pug', {
//         title: 'Home',
//         city: city || noCity,
//         cities: cities
//       });
//     } else {
//       return res.render('404');
//     };

//   } else {
//     res.render('adresnie-znaki-na-dom-s-nomerom/index.pug', {
//       title: 'Home',
//       city: emptyCity,
//       cities: cities
//     });
//   }
// });

// app.get('/tablichki-s-nazvaniem-ulicy', (req, res) => {
//   let cityDomainName = req.hostname.replace(/\..*/, '');
//   let city = cities.filter(item => item.cityEn.toLowerCase() === cityDomainName)[0];
//   let noCity = cities.filter(item => item.cityEn.toLowerCase() === 'stavropol')[0];
//   emptyCity.postAddress = noCity.postAddress;

//   if (city) {
//     let population = parseInt(city.population.replace(/\s/g, ''));
//     if (population > 40000) {
//       res.render('tablichki-s-nazvaniem-ulicy/index.pug', {
//         title: 'Home',
//         city: city || noCity,
//         cities: cities
//       });
//     } else {
//       return res.render('404');
//     };

//   } else {
//     res.render('adresnie-znaki-na-dom-s-nomerom/index.pug', {
//       title: 'Home',
//       city: emptyCity,
//       cities: cities
//     });
//   }
// });

// app.get('/tablichki-s-nomerom-doma', (req, res) => {
//   let cityDomainName = req.hostname.replace(/\..*/, '');
//   let city = cities.filter(item => item.cityEn.toLowerCase() === cityDomainName)[0];
//   let noCity = cities.filter(item => item.cityEn.toLowerCase() === 'stavropol')[0];
//   emptyCity.postAddress = noCity.postAddress;

//   if (city) {
//     let population = parseInt(city.population.replace(/\s/g, ''));
//     if (population > 40000) {
//       res.render('tablichki-s-nomerom-doma/index.pug', {
//         title: 'Home',
//         city: city || noCity,
//         cities: cities
//       });
//     } else {
//       return res.render('404');
//     };

//   } else {
//     res.render('adresnie-znaki-na-dom-s-nomerom/index.pug', {
//       title: 'Home',
//       city: emptyCity,
//       cities: cities
//     });
//   }
// });

// Главная

app.use('/', cityRouter);
// app.use(function(req, res, next) {
//   res.render('404')
// });

app.get('*', (req, res) => {
  res.render('404')
})

app.listen(app.get('port'), () => {
  console.log('  Press CTRL-C to stop\n');
});