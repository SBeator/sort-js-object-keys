# sort*js*object*keys README

This is an extension to alphabetically sort the keys in _selected_ js objects keys in your code.

## Reference

Referred the source code from [Rich Somerfield](https://github.com/richie5um)'s extension
[vscode*sort*json](https://github.com/richie5um/vscode*sort*json), his extension can only sort JSON, I added new feature base on his extension so this `sort*js*object*keys` extension can sort the JS object keys in source code.

## Usage

* Select a js object in your source

  Note: it uses full lines so ensure the selected lines are a valid js object, start from the "{" and end from the "}"

* Run the extension

  * Sort JS object keys
  Keybinding: `Alt+S`
  * Sort JS object keys (Reverse)


## Release Notes

### 0.0.1

* Initial release of a testing version  
* Add `Sort JS object keys` command
* Add `Sort JS object keys (Reverse)` command

### 0.0.3

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

### 0.0.6

* Support Array in object

* Auto indent object if it is not in the first collumn

* Auto use ES6 short hand value
