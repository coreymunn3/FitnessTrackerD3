class UI {
  constructor(){
    this.buttons = document.querySelectorAll('button');
    this.form = document.querySelector('form');
    this.formActivity = document.getElementById('form-activity');
    this.input = document.querySelector('#cycling');
    this.error = document.querySelector('.error');
  }
  // set active class function
  makeActive(element){
    // remove 'active' class from other buttons
    this.buttons.forEach(btn => {
      btn.classList.remove('active');
    })
    // apply active class to the current target
    element.classList.add('active');
  }
  setFormActivity(activity){
    this.formActivity.textContent = activity;
  }
  getDistance(){
    return parseInt(ui.input.value);
  }
  getActivity(){
    let activity;
    this.buttons.forEach(btn => {
      if (btn.classList.contains('active')){
        activity = btn.dataset.activity;
      }
    })
    return activity;
  }
  setError(err){
    this.error.textContent = err;
  }
  clearError(){
    this.error.textContent = '';
  }
  clearInput(){
    this.input.value = '';
  }
}
