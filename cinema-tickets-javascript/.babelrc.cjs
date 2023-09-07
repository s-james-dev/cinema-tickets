module.exports = {
    // See https://babeljs.io/docs/en/babel-preset-env#targets
    // See https://stackoverflow.com/questions/61146112/error-while-loading-config-you-appear-to-be-using-a-native-ecmascript-module-c
    presets: [['@babel/preset-env', {targets: {node: 'current'}}]],
};