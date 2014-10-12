'use strict';

angular.module('alumnance')
  .factory('Attendance', ['$resource', function ($resource) {
    return $resource('alumnance/attendances/:id', {}, {
      'query': { method: 'GET', isArray: true},
      'get': { method: 'GET'},
      'update': { method: 'PUT'}
    });
  }]);
