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
const domain = 'localhost:5000';
// const domain = 'adresnie-tablichki.ru';
const email = 'zayavki-s-saita26@mail.ru';

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
    from: email,
    to: email,
    subject: 'Заказ из города ' + city.city + ', ' + req.query.type,
    html: '<span style="margin=0">Размер: ' +
      req.query.size + '</span></br><span style="margin=0">Цвет: ' +
      req.query.color + '</span></br><span style="margin=0">Основа: ' +
      req.query.base + '</span></br><span style="margin=0">Адрес: ' +
      req.query.address + '</span></br><span style="margin=0">Дополнительные опции:</span><span>' +
      req.query.add + '</span></br><span style="margin=0">Количество:' +
      req.query.number + '</span></br><span style="margin=0">Стоимость:' +
      req.query.cost + '</span></br><a href="http://adresnie-tablichki.ru/dist/image' +
      req.query.form + '">Изображение</a></br><span style="margin=0">Имя: ' +
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
    from: email,
    to: email,
    subject: 'Перезвоните мне, я ' + city.prepositionalCity + ', хочу заказать ' + req.body.type,
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

  if (!city && req.headers.host != domain) {
    res.render('404');
  } else if (city) {
    let population = parseInt(city.population.replace(/\s/g, ''));
    if (population > 40000) {
      res.render('index', {
        title: 'Home',
        city: city || noCity,
        cities: cities,
        pName: 'Табличка на дом',
        pRating: '4.8',
        pVotes: '247',
        pPrice: '950 руб.'
      });
    } else {
      res.render('404');
    }
  } else {
    res.render('index', {
      title: 'Home',
      city: emptyCity,
      cities: cities,
      pName: 'Табличка на дом',
      pRating: '4.8',
      pVotes: '247',
      pPrice: '950 руб.'
    });
  }
});

cityRouter.route('/:cityName').get(function (req, res) {
  let city = cities.filter(item => item.cityEn.toLowerCase() === req.params.cityName)[0];
  let noCity = cities.filter(item => item.cityEn.toLowerCase() === 'stavropol')[0];
  if (req.headers.host == domain && city) {
    let population = parseInt(city.population.replace(/\s/g, ''));
    if (population > 40000) {
      res.render('index', {
        title: 'Home',
        city: city || noCity,
        cities: cities,
        route: city.cityEn || noCity.cityEn,
        pageName: city.city || noCity.city,
        pName: 'Табличка на дом',
        pRating: '4.8',
        pVotes: '247',
        pPrice: '950 руб.'
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

function fabricInsidePageHandler(opts) {
  return (req, res) => {
    let cityDomainName = req.hostname.replace(/\..*/, '');
    let city = cities.filter(item => item.cityEn.toLowerCase() === cityDomainName)[0];
    let noCity = cities.filter(item => item.cityEn.toLowerCase() === 'stavropol')[0];
    emptyCity.postAddress = noCity.postAddress;

    if (city) {
      let population = parseInt(city.population.replace(/\s/g, ''));
      if (population > 40000) {
        res.render(opts.indexLink, {
          title: 'Home',
          city: city || noCity,
          cities: cities,
          route: opts.route,
          pageName: opts.pageName,
          pName: opts.pName,
          pRating: opts.pRating,
          pVotes: opts.pVotes,
          pPrice: opts.pPrice
        });
      } else {
        return res.render('404');
      };
    } else {
      res.render(opts.indexLink, {
        title: 'Home',
        city: emptyCity,
        cities: cities,
        route: opts.route,
        pageName: opts.pageName,
        pName: opts.pName,
        pRating: opts.pRating,
        pVotes: opts.pVotes,
        pPrice: opts.pPrice
      });
    }
  }
}

const insidePages = [
  { 
    route: '/tablichki-na-kabinet-shkole', 
    indexLink: 'tabl/tablichki-na-kabinet-shkole/index.pug', 
    pageName: 'Таблички на кабинет в школе',
    pName: 'Табличка на кабинет',
    pRating: '4.8',
    pVotes: '231',
    pPrice: '800 руб.'
  },
  { 
    route: '/tablichki-klass-energoeffectivnosti-doma', 
    indexLink: 'tabl/tablichki-klass-energoeffectivnosti-doma/index.pug', 
    pageName: 'Таблички класс энергоэффективности',
    pName: 'Табличка ЖКХ',
    pRating: '4.7',
    pVotes: '258',
    pPrice: '500 руб.'
  },
  { 
    route: '/tablichki-na-dver-kabineta', 
    indexLink: 'tabl/tablichki-na-dver-kabineta/index.pug', 
    pageName: 'Таблички на дверь кабинета',
    pName: 'Офисная табличка',
    pRating: '4.5',
    pVotes: '219',
    pPrice: '800 руб.'
  },
  { 
    route: '/tablichki-na-podezd-s-nomerami-kvartir', 
    indexLink: 'tabl/tablichki-na-podezd-s-nomerami-kvartir/index.pug', 
    pageName: 'Таблички на подъезд',
    pName: 'Табличка ЖКХ',
    pRating: '4.6',
    pVotes: '283',
    pPrice: '500 руб.'
  },
  { 
    route: '/tablichki-s-nomerami-etazhei', 
    indexLink: 'tabl/tablichki-s-nomerami-etazhei/index.pug', 
    pageName: 'Таблички с номерами этажей',
    pName: 'Табличка ЖКХ',
    pRating: '4.8',
    pVotes: '201',
    pPrice: '500 руб.'
  },
  { 
    route: '/tablichki-dlya-ofisa', 
    indexLink: 'tabl/tablichki-dlya-ofisa/index.pug', 
    pageName: 'Таблички для офиса',
    pName: 'Офисная табличка',
    pRating: '4.6',
    pVotes: '266',
    pPrice: '800 руб.'
  },
  { 
    route: '/informatsionnye-stendy-s-karmanami', 
    indexLink: 'stands/informatsionnye-stendy-s-karmanami/index.pug', 
    pageName: 'Информационные стенды',
    pName: 'Информационный стенд',
    pRating: '4.7',
    pVotes: '255',
    pPrice: '1200 руб.'
  },
  { 
    route: '/stendy-dlya-shkoly', 
    indexLink: 'stands/stendy-dlya-shkoly/index.pug', 
    pageName: 'Стенды для школы',
    pName: 'Стенд для школы',
    pRating: '4.9',
    pVotes: '299',
    pPrice: '1200 руб.' 
  },
  { 
    route: '/stendy-dlya-detskogo-sada', 
    indexLink: 'stands/stendy-dlya-detskogo-sada/index.pug',
    pageName: 'Стенды для детского сада',
    pName: 'Стенд для детского сада',
    pRating: '4.7',
    pVotes: '271',
    pPrice: '1200 руб.' 
  },
  { 
    route: '/stend-ohrana-truda', 
    indexLink: 'stands/stend-ohrana-truda/index.pug', 
    pageName: 'Стенды охрана труда',
    pName: 'Стенды охрана труда',
    pRating: '4.5',
    pVotes: '209',
    pPrice: '1200 руб.' 
  },
  { 
    route: '/zakazat-plan-evakuatsii-po-gostu', 
    indexLink: 'plan/zakazat-plan-evakuatsii-po-gostu/index.pug', 
    pageName: 'Планы эвакуации',
    pName: 'План эвакуации',
    pRating: '4.9',
    pVotes: '287',
    pPrice: '2950 руб.'  
  },
  { 
    route: '/sitemap', 
    indexLink: 'sitemap/index.pug', 
    pageName: 'Сайтмап' },
]

insidePages.forEach(page => {
  app.get(page.route, fabricInsidePageHandler( page ));
})

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