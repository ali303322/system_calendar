const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  config.resolve.extensions = ['.web.js', '.js', '.jsx', '.ts', '.tsx'];
  
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native-web': require.resolve('react-native-web'),
  };

  return config;
};