import Emitter from './Emitter';
import store from '../store';
import debounce from 'lodash.debounce';

class Resize {
  constructor() {
    this.resize = this.resize.bind(this);
    this.init();
  }

  resize() {
    store.bounds.ww = window.innerWidth;
    store.bounds.wh = window.innerHeight;

    Emitter.emit('resize');
  }

  on() {
    window.addEventListener('resize', debounce(this.resize, 200));
  }

  init() {
    this.on();
  }
}

export default new Resize();
