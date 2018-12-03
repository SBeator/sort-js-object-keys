# Change Log
All notable changes to the "sort*js*object*keys" extension will be documented in this file.

### [1.0.6]

* Use natural sort order for the key/value with or without quotes

### [1.0.5]

* Support nested object sorting  
    e.g: 
    ```javascript
    {
        user: 'user',
        aaa: {
          index: '321',
          id: '123'
        },
        bbb: 'bbb',
        password: 'password'
    }
    ```
    Will be formatted to:
    ```javascript
    {
        aaa: {
            id: '123',
            index: '321'
        },
        bbb: 'bbb',
        password: 'password',
        user: 'user'
    }
    ```

### [1.0.2]

* Update parser to use [@babel/parser](https://babeljs.io/docs/en/next/babel-parser.html) to parse  the code

* Support Typescript `as` expression:
    e.g:
  ```typescript
    {
        user: {
          name: 'Xingxin',
          age: 26
        } as IPerson,
        date: '02/03/2018' as any,
        message: 'this is message',
        password: '****' as IPassword
    }
  ```
  Will be formated to:
  ```typescript
    {
        date: ('02/03/2018' as any),
        message: 'this is message',
        password: ('****' as IPassword),
        user: ({
            name: 'Xingxin',
            age: 26
        } as IPerson)
    }
  ```
  
### [1.0.0]

* Use babylon + babel/generator to parse and genertate the code

* Support all the existing feature except:
    * Auto add tailing comma (Too much bugs for this feature)
    * End line comments (Babel can't parse it correctly)

### [0.0.x]

* Initial release of a testing version  

* Add `Sort JS object keys` command 

* Add `Sort JS object keys (Reverse)` command

* Lots of feature in test version...

