nx build nodejs
npx babel ./dist/sdk/nodejs/main.js --out-dir ./dist/sdk/nodejs2 --config-file ./sdk/nodejs/babel.config2.js
javac -classpath rhino-1.7.14.jar RhinoTest.java
java -classpath .:rhino-1.7.14.jar RhinoTest