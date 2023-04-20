const path = require('path');

module.exports = {
  reactOptions: {
    legacyRootApi: false,
    strictMode: true,
  },
  staticDirs: ['./assets'],
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
                plugins: ['postcss-simple-vars', 'postcss-nested'],
              },
            },
          },
        ],
        include: path.resolve(__dirname, '../stories'),
      },
    ];

    return config;
  },
};
