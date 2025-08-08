class SpiningPoints {
  private circleContainer: HTMLElement | null;
  private circleController: HTMLElement | null;
  private circleCounter: HTMLElement | null;
  private circleCounterNumber: HTMLElement | null;
  private elements: NodeListOf<HTMLElement>;
  private buttons: {
    next: HTMLElement;
    prev: HTMLElement;
  };
  private totalElements = 0;
  private stepSize = 0;
  private currentStep = 1;
  private progress = 0;
  private activePoint: HTMLElement | null = null;

  constructor({
    containerSelector,
    startPosition,
  }: {
    containerSelector: string;
    startPosition: number;
  }) {
    this.circleContainer = document.querySelector(containerSelector);
    this.circleController = document.querySelector('.circleControl');
    this.circleCounter = document.querySelector('.circleCounter');

    this.buttons = {
      prev: this.circleController.querySelector('.circleBtn_prev'),
      next: this.circleController.querySelector('.circleBtn_next'),
    };

    this.circleCounterNumber = this.circleCounter.querySelector(
      '.circleCounter__number_current'
    );

    if (!this.circleContainer) throw new Error('Circle container not found');

    this.elements = this.circleContainer.querySelectorAll('.circlePoint');

    this.totalElements = this.elements.length;
    this.stepSize = (1 / this.totalElements) * 100;
    console.log(this.stepSize);

    this.currentStep = startPosition;

    this.init();
  }

  private init(): void {
    if (!this.circleContainer) {
      console.warn('Circle container not found');
      return;
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.placePointsOnCircle();
        this.setPosition();
        this.bindEvents();
      });
    } else {
      this.placePointsOnCircle();
      this.setPosition();
      this.bindEvents();
    }
  }

  private placePointsOnCircle(): void {
    if (!this.circleContainer) return;

    this.circleContainer.style.setProperty(
      '--initialOffset',
      this.getOffsetByChildrenLength(this.totalElements)
    );
    this.circleContainer.style.setProperty('--progress', '0%');

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
  };

  private setPosition(): void {
    this.setActivePoint();
    this.setProgress();
    this.setHtmlCounter();
    this.setBtnsState();
  }

  private setActivePoint(): void {
    if (this.activePoint) {
      this.activePoint.classList.remove('circlePoint_active');
    }
    this.activePoint = this.circleContainer.children[this.currentStep - 1];
    this.activePoint.classList.add('circlePoint_active');
  }

  private setHtmlCounter() {
    this.circleCounterNumber.textContent = this.currentStep
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
    if (!this.circleController) return;
    this.circleController.addEventListener('click', this.moveCircle);
    this.elements.forEach((element) => {
      element.addEventListener('click', this.moveCircleByPoint);
    });
  }

  private rotateClockwise(): void {
    if (this.currentStep < this.totalElements) {
      this.currentStep++;
    } else {
      this.showProgressLimit('end');
    }
  }

  private rotateCounterClockwise(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
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
    this.circleContainer.style.setProperty('--progress', progress + '%');
  }

  private showProgressLimit(dir: 'start' | 'end') {
    this.circleContainer?.classList.add('circleContainer_fastAnimation');
    const [forward, backward] = dir === 'start' ? [3, -1] : [-3, 1];
    const offsetList = [this.progress + forward, this.progress + backward];
    this.setDelayedProgress(offsetList[0]);
    this.setDelayedProgress(offsetList[1], 200);
    this.setDelayedProgress(0, 400);
    setTimeout(() => {
      this.circleContainer?.classList.remove('circleContainer_fastAnimation');
    }, 600);
  }

  private setDelayedProgress(progress = 0, delay = 0): void {
    setTimeout(() => {
      this.setProgress(progress);
    }, delay);
  }

  private setBtnsState(): void {
    if (this.currentStep === 1) {
      this.buttons.prev.classList.add('circleBtn_disabled');
    } else {
      this.buttons.prev.classList.remove('circleBtn_disabled');
    }

    if (this.currentStep === this.totalElements) {
      this.buttons.next.classList.add('circleBtn_disabled');
    } else {
      this.buttons.next.classList.remove('circleBtn_disabled');
    }
  }
  // Публичные методы для внешнего управления
  public refresh(): void {
    this.placePointsOnCircle();
  }

  public destroy(): void {
    if (this.circleController) {
      this.circleController.removeEventListener('click', this.moveCircle);
    }
  }
}

const spiningPointsConfig = {
  containerSelector: '.circleContainer',
  startPosition: 3,
  // points: [
  //   {
  //     value: 1,
  //
  //   }
  // ]
};
// Использование:
const spiningPoints = new SpiningPoints(spiningPointsConfig);
// или с кастомным селектором:
// const spiningPoints = new SpiningPoints('.my-custom-container');
