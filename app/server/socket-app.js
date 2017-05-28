'use strict';

/**
 * Rhizome - The API that feeds grassroots movements
 *
 * @file app.js
 * @description
 * @module System
 * @author Chris Bates-Keegan
 *
 */

const express = require('express');
const Config = require('./config');
const Logging = require('./logging');
const Bootstrap = require('./bootstrap');

/**
 * Configuration
 */
const configureDevelopment = () => {
};

const configureProduction = () => {
};

const configureTest = () => {
};

const configureApp = env => {
  switch (env) {
    default:
    case 'dev':
      configureDevelopment();
      break;
    case 'prod':
      configureProduction();
      break;
    case 'test':
      configureTest();
      break;
  }
};

configureApp(Config.env);

/**
 *
 */

Bootstrap
  .socket(express)
  .then(isMaster => {
    if (isMaster) {
      Logging.log(`${Config.app.title} Socket Master v${Config.app.version} listening on port ` +
        `${Config.socket.listenPort} in ${Config.env} mode.`);
    } else {
      Logging.log(`${Config.app.title} Socket Worker v${Config.app.version} in ${Config.env} mode.`);
    }
  })
  .catch(Logging.Promise.logError());
