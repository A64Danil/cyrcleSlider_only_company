type ElemProps = {
  tagName: string;
  className?: string;
  dataAttr?: {
    [key: string]: string;
  };
  text?: string;
};

export function createElem({
  tagName,
  className,
  dataAttr,
  text,
}: ElemProps): HTMLElement {
  const element = document.createElement(tagName);

  if (className) element.classList.add(className);
  if (dataAttr)
    Object.entries(dataAttr).forEach(
      ([key, value]) => (element.dataset[key] = value)
    );
  if (text) element.textContent = text;
  return element;
}
