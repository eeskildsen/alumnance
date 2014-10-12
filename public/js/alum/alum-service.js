'use strict';

angular.module('alumnance')
  .factory('Alum', ['$resource', function ($resource) {
    return $resource('alumnance/alums/:id', {}, {
      'query': { method: 'GET', isArray: true},
      'get': { method: 'GET'},
      'update': { method: 'PUT'}
    });
  }]);
