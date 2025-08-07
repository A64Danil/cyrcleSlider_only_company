function placePointsOnCircle() {
  const circleContainer = document.querySelector(
    '.circleContainer'
  ) as HTMLElement;
  if (circleContainer === null) return;

  const elements: NodeListOf<HTMLElement> =
    circleContainer.querySelectorAll('.circlePoint');
  const totalElements = elements.length;

  // circleContainer.style.setProperty(
  //   '--childerenLength',
  //   totalElements.toString()
  // );
  circleContainer.style.setProperty(
    '--initialOffset',
    getOffsetByChildrenLength(totalElements)
  );

  elements.forEach((element, index) => {
    const position = (index / totalElements) * 100;
    element.style.setProperty('--start', position + '%');
  });
}

function getOffsetByChildrenLength(length: number): string {
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

document.addEventListener('DOMContentLoaded', placePointsOnCircle);
