var hasProp = {}.hasOwnProperty;
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

var NewTest = (function(superClass) {
  extend(NewTest, superClass);

  function NewTest() {
    return NewTest.__super__.constructor.apply(this, arguments);
  }

  NewTest.prototype.property = 'This is a test';

  NewTest.prototype.method = function() {
    return 'Another test';
  };

  return NewTest;

})(Test);

export default new NewTest();
