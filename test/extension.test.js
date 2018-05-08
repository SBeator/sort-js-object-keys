/* global suite, test */

//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
var assert = require('assert');

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
var sorter = require('../lib/sort-json-core');

suite('Extension Tests', function() {
  test('normal js object asc', function() {
    var jsObject = `{
        user: 'user',
        aaa: 'aaa',
        bbb: 'bbb',
        password: 'password'
    }`;

    var result = sorter.sort(jsObject, 4, ['asc'], {});

    assert.equal(
      result,
      `{
        aaa: 'aaa',
        bbb: 'bbb',
        password: 'password',
        user: 'user'
    }`
    );
  });

  test('Not js object', function() {
    var jsObject = `aaa: 1`;

    var result;
    try {
      result = sorter.sort(jsObject, 4, ['asc'], {});
    } catch (e) {
      result = e.message;
    }

    assert.equal(result, 'Please make sure your selected text is a JS obejct!');
  });

  test('Not js object 2', function() {
    var jsObject = `{test('normal js object desc', function() {
      var jsObject = '';
    }`;

    var result;
    try {
      result = sorter.sort(jsObject, 4, ['asc'], {});
    } catch (e) {
      result = e.message;
    }

    assert.equal(result, 'Please make sure your selected text is a JS obejct!');
  });

  test('Not js object 3', function() {
    var jsObject = `'111'`;

    var result;
    try {
      result = sorter.sort(jsObject, 4, ['asc'], {});
    } catch (e) {
      result = e.message;
    }

    assert.equal(result, 'Please make sure your selected text is a JS obejct!');
  });

  test('Not js object 4', function() {
    var jsObject = `{
      a:1,
      b:2
    }; var b = 2;`;

    var result;
    try {
      result = sorter.sort(jsObject, 4, ['asc'], {});
    } catch (e) {
      result = e.message;
    }

    assert.equal(result, 'Please make sure your selected text is a JS obejct!');
  });

  test('normal js object desc', function() {
    var jsObject = `{
        user: 'user',
        aaa: 'aaa',
        bbb: 'bbb',
        password: 'password'
    }`;

    var result = sorter.sort(jsObject, 4, ['desc'], {});

    assert.equal(
      result,
      `{
        user: 'user',
        password: 'password',
        bbb: 'bbb',
        aaa: 'aaa'
    }`
    );
  });

  test('normal js object indent 2', function() {
    var jsObject = `{
      user: 'user',
      aaa: 'aaa',
      bbb: 'bbb',
      password: 'password'
    }`;

    var result = sorter.sort(jsObject, 2, ['asc'], {});

    assert.equal(
      result,
      `{
      aaa: 'aaa',
      bbb: 'bbb',
      password: 'password',
      user: 'user'
    }`
    );
  });

  test('format js object', function() {
    var jsObject = `{
        user : 'user',

        aaa: 'aaa',
        bbb: 'bbb'  ,
        password:    'password'
    }`;

    var result = sorter.sort(jsObject, 4, ['asc'], {});

    assert.equal(
      result,
      `{
        aaa: 'aaa',
        bbb: 'bbb',
        password: 'password',
        user: 'user'
    }`
    );
  });

  test('ES6 feature test', function() {
    var jsObject = `{
        user: 'user',
        aaa,
        bbb: 'bbb',
        password
    }`;

    var result = sorter.sort(jsObject, 4, ['asc'], {});

    assert.equal(
      result,
      `{
        aaa,
        bbb: 'bbb',
        password,
        user: 'user'
    }`
    );
  });

  test('Multi lines value test', function() {
    var jsObject = `{
        b: new String('b')
            .length,
        a: new String('a')
    }`;

    var result = sorter.sort(jsObject, 4, ['asc'], {});

    assert.equal(
      result,
      `{
        a: new String('a'),
        b: new String('b').length
    }`
    );
  });

  test('Auto add comma', function() {
    var jsObject = `{
        b: 'b',
        a: 'a',
    }`;

    var result = sorter.sort(jsObject, 4, ['asc'], {});

    assert.equal(
      result,
      `{
        a: 'a',
        b: 'b',
    }`
    );
  });

  test('Support line comments', function() {
    var jsObject = `{
        b: 2,
        // some comment
        a: 1,
        // another comment
        d: 5,
        c: 4,
    }`;

    var result = sorter.sort(jsObject, 4, ['asc'], {});

    assert.equal(
      result,
      `{
        // some comment
        a: 1,
        b: 2,
        c: 4,
        // another comment
        d: 5,
    }`
    );
  });

  test('Support line comments for indent 2', function() {
    var jsObject = `{
        b: 2,
        // some comment
        a: 1,
        // another comment
        d: 5,
        c: 4,
    }`;

    var result = sorter.sort(jsObject, 2, ['asc'], {});

    assert.equal(
      result,
      `{
      // some comment
      a: 1,
      b: 2,
      c: 4,
      // another comment
      d: 5,
    }`
    );
  });

  // NOT suppot end line comments because babel not suppot it correctly
  // test('Support line comments at the end of the object', function() {
  //   var jsObject = `{
  //       b: 2,
  //       // some comment
  //       a: 1,
  //       // another comment
  //       d: 5,
  //       c: 4,
  //       // end comment
  //   }`;

  //   var result = sorter.sort(jsObject, 4, ['asc'], {});

  //   assert.equal(
  //     result,
  //     `{
  //       // some comment
  //       a: 1,
  //       b: 2,
  //       c: 4,
  //       // another comment
  //       d: 5,
  //       // end comment
  //   }`
  //   );
  // });

  test("Support ' in string", function() {
    var jsObject = `{
        b: 'test \\'',
        c: 'test \\' test',
        a: '\\' test',
    }`;

    var result = sorter.sort(jsObject, 4, ['asc'], {});

    assert.equal(
      result,
      `{
        a: '\\' test',
        b: 'test \\'',
        c: 'test \\' test',
    }`
    );
  });

  test('Not change " in string ', function() {
    var jsObject = `{
        d: "\\" test",
        b: 'test " test',
        e: "test' test",
        a: "test' test",
        c: 'test """" test',
    }`;

    var result = sorter.sort(jsObject, 4, ['asc'], {});

    assert.equal(
      result,
      `{
        a: "test' test",
        b: 'test " test',
        c: 'test """" test',
        d: "\\" test",
        e: "test' test",
    }`
    );
  });

  test('Support ES6 string key', function() {
    var jsObject = `{
        'b': 'test',
        a: 1,
        'a': 1,
        b: 'test',
    }`;

    var result = sorter.sort(jsObject, 4, ['asc'], {});

    assert.equal(
      result,
      `{
        'a': 1,
        'b': 'test',
        a: 1,
        b: 'test',
    }`
    );
  });
});
