module.exports = {
  // 自定义webpack配置以禁用字体内联
  optimization: {
    runtimeChunk: false
  },
  // 避免尝试内联远程资源
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }
    ]
  }
}; 