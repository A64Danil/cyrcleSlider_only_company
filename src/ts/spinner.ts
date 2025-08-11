import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css/bundle';

import { createElem } from './helpers';

import { SpinnerPoint, SwiperSlide } from './types/spinnerTypes';

export class SpinningPoints {
  private mainContainer: HTMLElement | null;
  private spinner: HTMLElement | null;
  private spinnerController: HTMLElement | null;
  private spinnerCounter: HTMLElement | null;
  private spinnerCounterNumber: HTMLElement | null | undefined;
  private points: SpinnerPoint[];
  private elements: Array<HTMLElement> = [];
  private buttons: {
    next: HTMLElement | null;
    prev: HTMLElement | null;
  };
  private titles: {
    mobile: {
      first: HTMLElement | null;
      second: HTMLElement | null;
    };
    desktop: {
      first: HTMLElement | null;
      second: HTMLElement | null;
    };
  };
  private totalElements = 0;
  private stepSize = 0;
  private currentStep = 1;
  private progress = 0;
  private activePoint: HTMLElement | null = null;
  private isSpinning = false;
  private spinningSpeed = 650;
  private swiper: Swiper | null = null;
  private swiperWrapper: HTMLElement | null = null;
  private swiperSliderWrapper: HTMLElement | null = null;

  constructor({
    containerSelector,
    swiperContainerSelector,
    startPosition = 1,
    speed = 650,
    points,
  }: {
    containerSelector: string;
    swiperContainerSelector: string;
    startPosition?: number;
    speed?: number;
    points: SpinnerPoint[];
  }) {
    const required = { containerSelector, swiperContainerSelector, points };
    this.validateParams(required);

    this.mainContainer = document.querySelector(containerSelector);
    if (this.mainContainer === null)
      throw new Error('Spinner container not found');

    this.swiperWrapper = document.querySelector(swiperContainerSelector);
    if (this.swiperWrapper === null)
      throw new Error('Swiper wrapper not found');

    this.spinner = this.mainContainer.querySelector('.spinner');
    this.spinnerController =
      this.mainContainer.querySelector('.spinnerControl');
    this.spinnerCounter = this.mainContainer.querySelector('.spinnerCounter');

    if (this.spinnerController === null)
      throw new Error('Spinner controller not found');
    this.buttons = {
      prev: this.spinnerController.querySelector('.spinnerBtn_prev'),
      next: this.spinnerController.querySelector('.spinnerBtn_next'),
    };

    this.titles = {
      mobile: {
        first: this.mainContainer.querySelector(
          '.spinnerDoubleTitle_mob .spinnerTitle_first'
        ),
        second: this.mainContainer.querySelector(
          '.spinnerDoubleTitle_mob .spinnerTitle_second'
        ),
      },
      desktop: {
        first: this.mainContainer.querySelector(
          '.spinnerDoubleTitle_desk .spinnerTitle_first'
        ),
        second: this.mainContainer.querySelector(
          '.spinnerDoubleTitle_desk .spinnerTitle_second'
        ),
      },
    };

    this.spinnerCounterNumber = this.spinnerCounter?.querySelector(
      '.spinnerCounter__number_current'
    );

    this.points = points;
    this.totalElements = this.points.length;
    this.stepSize = (1 / this.totalElements) * 100;

    this.spinningSpeed = speed;

    this.currentStep = startPosition;

    this.init();
  }

  private init(): void {
    if (!this.spinner) {
      console.warn('Circle container not found');
      return;
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.createPoints();
        this.startSwiper();
        this.updateDoubleTitle();
        this.updateCircle();
        this.placePointsOnCircle();
        this.bindEvents();
      });
    } else {
      this.createPoints();
      this.startSwiper();
      this.updateDoubleTitle();
      this.updateCircle();
      this.placePointsOnCircle();
      this.bindEvents();
    }
  }

  private placePointsOnCircle(): void {
    if (!this.spinner) return;

    this.spinner.style.setProperty(
      '--initialOffset',
      this.getOffsetByChildrenLength(this.totalElements)
    );
    const speed = this.spinningSpeed / 1000 + 's';
    this.spinner.style.setProperty('--speed', speed);

    this.elements.forEach((element, index) => {
      const position = (index / this.totalElements) * 100;
      element.style.setProperty('--start', position + '%');
    });
  }

  private getOffsetByChildrenLength(length: number): string {
    switch (length) {
      case 2:
      case 3:
      case 4:
        return '25%';
      case 5:
        return '5%'; // Если хочешь это использовать
      case 6:
        return '16.6%';
      default:
        return '0%'; // Значение по умолчанию
    }
  }

  private moveCircle = (event: Event): void => {
    const target = event.target as HTMLElement;

    if (target === this.buttons.next) {
      this.rotateClockwise();
    } else if (target === this.buttons.prev) {
      this.rotateCounterClockwise();
    }
    this.updateCircle();
    this.isSpinning = false;
  };

  private moveCircleByPoint = (e: MouseEvent): void => {
    const currentTarget = e.currentTarget as HTMLElement;
    this.currentStep = Number(currentTarget.dataset.position);
    this.isSpinning = true;
    this.updateSwiper();
    this.updateDoubleTitle();
    this.updateCircle();
    this.isSpinning = false;
  };

  private updateCircle(): void {
    this.setActivePoint();
    this.setProgress();
    this.setHtmlCounter();
    this.setBtnsState();
  }

  public updateSwiper(): void {
    if (this.swiperWrapper === null) return;

    const tempHeight = this.swiperWrapper.offsetHeight;
    this.swiperWrapper.style.minHeight = tempHeight + 'px';
    this.swiperWrapper.classList.remove('swiper-mainWrapper_show');

    setTimeout(() => {
      if (!this.swiper || this.swiperWrapper === null) return;
      this.swiperWrapper.dataset.theme = this.points[this.currentStep - 1].name;
      this.swiper.slideTo(0, 0);
      this.updateSwiperSlides();

      this.swiperWrapper.classList.add('swiper-mainWrapper_show');
    }, this.spinningSpeed);
  }

  private setActivePoint(): void {
    if (!this.spinner) return;
    if (this.isSpinning && this.activePoint) {
      this.activePoint.classList.remove('spinnerPoint_active');
      this.activePoint.classList.remove('spinnerPoint_onPlace');
    }
    this.activePoint = this.spinner.children[
      this.currentStep - 1
    ] as HTMLElement;
    this.activePoint.classList.add('spinnerPoint_active');
    setTimeout(() => {
      this.activePoint?.classList.add('spinnerPoint_onPlace');
    }, this.spinningSpeed);
  }

  private setHtmlCounter() {
    if (this.spinnerCounterNumber) {
      this.spinnerCounterNumber.textContent = this.currentStep
        .toString()
        .padStart(2, '0');
    }
  }

  private bindEvents(): void {
    if (!this.spinnerController) return;
    this.spinnerController.addEventListener('click', this.moveCircle);
    this.elements.forEach((element) => {
      element.addEventListener('click', this.moveCircleByPoint);
    });
  }

  private rotateClockwise(): void {
    if (this.currentStep < this.totalElements) {
      this.currentStep++;
      this.isSpinning = true;
      this.updateSwiper();
      this.updateDoubleTitle();
    } else {
      this.showProgressLimit('end');
    }
  }

  private rotateCounterClockwise(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.isSpinning = true;
      this.updateSwiper();
      this.updateDoubleTitle();
    } else {
      this.showProgressLimit('start');
    }
  }

  private setProgress(forcedValue?: number): void {
    let progress;
    if (forcedValue) {
      progress = forcedValue;
    } else {
      this.progress = (this.currentStep - 1) * this.stepSize * -1;
      progress = this.progress;
    }
    this.spinner?.style.setProperty('--progress', progress + '%');
  }

  private showProgressLimit(dir: 'start' | 'end') {
    this.spinner?.classList.add('spinner_fastAnimation');
    const [forward, backward] = dir === 'start' ? [3, -1] : [-3, 1];
    const offsetList = [this.progress + forward, this.progress + backward];
    this.setDelayedProgress(offsetList[0]);
    this.setDelayedProgress(offsetList[1], 200);
    this.setDelayedProgress(0, 400);
    setTimeout(() => {
      this.spinner?.classList.remove('spinner_fastAnimation');
    }, 600);
  }

  private setDelayedProgress(progress = 0, delay = 0): void {
    setTimeout(() => {
      this.setProgress(progress);
    }, delay);
  }

  private setBtnsState(): void {
    if (this.currentStep === 1) {
      this.buttons.prev?.classList.add('spinnerBtn_disabled');
    } else {
      this.buttons.prev?.classList.remove('spinnerBtn_disabled');
    }

    if (this.currentStep === this.totalElements) {
      this.buttons.next?.classList.add('spinnerBtn_disabled');
    } else {
      this.buttons.next?.classList.remove('spinnerBtn_disabled');
    }
  }

  private createPoints(): void {
    this.points.forEach((point) => {
      const pointElement = createElem({
        tagName: 'div',
        className: 'spinnerPoint',
        dataAttr: {
          position: point.value.toString(),
        },
      });

      const pointContent = createElem({
        tagName: 'div',
        className: 'spinnerPoint__content',
        text: point.value.toString(),
      });
      pointElement.appendChild(pointContent);

      const pointDescription = createElem({
        tagName: 'div',
        className: 'spinnerPoint__description',
        text: point.name,
      });
      pointElement.appendChild(pointDescription);

      this.spinner?.appendChild(pointElement);
      this.elements.push(pointElement);
    });
  }

  private validateParams(required: Record<string, unknown>): void {
    const missing = Object.entries(required)
      .filter(([key, value]) => value === undefined)
      .map(([key]) => key);

    if (missing.length > 0) {
      throw new Error(
        `Отсутствуют обязательные параметры: ${missing.join(', ')}`
      );
    }
  }

  private initSwiper(): void {
    if (!this.swiperWrapper) return;
    this.swiperWrapper.classList.add('swiper-mainWrapper_show');
    this.swiperWrapper.dataset.theme = this.points[this.currentStep - 1].name;
    this.swiperSliderWrapper =
      this.swiperWrapper.querySelector('.swiper-wrapper');
  }

  private startSwiper(): void {
    this.initSwiper();
    this.updateSwiperSlides();
    this.swiper = new Swiper('.mySwiper', {
      modules: [Navigation, Pagination],
      // loop: true,
      slidesPerView: 1.5,
      spaceBetween: 25,
      // navigation: false,

      breakpoints: {
        768: {
          slidesPerView: 3.5,
          spaceBetween: 80,
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          },
        },
      },
    });
  }

  private updateSwiperSlides(): void {
    if (!this.swiperSliderWrapper) throw new Error('Swiper wrapper not found');

    const currentSldes = this.points[this.currentStep - 1].slides;

    this.swiperSliderWrapper.innerHTML = '';

    currentSldes.length > 0 &&
      currentSldes.forEach((slide) => {
        const slideElement = createElem({
          tagName: 'div',
          className: 'swiper-slide',
        });
        const event = createElem({
          tagName: 'div',
          className: 'event',
        });
        const eventYear = createElem({
          tagName: 'h3',
          className: 'event__year',
          text: slide.year.toString(),
        });
        const eventDesc = createElem({
          tagName: 'p',
          className: 'event__desc',
          text: slide.text,
        });
        event.appendChild(eventYear);
        event.appendChild(eventDesc);
        slideElement.appendChild(event);

        this.swiperSliderWrapper?.appendChild(slideElement);
      });
  }

  private updateDoubleTitle(): void {
    const currentSldes = this.points[this.currentStep - 1].slides;
    const firstSlide = currentSldes[0];
    const lastSlide = currentSldes[currentSldes.length - 1];
    this.setDoubleTitle([firstSlide, lastSlide]);
  }

  private setDoubleTitle([firsSlide, lastSlide]: [
    SwiperSlide,
    SwiperSlide
  ]): void {
    let firstTitle = '';
    let secondTitle = '';

    if (firsSlide) {
      firstTitle = firsSlide.year.toString();
      this.titles.desktop.first &&
        this.titleAnimation(this.titles.desktop.first, firstTitle);
      this.titles.mobile.first &&
        this.titleAnimation(this.titles.mobile.first, firstTitle);
    }

    if (lastSlide) {
      secondTitle = lastSlide.year.toString();
      this.titles.desktop.second &&
        this.titleAnimation(this.titles.desktop.second, secondTitle);
      this.titles.mobile.second &&
        this.titleAnimation(this.titles.mobile.second, secondTitle);
    }
  }

  private titleAnimation(title: HTMLElement, titleText: string): void {
    if (titleText === '') {
      title.textContent = '';
      return;
    }

    let oldTitle = title.textContent;
    if (!oldTitle) {
      title.textContent = titleText;
      return;
    }

    const start = parseInt(oldTitle); //oldTitle
    const end = parseInt(titleText); //ol
    const minStepTime = 16; // (16ms)

    const difference = start - end;
    const steps = Math.abs(difference);
    const actualDuration = Math.max(this.spinningSpeed, steps * minStepTime);

    const startTime = performance.now();

    // const easeOut = (t: number) => 1 - Math.pow(1 - t, 1.2);
    const easeOut = (t: number) => Math.pow(t, 0.3);

    function update(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / actualDuration, 1);
      const easedProgress = easeOut(progress);

      // const current = Math.round(start + difference * progress);
      const current = Math.round(start + (end - start) * easedProgress);
      title.textContent = current.toString();

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        title.textContent = current.toString();
      }
    }

    requestAnimationFrame(update);
  }
}
