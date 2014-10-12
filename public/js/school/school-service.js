'use strict';

angular.module('alumnance')
  .factory('School', ['$resource', function ($resource) {
    return $resource('alumnance/schools/:id', {}, {
      'query': { method: 'GET', isArray: true},
      'get': { method: 'GET'},
      'update': { method: 'PUT'}
    });
  }]);
