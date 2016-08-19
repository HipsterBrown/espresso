var items;

if ((items = someObject.property).length !== 0) {
  console.log(items);
}

var newObject = {
  methodOne() {
    var attrs = {};
    var test;
    if (attrs.length) {
      test = 'value';
    } else {
      test = 'another value';
    }
    return attrs;
  },
  methodTwo(data) {
    var attrs = data;
    var test;
    if (attrs.length) {
      test = 'value';
    } else {
      test = 'another value';
    }
    return attrs;
  }
};
