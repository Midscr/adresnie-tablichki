$(document).ready(function () {

    var cost = {
        base: 1100,
        composite:  400,
        lamination:  250,
        reflective: 250,
        delivery: 150
    };

    $('.calc__number_enter').on('focus', function () {
        var radio = document.getElementsByName('number');
        for (var index = 0; index < 3; index++) {
            radio[index].checked = false;
        }
    });

    function attachClearNumber() {
        var $number = $('.calc__number_enter');
        var number = $number.val('');
    }

    $('.calc__number > label').on('click', attachClearNumber);

    function attachSvgSwap(item) {
        $('.calc__info_tabl').children().remove();
        $(item).removeClass('svg').addClass('svg_big');
        $('.calc__info_tabl').append(item);
    };

    $('.calc__block_el').on('click', function () {
        $('.calc__block').find('.active').removeClass('active');
        $(this).addClass('active');
        var $svg = $(this).children().clone();
        attachSvgSwap($svg);

    });

    function attachFormHandler() {
        $('form.calc').on('submit', function (event) {
            event.preventDefault();
            $attrForm = $(this).serializeArray()
            var $form = $(this);
            var $popUp = function (array) {
                var $block;
                var color;
                var size;
                var tablForm;
                var result;
                var type;
                $block = $('.popup__form').clone();
                $block.find('.popup__block').addClass('active');
                $block.find('.popup__block_tabl').prepend($('.calc__info_tabl').clone());
                type = $('.calc__label-color').data('name');
                if (type == 'Адресная табличка') {
                    tablForm = $('svg', '.calc__info_tabl').data('tabl');
                } else {
                    tablForm = $('img', '.calc__info_tabl').data('tabl');
                };
                $block.find('.popup__block_tabl-form').val(tablForm);
                size = $block.find('span', '.calc__info_tabl').text();
                $final_cost = $('.cost span').text();
                $block.find('.popup__block_cost').append('<span> ' + $final_cost + '</span><input id="costCalc" name="cost" type="hidden" value="' + $final_cost + '">')
                $block.find('.popup__block_tabl').append('<input id="sizeCalc" name="size" type="hidden" value="' + size + '">')
                $block.find('.popup__block_name').append('<input id="nameCalc" name="name" type="text" placeholder="Имя" required="required">');
                $block.find('.popup__block_phone').append('<input id="phoneCalc" name="phone" type="text" placeholder="Телефон" required="required">');
                $block.find('.popup__block_phone').append('<input id="type" name="type" type="hidden" value="' + type +'">');
                for (var index = 0; index < array.length; index++) {
                    var element = array[index];
                    if (element.name == 'color') {
                        color = $('#' + element.value).data('color');
                        $block.find('.popup__block_color').append('<div class="calc__info_color_el ' + element.value + '"></div><input class=popup__block_' + element.name + ' type="hidden" name="' + element.name + '" value="' + color + '">')
                    } else if (element.name == 'address') {
                        $block.find('.popup__block_address').append('<span>' + element.value + ' </span><input class=popup__block_' + element.name + ' type="hidden" name="' + element.name + '" value="' + element.value + '">')
                    } else if (element.name == 'number') {
                        $block.find('.popup__block_number').append('<span>' + element.value + ' </span><input class=popup__block_' + element.name + ' type="hidden" name="' + element.name + '" value="' + element.value + '">')
                    } else {
                        $block.find('.popup__block_add').append('<p><div class="checkbox"></div><span>' + element.value + '</span></p><input class=popup__block_' + element.name + ' type="hidden" name="' + element.name + '" value="' + element.value + '">');
                    }
                }


                return $block.html()
            };
            var popup = $popUp($attrForm);
            vex.open({
                unsafeContent: popup,
                showCloseButton: true,
                escapeButtonCloses: true,
                overlayClosesOnClick: true,
                afterOpen: function () {
                    maskHandlerCalc();
                    $('form.popup__block').on('submit', function (event) {
                        event.preventDefault();
                        var image = $('.calc__info_tabl').html();
                        $.post('/calc?' + $(this).serialize())
                            .done(function (data) {
                                console.log(data);
                            });
                        vex.closeAll();
                        vex.dialog.alert('Ваша заявка отправлена');
                        $('form.calc')[0].reset();
                    })
                },
            })
        });
    };

    attachFormHandler()

    var $lamination = $('#lamination .calc__add_checkbox');
    var $reflective = $('#reflective .calc__add_checkbox');
    var $courier = $('#courier .calc__add_checkbox');
    var $pvc = $('#pvc .calc__add_checkbox');
    var $aluminium = $('#aluminium .calc__add_checkbox');
    var $number_1 = $('#one .calc__number_radio');
    var $number_2 = $('#two .calc__number_radio');
    var $number_3 = $('#three .calc__number_radio');
    var $number_enter = $('.calc__number_enter');
    
   
    function costHandler ($item) {

        $item.change(function() {
            var $price = cost.base;
            

            if ($lamination.prop('checked')) {
                $price = $price + cost.lamination;
            };
            if ($reflective.prop('checked')) {
                $price = $price + cost.reflective;
            };
            if ($courier.prop('checked')) {
                $('.cost_delivery').remove();
                $('.cost').append('<span class="cost_delivery"> + ' + cost.delivery + ' руб.</span>');
            } else {
                $('.cost_delivery').remove()
            }
            if ($aluminium.prop('checked')) {
                $price = $price + cost.composite;
            };
            if ($pvc.prop('checked')) {
                $price;
            };
            if ($number_1.prop('checked')) {
                $price;
            };
            if ($number_2.prop('checked')) {
                $price = $price * 2 - ($price * 2) * 0.1;
            };
            if ($number_3.prop('checked')) {
                $price = $price * 3 - ($price * 3) * 0.15;
            };
            if ($number_enter.val()) {
                $value = parseInt($number_enter.val());
                if ($value > 3) {
                    $price = $price * $value - ($price * $value) * 0.2;
                } else if ($value == 3) {
                    $price = $price * 3 - ($price * 3) * 0.15;
                } else if ($value == 2) {
                    $price = $price * 2 - ($price * 2) * 0.1;
                }
                
            };
            $('.cost_result').text($price + ' руб.');
        })
    };


    costHandler($lamination);
    costHandler($reflective);
    costHandler($courier);
    costHandler($pvc);
    costHandler($aluminium);
    costHandler($number_1);
    costHandler($number_2);
    costHandler($number_3);
    costHandler($number_enter);

    function maskHandler(input) {
        $('.calc__number_enter').inputmask("99",
            {
                "placeholder": "",
            }
        );

        $("#name").inputmask("a{1,30}",
            {
                "placeholder": "",
            }
        );

        $("#phone").inputmask("99999999999",
            {
                "placeholder": "",
            }
        );

    };

    function maskHandlerCalc() {
        $('#phoneCalc').inputmask("99999999999",
            {
                "placeholder": "",
            }
        );
        $('#nameCalc').inputmask("a{1,30}",
            {
                "placeholder": "",
            }
        );
    }

    maskHandler();
});
