const path = require('path')

module.exports = {
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                // Fix for Angular 15 SCSS compilation
                quietDeps: true,
                verbose: false,
                logger: {
                  warn: function (message) {
                    // Suppress specific warnings that cause build failures
                    if (message.includes('deprecation') ||
                      message.includes('slash-div') ||
                      message.includes('unterminated string')) {
                      return
                    }
                    console.warn(message)
                  }
                }
              },
              // Add this to handle import resolution
              additionalData: `
                @import "~bootstrap/scss/functions";
                @import "~bootstrap/scss/variables";
                @import "~bootstrap/scss/mixins";
              `
            }
          }
        ]
      }
    ]
  },
  resolve: {
    alias: {
      // Add aliases if needed for better module resolution
      '@': path.resolve(__dirname, 'src'),
      '~': path.resolve(__dirname, 'node_modules')
    }
  }
}