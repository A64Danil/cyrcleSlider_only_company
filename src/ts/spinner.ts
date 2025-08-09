import { createElem } from './helpers';

class SpiningPoints {
  private spinnerContainer: HTMLElement | null;
  private spinner: HTMLElement | null;
  private spinnerController: HTMLElement | null;
  private spinnerCounter: HTMLElement | null;
  private spinnerCounterNumber: HTMLElement | null;
  private points: unknown[];
  private elements: Array<HTMLElement> = [];
  private buttons: {
    next: HTMLElement;
    prev: HTMLElement;
  };
  private totalElements = 0;
  private stepSize = 0;
  private currentStep = 1;
  private progress = 0;
  private activePoint: HTMLElement | null = null;
  private isSpinning = false;
  private spinningSpeed = 650;

  constructor({
    containerSelector,
    startPosition,
    speed,
    points,
  }: {
    containerSelector: string;
    startPosition: number;
    speed: number;
    points: unknown[];
  }) {
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
        this.setPosition();
        this.placePointsOnCircle();
        this.bindEvents();
      });
    } else {
      this.createPoints();
      this.setPosition();
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
    this.setPosition();
    this.isSpinning = false;
  };

  private setPosition(): void {
    this.setActivePoint();
    this.setProgress();
    this.setHtmlCounter();
    this.setBtnsState();
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

  private moveCircleByPoint = ({
    currentTarget,
  }: {
    currentTarget: HTMLElement;
  }): void => {
    console.log(currentTarget.dataset.position);
    this.currentStep = Number(currentTarget.dataset.position);
    this.setPosition();
  };

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
      this.spinner?.classList.remove('spinnerContainer_fastAnimation');
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
  startPosition: 6,
  speed: 1000,
  points: [
    {
      value: 1,
      name: 'Технологии',
      slides: [
        {
          year: 1980,
          text: 'IBM представляет дисковую подсистему 3380 — крупные много-гигабайтные жёсткие диски.',
        },
        {
          year: 1981,
          text: 'IBM выпускает персональный компьютер IBM PC на базе MS-DOS.',
        },
        {
          year: 1982,
          text: 'Sony и Philips запускают коммерческий компакт-диск (CD) и плееры.',
        },
        {
          year: 1983,
          text: 'ARPANET переходит на TCP/IP, закладывая основу современного интернета.',
        },
        {
          year: 1984,
          text: 'Apple выпускает Macintosh с графическим интерфейсом и мышью.',
        },
        {
          year: 1985,
          text: 'Microsoft релизит Windows 1.0 — ранний графический интерфейс для ПК.',
        },
        {
          year: 1986,
          text: 'IBM представляет переносной ПК PC Convertible — один из первых ноутбуков.',
        },
      ],
    },
    {
      value: 2,
      name: 'Кино',
      slides: [
        {
          year: 1987,
          text: 'Выходит «Хищник» с Арнольдом Шварценеггером, ставший культовым фантастическим боевиком.',
        },
        {
          year: 1988,
          text: 'Премьера фильма «Кто подставил кролика Роджера» — революция в сочетании анимации и живых актёров.',
        },
        {
          year: 1989,
          text: 'Выходит «Бэтмен» Тима Бёртона, задавший мрачный тон супергеройским фильмам.',
        },
        {
          year: 1990,
          text: 'Премьера комедии «Один дома», ставшей рождественской классикой.',
        },
        {
          year: 1991,
          text: 'На экраны выходит «Терминатор 2: Судный день» — прорыв в спецэффектах.',
        },
      ],
    },
    {
      value: 3,
      name: 'Литература',
      slides: [],
    },
    {
      value: 4,
      name: 'Театр',
      slides: [],
    },
    {
      value: 5,
      name: '',
      slides: [],
    },
    {
      value: 6,
      name: 'Наука',
      slides: [],
    },
  ],
};
// Использование:
const spiningPoints = new SpiningPoints(spiningPointsConfig);
// или с кастомным селектором:
// const spiningPoints = new SpiningPoints('.my-custom-container');
