'use strict';

/**
 * Rhizome - The API that feeds grassroots movements
 *
 * @file boostrap-rest.js
 * @description
 * @module Config
 * @author Chris Bates-Keegan
 *
 */

const path = require('path');
const fs = require('fs');
const os = require('os');
const cluster = require('cluster');
const express = require('express');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const Config = require('./config');
const Model = require('./model');
const Routes = require('./routes');
const Logging = require('./logging');
const MongoClient = require('mongodb').MongoClient;

/* ********************************************************************************
 *
 *
 *
 **********************************************************************************/
const processes = os.cpus().length;
const _workers = [];

/* ********************************************************************************
 *
 * WORKERS
 *
 **********************************************************************************/
const __spawnWorkers = () => {
  Logging.log(`Spawning ${processes} REST Workers`);

  const __spawn = idx => {
    _workers[idx] = cluster.fork();
  };

  for (let x = 0; x < processes; x++) {
    __spawn(x);
  }
};

/* ********************************************************************************
 *
 * INSTALL
 *
 **********************************************************************************/
const __systemInstall = () => {
  return Model.Organisation.find({})
    .then(orgs => {
      if (orgs.length > 0) {
        return Promise.resolve(true); // If any organisations, assume we've got a Super Admin app
      }
      return Model.Organisation.add({
        name: 'Coders for Labour',
        type: Model.Constants.Organisation.Type.POLITICAL
      });
    })
    .then(org => {
      if (org === true) {
        Logging.log('ORGANISATION EXISTED', Logging.Constants.LogLevel.SILLY);
        return Promise.resolve(true);
      }

      Logging.log('ORGANISATION ADDED', Logging.Constants.LogLevel.DEBUG);
      Logging.log(org.id, Logging.Constants.LogLevel.DEBUG);

      return Model.Group.add({
        name: 'Rhizome Admin',
        type: Model.Constants.Group.Type.VOLUNTEERS,
        orgId: org.id
      });
    })
    .then(group => {
      if (group === true) {
        Logging.log('GROUP EXISTED', Logging.Constants.LogLevel.SILLY);
        return Promise.resolve(true);
      }
      Logging.log('GROUP ADDED', Logging.Constants.LogLevel.DEBUG);
      Logging.log(group.id, Logging.Constants.LogLevel.DEBUG);

      return Model.App.add({
        name: 'Rhizome ADMIN',
        type: Model.Constants.App.Type.SERVER,
        authLevel: Model.Constants.Token.AuthLevel.SUPER,
        permissions: [{route: '*', permission: '*'}],
        domain: '',
        ownerGroupId: group.id
      });
    })
    .then(res => {
      if (res === true) {
        Logging.log('APP EXISTED', Logging.Constants.LogLevel.SILLY);
        return Promise.resolve(true);
      }
      Logging.log('APP ADDED', Logging.Constants.LogLevel.DEBUG);
      Logging.log(res.app.id, Logging.Constants.LogLevel.DEBUG);
      return new Promise((resolve, reject) => {
        let pathName = path.join(Config.appDataPath, 'super.json');
        let app = Object.assign(res.app.details, {token: res.token.value});
        fs.writeFile(pathName, JSON.stringify(app), err => {
          if (err) {
            return reject(err);
          }
          Logging.log(`Written ${pathName}`, Logging.Constants.LogLevel.VERBOSE);
          Logging.log(app, Logging.Constants.LogLevel.SILLY);

          resolve(true);
        });
      });
    });
};

/* ********************************************************************************
 *
 * MONGODB
 *
 **********************************************************************************/
const __nativeMongoConnect = app => {
  return new Promise((resolve, reject) => {
    const mongoUrl = `mongodb://${Config.mongoDb.url}/${Config.app.code}-${Config.env}`;
    MongoClient.connect(mongoUrl, (err, db) => {
      if (err) throw err;
      Model.init(db);
      resolve();
    });
  });
};

/* ********************************************************************************
 *
 * WORKER
 *
 **********************************************************************************/
const __initWorker = () => {
  let app = express();
  app.use(morgan('short'));
  app.enable('trust proxy', 1);
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(methodOverride());
  app.use(express.static(`${Config.appDataPath}/public`));

  return __nativeMongoConnect()
    .then(() => {
      let tasks = [
        Routes.init(app),
        __systemInstall()
      ];

      app.listen(Config.listenPort);

      return Promise.all(tasks);
    })
    .catch(Logging.Promise.logError());
};

/* ********************************************************************************
 *
 * MASTER
 *
 **********************************************************************************/
const __initMaster = () => {
  const isPrimary = Config.rest.app === 'primary';
  if (isPrimary) {
    Logging.logDebug(`Primary Master REST`);
  }

  __spawnWorkers();

  return Promise.resolve();
};

/* ********************************************************************************
 *
 * RHIZOME REST
 *
 **********************************************************************************/
const _initRestApp = () => {
  Logging.setLogApp('rest');

  let p = null;
  if (cluster.isMaster) {
    p = __initMaster();
  } else {
    p = __initWorker();
  }

  return p.then(() => cluster.isMaster);
};

/* ********************************************************************************
 *
 * EXPORTS
 *
 **********************************************************************************/
module.exports = {
  init: _initRestApp
};
