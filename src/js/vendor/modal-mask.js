/*modal-mask-start */

let selector = document.querySelectorAll('input[type="tel"]');

let im = new Inputmask("+7 (999) 999-99-99");
im.mask(selector);

/*modal-mask-end */