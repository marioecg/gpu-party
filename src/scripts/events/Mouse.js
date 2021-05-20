import Emitter from './Emitter';

class Mouse {
  constructor() {
    this.onMouseMove = this.onMouseMove.bind(this);

    this.init();
  }

  onMouseMove(e) {
    Emitter.emit('mouseMove', e);
  }

  on() {
    window.addEventListener('mousemove', this.onMouseMove);
  }

  init() {
    this.on();
  }
}

export default new Mouse();
