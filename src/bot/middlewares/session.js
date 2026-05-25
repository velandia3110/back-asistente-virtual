const { session } = require('grammy');

function getInitialSessionData() {
  return {
    leadData: {},
    pqrsData: {},
    step: null,
  };
}

const sessionMiddleware = session({ initial: getInitialSessionData });

module.exports = sessionMiddleware;