let myMap;
let myGeocoder;
let myPlacemark
let address = $('.contacts__map-wr').data('address');

function init (ymaps) {
    myGeocoder = ymaps.geocode(address);
    myGeocoder.then(
        function(res) {
            myMap = new ymaps.Map("map", {
                center: res.geoObjects.get(0).geometry.getCoordinates(),
                zoom: 16
            });
            myPlacemark = new ymaps.Placemark(res.geoObjects.get(0).geometry.getCoordinates(), { 
                hintContent: 'Пункт выдачи ' + address, 
                balloonContent: 'Пункт выдачи ' + address,
                controls: ['default']
            });
            myMap.geoObjects.add(myPlacemark);
        },
        function(err) {
            console.error(err)
        }
    )
}