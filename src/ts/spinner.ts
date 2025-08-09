import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css/bundle';

import { createElem } from './helpers';
import { chronicles } from '../datasets/chronicles.json';

import { spinnerPoint, swiperSlide } from './types/spinnerTypes';

class SpinningPoints {
  private spinnerContainer: HTMLElement | null;
  private spinner: HTMLElement | null;
  private spinnerController: HTMLElement | null;
  private spinnerCounter: HTMLElement | null;
  private spinnerCounterNumber: HTMLElement | null;
  private points: spinnerPoint[];
  private elements: Array<HTMLElement> = [];
  private buttons: {
    next: HTMLElement;
    prev: HTMLElement;
  };
  private titles: {
    first: HTMLElement;
    second: HTMLElement;
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

  constructor({
    containerSelector,
    startPosition = 1,
    speed = 650,
    points,
  }: {
    containerSelector: string;
    startPosition?: number;
    speed?: number;
    points: unknown[];
  }) {
    const required = { containerSelector, points };
    this.validateParams(required);

    this.spinnerContainer = document.querySelector(containerSelector);
    if (this.spinnerContainer === null)
      throw new Error('Spinner container not found');

    this.spinner = this.spinnerContainer.querySelector('.spinner');
    this.spinnerController =
      this.spinnerContainer.querySelector('.spinnerControl');
    this.spinnerCounter =
      this.spinnerContainer.querySelector('.spinnerCounter');

    if (this.spinnerController === null)
      throw new Error('Spinner controller not found');
    this.buttons = {
      prev: this.spinnerController.querySelector('.spinnerBtn_prev'),
      next: this.spinnerController.querySelector('.spinnerBtn_next'),
    };

    this.titles = {
      first: this.spinnerContainer.querySelector('.spinnerTitle_first'),
      second: this.spinnerContainer.querySelector('.spinnerTitle_second'),
    };

    this.spinnerCounterNumber = this.spinnerCounter.querySelector(
      '.spinnerCounter__number_current'
    );

    this.points = points;
    console.log(this.points);

    // if (!this.spinner) throw new Error('Spinner not found');
    //
    // this.elements = this.spinner.querySelectorAll('.spinnerPoint');

    this.totalElements = this.points.length;
    this.stepSize = (1 / this.totalElements) * 100;

    this.spinningSpeed = speed;

    this.currentStep = startPosition;
    console.log(this);

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
        this.updateCircle();
        this.placePointsOnCircle();
        this.bindEvents();
      });
    } else {
      this.createPoints();
      this.startSwiper();
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
    this.updateSwiper();
    this.isSpinning = false;
  };

  private moveCircleByPoint = ({
    currentTarget,
  }: {
    currentTarget: HTMLElement;
  }): void => {
    this.currentStep = Number(currentTarget.dataset.position);
    this.isSpinning = true;
    this.updateCircle();
    this.updateSwiper();
    this.isSpinning = false;
  };

  private updateCircle(): void {
    this.setActivePoint();
    this.setProgress();
    this.setHtmlCounter();
    this.setBtnsState();
  }

  public updateSwiper(): void {
    this.swiper.slideTo(0, 0);
    this.updateSwiperSlides();
  }

  private setActivePoint(): void {
    if (this.isSpinning && this.activePoint) {
      this.activePoint.classList.remove('spinnerPoint_active');
      this.activePoint.classList.remove('spinnerPoint_onPlace');
    }
    this.activePoint = this.spinner.children[this.currentStep - 1];
    this.activePoint.classList.add('spinnerPoint_active');
    setTimeout(() => {
      this.activePoint.classList.add('spinnerPoint_onPlace');
    }, this.spinningSpeed);
  }

  private setHtmlCounter() {
    this.spinnerCounterNumber.textContent = this.currentStep
      .toString()
      .padStart(2, '0');
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
    } else {
      this.showProgressLimit('end');
    }
  }

  private rotateCounterClockwise(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.isSpinning = true;
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
    this.spinner.style.setProperty('--progress', progress + '%');
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
      this.buttons.prev.classList.add('spinnerBtn_disabled');
    } else {
      this.buttons.prev.classList.remove('spinnerBtn_disabled');
    }

    if (this.currentStep === this.totalElements) {
      this.buttons.next.classList.add('spinnerBtn_disabled');
    } else {
      this.buttons.next.classList.remove('spinnerBtn_disabled');
    }
  }

  private createPoints(): void {
    console.log(this.points);
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
        text: point.value,
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

  private validateParams(required): void {
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
    this.swiperWrapper = document.querySelector('.swiper-wrapper');
  }

  private startSwiper(): void {
    this.initSwiper();
    this.updateSwiperSlides();
    this.swiper = new Swiper('.mySwiper', {
      modules: [Navigation, Pagination],
      // loop: true,
      slidesPerView: 3.5,

      spaceBetween: 80,
      // If we need pagination
      // pagination: {
      //   el: '.swiper-pagination',
      // },

      // Navigation arrows
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });
  }

  private updateSwiperSlides(): void {
    const currentSldes = this.points[this.currentStep - 1].slides;

    const firstSlide = currentSldes[0];
    const lastSlide = currentSldes[currentSldes.length - 1];
    this.setDoubleTitle([firstSlide, lastSlide]);

    this.swiperWrapper.innerHTML = '';

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

        this.swiperWrapper?.appendChild(slideElement);
      });
  }

  private setDoubleTitle([firsSlide, lastSlide]: [
    swiperSlide,
    swiperSlide
  ]): void {
    let firstTitle = '';
    let secondTitle = '';

    if (firsSlide) {
      firstTitle = firsSlide.year.toString();
    }
    if (lastSlide) {
      secondTitle = lastSlide.year.toString();
    }

    this.titles.first.textContent = firstTitle;
    this.titles.second.textContent = secondTitle;
  }
  // Публичные методы для внешнего управления
  public refresh(): void {
    this.placePointsOnCircle();
  }

  public destroy(): void {
    if (this.spinnerController) {
      this.spinnerController.removeEventListener('click', this.moveCircle);
    }
  }
}

const spiningPointsConfig = {
  containerSelector: '.spinnerContainer',
  startPosition: 2,
  // speed: 600,
  points: chronicles,
};
// Использование:
const spiningPoints = new SpinningPoints(spiningPointsConfig);
// или с кастомным селектором:
// const spiningPoints = new SpinningPoints('.my-custom-container');
