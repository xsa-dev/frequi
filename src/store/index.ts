import Vue from 'vue';
import Vuex from 'vuex';

import userService from '@/shared/userService';
import ftbotModule, { BotStoreGetters } from './modules/ftbot';
import alertsModule from './modules/alerts';
import layoutModule from './modules/layout';

const AUTO_REFRESH = 'ft_auto_refresh';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    ping: '',
    loggedIn: userService.loggedIn(),
    autoRefresh: JSON.parse(localStorage.getItem(AUTO_REFRESH) || '{}'),
    isBotOnline: false,
  },
  modules: {
    ftbot: ftbotModule,
    alerts: alertsModule,
    layout: layoutModule,
  },
  mutations: {
    setPing(state, ping) {
      // console.log(ping);
      const now = Date.now();
      state.ping = `${ping.status} ${now.toString()}`;
    },
    setLoggedIn(state, loggedin: boolean) {
      state.loggedIn = loggedin;
    },
    setAutoRefresh(state, newRefreshValue: boolean) {
      state.autoRefresh = newRefreshValue;
    },
    setIsBotOnline(state, isBotOnline: boolean) {
      state.isBotOnline = isBotOnline;
    },
  },
  actions: {
    setAutoRefresh({ commit }, newRefreshValue) {
      commit('setAutoRefresh', newRefreshValue);
      localStorage.setItem(AUTO_REFRESH, JSON.stringify(newRefreshValue));
    },
    setLoggedIn({ commit }, loggedin: boolean) {
      commit('setLoggedIn', loggedin);
    },
    setIsBotOnline({ commit, dispatch }, isOnline) {
      commit('setIsBotOnline', isOnline);
      if (isOnline === false) {
        console.log('disabling autorun');
        dispatch('setAutoRefresh', false);
      }
    },
    refreshOnce({ dispatch }) {
      dispatch('ftbot/getVersion');
    },
    refreshAll({ dispatch }, forceUpdate = false) {
      dispatch('refreshFrequent');
      dispatch('refreshSlow', forceUpdate);
      dispatch('ftbot/getDaily');
      dispatch('ftbot/getBalance');
      /* white/blacklist might be refreshed more often as they are not expensive on the backend */
      dispatch('ftbot/getWhitelist');
      dispatch('ftbot/getBlacklist');
    },
    refreshSlow({ dispatch, commit, getters }, forceUpdate = false) {
      // Refresh data only when needed
      if (forceUpdate || getters[`ftbot/${BotStoreGetters.refreshRequired}`]) {
        dispatch('ftbot/getPerformance');
        dispatch('ftbot/getProfit');
        dispatch('ftbot/getTrades');
        commit('ftbot/updateRefreshRequired', false);
      }
    },
    refreshFrequent({ dispatch }) {
      dispatch('refreshSlow', false);
      // Refresh data that's needed in near realtime
      dispatch('ftbot/getOpenTrades');
      dispatch('ftbot/getState');
      dispatch('ftbot/getLocks');
    },
  },
});
