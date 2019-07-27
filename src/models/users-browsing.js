import { createModel } from 'redux-model';

export default createModel({
  prefix: 'usersBrowsing',

  origin: {
    searchText: '',
  },

  getter: {
    searchText: s => s.searchText,
  },

  action: {
    setSearchText: (s, searchText) => ({
      searchText,
    }),
  },
});
