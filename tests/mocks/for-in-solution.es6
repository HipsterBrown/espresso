var ref = testObject.attrs;
for (var idx = i = 0, len = ref.length; i < len; idx = ++i) {
  var value = ref[idx];
  console.log(value, idx);
}

for (var idx = j = 0, len1 = shortName.length; j < len1; idx = ++j) {
  value = shortName[idx];
  console.log(value, idx);
}

for (var k = 0, len2 = anotherObject.length; k < len2; k++) {
  value = anotherObject[k];
  console.log(value);
}
