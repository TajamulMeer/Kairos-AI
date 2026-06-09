module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@navigation': './src/navigation',
          '@hooks': './src/hooks',
          '@store': './src/store',
          '@services': './src/services',
          '@utils': './src/utils',
          '@constants': './src/constants',
          '@assets': './src/assets',
        },
      },
    ],
  ],
};
