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
var JSON5 = require('json5');

suite('Extension Tests', function() {
  // Defines a Mocha unit test
  test('normal js object asc', function() {
    var jsObject = `{
        user: 'user',
        aaa: 'aaa',
        bbb: 'bbb',
        password: 'password'
    }`;

    var result = sorter.sort(jsObject, 4, JSON5, ['asc'], {});

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

  test('normal js object desc', function() {
    var jsObject = `{
        user: 'user',
        aaa: 'aaa',
        bbb: 'bbb',
        password: 'password'
    }`;

    var result = sorter.sort(jsObject, 4, JSON5, ['desc'], {});

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

    var result = sorter.sort(jsObject, 2, JSON5, ['asc'], {});

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

    var result = sorter.sort(jsObject, 4, JSON5, ['asc'], {});

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

    var result = sorter.sort(jsObject, 4, JSON5, ['asc'], {});

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

    var result = sorter.sort(jsObject, 4, JSON5, ['asc'], {});

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

    var result = sorter.sort(jsObject, 4, JSON5, ['asc'], {});

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

    var result = sorter.sort(jsObject, 4, JSON5, ['asc'], {});

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

    var result = sorter.sort(jsObject, 2, JSON5, ['asc'], {});

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

  test('Support line comments at the end of the object', function() {
    var jsObject = `{
        b: 2,
        // some comment
        a: 1,
        // another comment
        d: 5,
        c: 4,
        // end comment
    }`;

    var result = sorter.sort(jsObject, 4, JSON5, ['asc'], {});

    assert.equal(
      result,
      `{
        // some comment
        a: 1,
        b: 2,
        c: 4,
        // another comment
        d: 5,
        // end comment
    }`
    );
  });
});
