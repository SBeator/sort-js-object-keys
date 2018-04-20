# Change Log
All notable changes to the "sort*js*object*keys" extension will be documented in this file.

### [0.0.1]

* Initial release of a testing version  

* Add `Sort JS object keys` command 

* Add `Sort JS object keys (Reverse)` command

### [0.0.3]

* Support ES6 shorthand object  

    e.g: 
    ```js
    {
        user,
        password
    }
    ```
    Will be sorted to 
    ```js
    {
        password: password,
        user: user
    }
    ```

* Support value which is multiple lines or have space in it. 

    e.g:
    ```js
    {
        b: new String('b')
            .length,
        a: new String('a')
    }
    ```
    Will be sorted to 
    ```js
    {
        a: new String('a'),
        b: new String('b').length
    }
    ```
* Will automatically add trailing comma if the prevs object has trailing comma

    e.g:
    ```js
    {
        b: 'b',
        a: 'a'
    }
    ```
    Will be sorted to 
    ```js
    {
        a: 'a',
        b: 'b'
    }
    ```
    But this object which already has trailing comma:
    ```js
    {
        b: 'b',
        a: 'a',
    }
    ```
    Will be sorted to 
    ```js
    {
        a: 'a',
        b: 'b',
    }
    ```
### [0.0.6]

* Support Array in object

* Auto indent object if it is not in the first collumn

* Auto use ES6 short hand value

### [0.0.7]

* Support line comments in object

    e.g:
    ```js
    {
        b: 2,
        // some comment
        a: 1,
        // another comment
        d: 5,
        c: 4,
    }
    ```
    Will be sorted to 
    ```js
    {
        // some comment
        a: 1,
        b: 2,
        c: 4,
        // another comment
        d: 5,
    }
    ```

### [0.0.8]

* Fix an indent not correct bug

### [0.0.9]

* Support \' in string

    e.g:
    ```js
    {
        b: 'test \'',
        c: 'test \' test',
        a: '\' test',
    }
    ```
    Will be sorted to 
    ```js
    {
        a: '\' test',
        b: 'test \'',
        c: 'test \' test',
    }
    ```
