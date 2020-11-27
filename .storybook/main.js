const path = require('path');

module.exports = {
  stories: ['../stories/**/*.story.tsx'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-actions',
    '@storybook/addon-links',
  ],
  webpackFinal: async (config) => {
    config.module.rules = [
      ...config.module.rules.filter(
        (rule) => !String(rule.test).includes('.css')
      ),
      {
        test: /\.module\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  // 'postcss-preset-env',
                  'postcss-simple-vars',
                  'postcss-nested',
                ],
              },
            },
          },
        ],
        include: path.resolve(__dirname, '../stories'),
      },
    ];

    return config;
  },
  // https://storybook.js.org/docs/react/configure/typescript#mainjs-configuration
  typescript: {
    check: true, // type-check stories during Storybook build
  },
};
