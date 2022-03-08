const path = require('path');

// development config

module.exports = {
        entry: {
                homepage: './homepage/index.jsx',
                dashboard: './dashboard/index.jsx',
                navbar: './navbar/index.jsx'

        },
        mode: 'development',
        output: {
                filename: '[name].js',
                path: path.join(__dirname, '..', 'web/public/js/react'),
                clean: true
        },
        module: {
                rules: [
                        {
                                test: /\.jsx?$/,
                                exclude: /node_modules/,
                                use: {
                                        loader: 'babel-loader',
                                        options: {
                                                plugins: ['@babel/plugin-transform-runtime'],
                                                presets: ['@babel/preset-env', '@babel/preset-react']
                                        }
                                }
                        }
                ]
        }
};
