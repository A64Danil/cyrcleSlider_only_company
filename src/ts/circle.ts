function placePointsOnCircle() {
  const elements: NodeListOf<HTMLElement> =
    document.querySelectorAll('.circlePoint')
  const totalElements = elements.length

  elements.forEach((element, index) => {
    const position = (index / totalElements) * 100
    element.style.setProperty('--start', position + '%')
  })
}

document.addEventListener('DOMContentLoaded', placePointsOnCircle)
