'use strict';

/**
 * Rhizome - The API that feeds grassroots movements
 *
 * @file bootstrap.js
 * @description
 * @module Config
 * @author Chris Bates-Keegan
 *
 */

const Rest = require('./bootstrap-rest');
const Socket = require('./bootstrap-socket');

/* ********************************************************************************
 *
 * EXPORTS
 *
 **********************************************************************************/
module.exports = {
  rest: Rest.init,
  socket: Socket.init
};
