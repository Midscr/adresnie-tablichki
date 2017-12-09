$(document).ready(function () {
    var $page = $('html, body');
    $('.menu__item').click(function () {
        $page.animate({
            scrollTop: $($(this).children().attr('href')).offset().top
        }, 400);
        return false;
    });
    (function () {

        "use strict";

        var toggle = $(".cmn-toggle-switch");
        toggleHandler(toggle);

        function toggleHandler(toggle) {
            toggle.on("click", function (e) {
                e.preventDefault();
                (this.classList.contains("active") === true) ? this.classList.remove("active") : this.classList.add("active");
            });
        }

    })();
});