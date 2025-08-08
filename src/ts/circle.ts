class SpiningPoints {
  private circleContainer: HTMLElement | null;
  private circleController: HTMLElement | null;
  private elements: NodeListOf<HTMLElement>;
  private totalElements = 0;
  private stepSize = 0;
  private currentStep = 1;
  private progess = 0;
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
    if (target.dataset.direction === 'next') {
      this.rotateCounterClockwise();
    } else if (target.dataset.direction === 'prev') {
      this.rotateClockwise();
    }
    this.setPosition();
  };

  private setPosition(): void {
    this.setActivePoint();
    this.setProgress();
  }

  private setActivePoint(): void {
    if (this.activePoint) {
      this.activePoint.classList.remove('circlePoint_active');
    }
    this.activePoint = this.circleContainer.children[this.currentStep - 1];
    this.activePoint.classList.add('circlePoint_active');
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
    }
  }

  private rotateCounterClockwise(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  private setProgress(): void {
    this.progess = (this.currentStep - 1) * this.stepSize * -1;
    this.circleContainer.style.setProperty('--progress', this.progess + '%');
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
  startPosition: 2,
};
// Использование:
const spiningPoints = new SpiningPoints(spiningPointsConfig);
// или с кастомным селектором:
// const spiningPoints = new SpiningPoints('.my-custom-container');
