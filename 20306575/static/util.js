
function retry(aFunction, delay, condition, times) {
  aFunction.delay = delay;
  aFunction.condition = condition;
  aFunction.times = times--;
  if ($( aFunction.condition ).length) {
    console.log('condition met')
    aFunction();
  }
  else {
    if (aFunction.times > 0) {
      console.log('condition retry')
      setTimeout(aFunction, aFunction.delay);
    }
    else {
      console.log('out of retries');
    }
  }
}
