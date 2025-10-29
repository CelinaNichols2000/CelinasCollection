// transformation.js
const TransformationManager = {
  storageKey: 'farm_transformation_state',
  
  init() {
    const state = this.getState();
    if (state && Date.now() < state.endTime) {
      this.activateTransformation(state);
      this.startTimer(state.endTime - Date.now());
    }
  },
  
  transform(type, duration) {
    const state = {
      type,
      startTime: Date.now(),
      endTime: Date.now() + duration,
      duration
    };
    localStorage.setItem(this.storageKey, JSON.stringify(state));
    this.activateTransformation(state);
    this.startTimer(duration);
  },
  
  activateTransformation(state) {
    document.body.classList.add('transformed', `transformed-${state.type}`);
    // Trigger custom event für farm.js
    window.dispatchEvent(new CustomEvent('transformationActive', { detail: state }));
  },
  
  getState() {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : null;
  },
  
  reset() {
    localStorage.removeItem(this.storageKey);
    document.body.classList.remove('transformed');
    location.reload(); // oder sanfter View-Wechsel
  },
  
  getRemainingTime() {
    const state = this.getState();
    return state ? Math.max(0, state.endTime - Date.now()) : 0;
  },
  
  isTransformed() {
    return this.getRemainingTime() > 0;
  }
};
