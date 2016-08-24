var base;

if ((base = testObject.properties).meta == null) {
  base.meta = {};
}

var base1;
var isTest = (base1 = this.testState()).isTest != null ? base1.isTest : base1.isTest = true;
