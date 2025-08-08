// import Swiper JS
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
// import Swiper styles
// import 'swiper/css'

// import styles bundle
import 'swiper/css/bundle';

new Swiper('.mySwiper', {
  modules: [Navigation, Pagination],
  // loop: true,
  slidesPerView: 3.5,

  spaceBetween: 80,
  // If we need pagination
  pagination: {
    el: '.swiper-pagination',
  },

  // Navigation arrows
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
});
