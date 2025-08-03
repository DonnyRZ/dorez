const path = require('path');

module.exports = {
  packagerConfig: {
    // Optional: give your app a custom icon
    icon: path.resolve(__dirname, 'assets', 'logo'),
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'gemini_electron_template',
      },
    },
  ],
  
  // Hooks can be added here if needed in the future
};
