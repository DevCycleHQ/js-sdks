module.exports = (config, { options }) => {
  const libraryTarget = options.libraryTarget
  const libraryName = options.libraryName

  config.optimization.runtimeChunk = false

  try {
    delete config.entry.main
  } catch (error) {
    console.warn(`Could not delete entry.main: ${error}`)
  }

  config.entry[libraryName] = {
    import: options.main,
    library: {
      name: libraryName,
      type: libraryTarget,
      umdNamedDefine: true,
    },
  }

  config.output = {
    ...config.output,
    filename: `${libraryName.toLowerCase()}.min.js`,
  }

  return config
}
