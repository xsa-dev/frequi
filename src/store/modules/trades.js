import axios from 'axios';

import { apiBase, apiAuth } from './config';

export default {
  namespaced: true,
  state: {
    trades: [],
    trade_count: 0,

  },
  mutations: {
    updateTrades(state, trades) {
      state.trades = trades.trades;
      state.trade_count = trades.trade_count;
    }
  },
  actions: {
    getTrades({ commit }) {
      axios.get(`${apiBase}/trades`, {
        ...apiAuth
      })
        .then((result) => commit('updateTrades', result.data))
        .catch(console.error);
    }
  }
};