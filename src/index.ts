import './styles/main.scss';
// import './ts/swiper';
import './ts/spinner';

import { SpinningPoints } from './ts/spinner';

import { chronicles } from './datasets/chronicles.json';
import { middleAge } from './datasets/middleAge.json';

console.log('Entry point');

const spiningPointsConfig = {
  containerSelector: '.historicalCircle',
  swiperContainerSelector: '.swiper-mainWrapper',
  startPosition: 2,
  speed: 600,
  points: chronicles,
};
new SpinningPoints(spiningPointsConfig);

const worldEventsConfig = {
  containerSelector: '.worldEventsCircle',
  swiperContainerSelector: '.swiper-mainWrapper',
  startPosition: 1,
  speed: 1600,
  points: middleAge,
};
new SpinningPoints(worldEventsConfig);
