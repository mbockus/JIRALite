'use strict';

angular.module('mbockus.Jiralite', ['ngAnimate', 'ngRoute','ui.bootstrap.datetimepicker'])

  .constant('version', 'v0.1.0')

  .config(function($locationProvider, $routeProvider) {

    $locationProvider.html5Mode(false);

    $routeProvider
      .when('/', {
        templateUrl: 'views/logwork.html'
      })
      .otherwise({
        redirectTo: '/'
      });

  });

