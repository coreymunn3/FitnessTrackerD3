const ui = new UI();

const App = (function(ui) {
  // EVENT LISTENERS
  const loadEventListeners = function(){
    // handle activity selection
    ui.buttons.forEach(btn => {
      btn.addEventListener('click', handleActivitySelection)
    })
    // form submit
    ui.form.addEventListener('submit',submitForm)
  }

  // EVENT FUNCTIONS
  const handleActivitySelection = function(e) {
    e.preventDefault();
    // get the activity
    const activity = e.target.dataset.activity;
    // set ID of input field
    ui.input.setAttribute('id', activity);
    // remove active class from existing and add it to clicked button
    ui.makeActive(e.target);
    // set text of form span
    ui.setFormActivity(activity);
    // call the update function
    update(data);
  }

  const submitForm = function (e) {
    e.preventDefault();
    // get distance user has entered
    const distance = ui.getDistance();
    // get current activity
    const activity = ui.getActivity();

    // write to db - this is a promise
    if (distance){
      db.collection('activities').add({
        distance,
        activity,
        date: new Date().toString()
      })
      .then( () => {
        ui.clearError();
        ui.clearInput();
      })
    }
    else {
      ui.setError('You must input a valid distance!');
    }
  }

  // public methods
  return {
    init: function() {
      console.log('initializing...')
      loadEventListeners();
    }
  }
})(ui);


App.init();