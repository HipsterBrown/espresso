# Espresso
A quick shot of ES6 instead that old Coffee. 

This is a command line tool for converting CoffeeScript files into their ES6 equivalents*.

*As close as possible, anyway.

Available through NPM

```bash
npm install espresso-transformer
```

Using as CLI:
Espresso will look for `.coffee` files if a directory is passed in as the first argument, and write the new `.es6` files to the same directory.

(Given there is a directory called coffeescript)
```bash
espresso coffeescript/
```

To add the JSX transformer:

```bash
espresso coffeescript/ --jsx
```

To change which files to look for:

```bash
espresso coffeescript/ --match .coffeescript
```

To change the file type being written after transformation:

```
espresso coffeescript/ --extension .js
```

---

## Transformers

Core (default) transformer includes:
- CommonJS `require`s -> ES2015 `import`s
- CommonJS `module.exports` -> ES2015 `export default`
- CoffeeScript fat arrow function => ES2015 fat arrow function
- ES5 property function -> ES2015 object method

JSX transformer includes:
- React.DOM elements -> JSX element
- React component factory -> JSX element

TODO:
- [ ] destructuring
- [ ] React.createElement


## Up and Running (Development)
After cloning this repo:

```bash
npm install
npm link
espresso --help
```

## See it in Action
```bash
espresso examples/
```

Then check out the example `.coffee` files with their `.es6` conterparts.
