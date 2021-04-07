/*modal-windows-start*/
class Modal {
	constructor(options) {
		let defaultOptions = {
			isOpen: () => {},
			isClose: () => {},
		}
		this.options = Object.assign(defaultOptions, options);
		this.modal = document.querySelector('.modal');
		this.speed = false;
		this.animation = false;
		this.isOpen = false;
		this.modalContainer = false;
		this.previousActiveElement = false;
		this.fixBlocks = document.querySelectorAll('.fix-block');
		this.focusElements = [
			'a[href]',
			'input',
			'button',
			'select',
			'textarea',
			'[tabindex]'
		];
		this.events();
	}

	events() {
		if (this.modal) {
			document.addEventListener('click', function(e){
				const clickedElement = e.target.closest('[data-path]');
				if (clickedElement) {
					let target = clickedElement.dataset.path;
					let animation = clickedElement.dataset.animation;
					let speed = clickedElement.dataset.speed;
					this.animation = animation ? animation : 'fade';
					this.speed = speed ? parseInt(speed) : 300;
					this.modalContainer = document.querySelector(`[data-target="${target}"]`);
					this.open();
					return;
				}

				if (e.target.closest('.modal-form__close')) {
					this.close();
					return;
				}
			}.bind(this));

			window.addEventListener('keydown', function(e) {
				if (e.keyCode == 27) {
					if (this.isOpen) {
						this.close();
					}
				}

				if (e.keyCode == 9 && this.isOpen) {
					this.focusCatch(e);
					return;
				}

			}.bind(this));

			this.modal.addEventListener('click', function(e) {
				if (!e.target.classList.contains('modal-form') && !e.target.closest('.modal-form') && this.isOpen) {
					this.close();
				}
			}.bind(this));
		}
	}

	open() {
		this.previousActiveElement = document.activeElement;

		this.modal.style.setProperty('--transition-time', `${this.speed / 1000}s`);
		this.modal.classList.add('is-open');
		this.disableScroll();
		
		this.modalContainer.classList.add('modal-open');
		this.modalContainer.classList.add(this.animation);

		setTimeout(() => {
			this.options.isOpen(this);
			this.modalContainer.classList.add('animate-open');
			this.isOpen = true;
			this.focusTrap();
		}, this.speed);
	}

	close() {
		if (this.modalContainer) {
			this.modalContainer.classList.remove('animate-open');
			this.modalContainer.classList.remove(this.animation);
			this.modal.classList.remove('is-open');
			this.modalContainer.classList.remove('modal-open');

			this.enableScroll();
			this.options.isClose(this);
			this.isOpen = false;
			this.focusTrap();
		}
	}

	focusCatch(e) {
		const focusable = this.modalContainer.querySelectorAll(this.focusElements);
		const focusArray = Array.prototype.slice.call(focusable);
		const focusedIndex = focusArray.indexOf(document.activeElement);

		if (e.shiftKey && focusedIndex === 0) {
			focusArray[focusArray.length - 1].focus();
			e.preventDefault();
		}

		if (!e.shiftKey && focusedIndex === focusArray.length - 1) {
			focusArray[0].focus();
			e.preventDefault();
		}
	}

	focusTrap() {
		const focusable = this.modalContainer.querySelectorAll(this.focusElements);
		if (this.isOpen) {
			focusable[0].focus();
		} else {
			this.previousActiveElement.focus();
		}
	}

	disableScroll() {
		let pagePosition = window.scrollY;
		this.lockPadding();
		document.body.classList.add('disable-scroll');
		document.body.dataset.position = pagePosition;
		document.body.style.top = -pagePosition + 'px';
	}

	enableScroll() {
		let pagePosition = parseInt(document.body.dataset.position, 10);
		this.unlockPadding();
		document.body.style.top = 'auto';
		document.body.classList.remove('disable-scroll');
		window.scroll({ top: pagePosition, left: 0 });
		document.body.removeAttribute('data-position');
	}

	lockPadding() {
		let paddingOffset = window.innerWidth - document.body.offsetWidth + 'px';
		this.fixBlocks.forEach((el) => {
			el.style.paddingRight = paddingOffset;
		});
		document.body.style.paddingRight = paddingOffset;
	}

	unlockPadding() {
		this.fixBlocks.forEach((el) => {
			el.style.paddingRight = '0px';
		});
		document.body.style.paddingRight = '0px';
	}
}

const modal = new Modal({
	isOpen: (modal) => {
		console.log(modal);
		console.log('opened');
	},
	isClose: () => {
		console.log('closed');
	},
});

/*php-mailer-start */

// Отправка данных на сервер
function send(event, php){
	console.log("Отправка запроса");
	event.preventDefault ? event.preventDefault() : event.returnValue = false;
	var req = new XMLHttpRequest();
	req.open('POST', php, true);
	req.onload = function() {
	  if (req.status >= 200 && req.status < 400) {
		json = JSON.parse(this.response); // для internet explorer 11
		  console.log(json);
			
		  // ЗДЕСЬ УКАЗЫВАЕМ ДЕЙСТВИЯ В СЛУЧАЕ УСПЕХА ИЛИ НЕУДАЧИ
		  if (json.result == "success") {
			// Если сообщение отправлено
			console.log("Сообщение отправлено");
			// закрываем окно, удаляем данные из формы, выводим окно об успешной отправке данных
			document.querySelector('.modal').classList.remove('animate-open');
			document.querySelector('.modal').classList.remove('is-open');
			document.querySelector('.modal').classList.remove('modal-open');
			document.querySelector('body').classList.remove('disable-scroll');
			form.reset()
			document.querySelector('body').style.paddingRight = '0px';
			document.querySelector('.success-modal ').classList.add('success-modal_active');
			setTimeout(() => document.querySelector('.success-modal ').classList.remove('success-modal_active'), 3000);
		  } else {
			// Если произошла ошибка
			console.log("Ошибка. Сообщение не отправлено");
		  }
		// Если не удалось связаться с php файлом
		} else {console.log("Ошибка сервера. Номер: "+req.status);
	}}; 

	// Если не удалось отправить запрос. Стоит блок на хостинге
	req.onerror = function() {console.log("Ошибка отправки запроса");};
	req.send(new FormData(event.target));
}

/*php-mailer-end */

/*modal-windows-end */

let disableScroll = function () {
	let paddingOffset = window.innerWidth - document.body.offsetWidth + 'px';
	let pagePosition = window.scrollY;
	fixBlocks.forEach((el) => {
	  el.style.paddingRight = paddingOffset;
	});
	body.style.paddingRight = paddingOffset;
	body.classList.add('disable-scroll');
	body.dataset.position = pagePosition;
	body.style.top = -pagePosition + 'px';
  }
  
  let enableScroll = function () {
	let pagePosition = parseInt(document.body.dataset.position, 10);
	body.style.top = 'auto';
	body.classList.remove('disable-scroll');
	fixBlocks.forEach((el) => {
	  el.style.paddingRight = '0px';
	});
	body.style.paddingRight = '0px';
	window.scroll({ top: pagePosition, left: 0 });
	body.removeAttribute('data-position');
  }

/*wow.js init start */

wow = new WOW(
	{
	boxClass:     'wow',      // default
	animateClass: 'animated', // default
	offset:       500,          // default
	mobile:       false,       // default
	live:         true        // default
}
)
wow.init();

/*wow.js init end */
//# sourceMappingURL=main.js.map
