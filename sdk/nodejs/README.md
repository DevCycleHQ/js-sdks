# DevCycle NodeJS Server SDK (Local bucketing pre WASM for SFCC)

## How to build

`nx build nodejs` 

Builds a "rhino compatible" bundle into dist/sdk/nodejs/main.js. Rhino compatible suggests that the code has been fully transpiled to es5. This isn't the case since nodejs depends on other internal libs that continue to have es6 code in them (for example, murmurhash, search for this line in the compiled code for confirmation `const createBuffer = (val) => new TextEncoder().encode(val)`.)

### Validating with Rhino

To validate this file, install `rhino` on your machine (`brew install rhino`), and run `rhino dist/sdk/nodejs/main.js`.

You'll see it log various syntax errors, including the far arrow function line mentioned above.

## Remove leftover es6

To try to get around this, I have a second babel config that I use on top of the bundled file. To use it:

`npx babel ./dist/sdk/nodejs/main.js --out-dir ./dist/sdk/nodejs2 --config-file ./sdk/nodejs/babel.config2.js`

This further transpiles the file into a separate dist folder, dist/sdk/nodejs2.

### Validating with Rhino

Running `rhino dist/sdk/nodejs2/main.js` will produce no errors. Great!

## Try it in a java program

Within this repo, there's a file called `RhinoTest.java`. It's a simple wrapper that loads the rhino compatible code and outputs any stack traces. The repo also contains a version of the rhino runtime to compile and run the program.

### Compile the java program

`javac -classpath rhino-1.7.14.jar RhinoTest.java`

### Run the java program

`java -classpath .:rhino-1.7.14.jar RhinoTest`

At this point you're likely to see an exception, in my case, 

`Exception in thread "main" org.mozilla.javascript.JavaScriptException: TypeError: Incompatible receiver, Symbol required (JavaScript#766)`

This becomes the new rabbit hole. I've ended here a few times in the last couple days. Some results related to it include:

https://www.google.com/search?q=%22Incompatible+receiver,+Symbol+required%22+es5+rhino&ei=W1JaZNXpD52mptQP8teLyAs&ved=0ahUKEwiVg6SZs-j-AhUdk4kEHfLrArkQ4dUDCA8&uact=5&oq=%22Incompatible+receiver,+Symbol+required%22+es5+rhino&gs_lcp=Cgxnd3Mtd2l6LXNlcnAQA0oECEEYAVDVBFjcCGC2CmgBcAB4AIABlwGIAewBkgEDMS4xmAEAoAEBwAEB&sclient=gws-wiz-serp