$(document).ready(function () {
    function mask() {
        $("#nameCallback").inputmask("a{1,30}",
            {
                "placeholder": "",
            }
        );
        $("#phoneCallback").inputmask("99999999999",
            {
                "placeholder": "",
            }
        );
    };
    $('.contact__callback').on('click', function () {
        vex.dialog.open({
            message: 'обратный звонок',
            input: [
                '<label for="nameCallback">имя: </label>',
                '<input id="nameCallback" name="name" type="text" placeholder="Имя" required />',
                '<label for="phoneCallback">телефон: </label>',
                '<input id="phoneCallback" name="phone" type="text" placeholder="Телефон" required />'
            ].join(''),
            buttons: [
                $.extend({}, vex.dialog.buttons.YES, { text: 'Перезвоните мне' }),
            ],
            callback: function (data) {
                if (!data) {
                    return
                } else {
                    $.post('/callback?',
                        {
                            'name': data.name,
                            'phone': data.phone
                        })
                };
            }
        });
        mask();
    });

});