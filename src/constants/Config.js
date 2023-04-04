const Config = {
  apiDomain: 'https://foodplan.menu/api/',
  url: 'https://foodplan.menu',
  version: '1.0',
  appName: 'Foodplan',
  urlTile: 'http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg',
  newSlideInUp: {
    0: {
      opacity: 0,
      translateY: 0,
    },
    0.5: {
      opacity: 0,
      translateY: 100,
    },
    1: {
      opacity: 1,
      translateY: 0,
    },
  },
  isDev: __DEV__,
};

export default Config;
