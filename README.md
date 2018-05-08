# Sort JS Object Keys README

This is a VS code extension to alphabetically sort the keys in _selected_ js objects keys in your code.

## Reference

Use [babylon](https://github.com/babel/babel/tree/master/packages/babylon) to parse the code, and sort the parsed code, then use [@babel/generator](https://github.com/babel/babel/tree/master/packages/babel-generator) to genertate the code back to document

## Usage

![Usage animation](images/usage.gif)

1. Select a js object in your source  
  Note: it uses full lines so ensure the selected lines are a valid js object, start from the "{" and end from the "}"
1. Run the extension command  
    * Sort JS object keys  
    Keybinding: `Alt+S`
    * Sort JS object keys (Reverse)
