# Тестовое задание компании Only

# Как проверить скрипт

1. Клонировать репозиторий на свой компьютер.
2. Перейти в папку проекта и запустить `npm install` для установки зависимостей.
3. Запустить `npm start` для запуска проекта с live-сервером
4. Запустить `npm run build` для сборки проекта.
5. (!) Если сборка не запустится (такое может быть, т.к я собирал на node v.14), то в папку buildedPlugin прилагаю готовую сборку (надеюсь это не потребутеся)

# Как запустить свой скрипт (На примере файла src/index.ts)

1. Импортировать SpinningPoints
2. Вызвать конструктор через new SpinningPoints(config); 
3. В качестве аргумента передать объект с параметрами

## Описание параметров конфига
```
const worldEventsConfig = {
containerSelector: '.worldEventsCircle',
swiperContainerSelector: '.swiper-mainWrapper',
startPosition: 1,
speed: 1600,
points: middleAge,
};
```
| Параметр | Тип            | Описание | Значение по умолчанию | Обязательный |
| --- |----------------| --- |-----------------------| --- |
| containerSelector | string         | Селектор контейнера | -                     | Да |
| swiperContainerSelector | string         | Селектор контейнера swiper | -                     | Да |
| startPosition | number         | Начальная позиция | 1                     | Нет |
| speed | number         | Скорость | 650                   | Нет |
| points | SpinnerPoint[] | Список точек | -                     | Да |

#### Структура данных массива точек (SpinnerPoint)
```typescript
type SpinnerPoint = {
 value: number;
 name: string;
 slides: SwiperSlide[];
}

type SwiperSlide = {
 text: string;
 year: number;
}
