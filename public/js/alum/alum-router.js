'use strict';

angular.module('alumnance')
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/alums', {
        templateUrl: 'views/alum/alums.html',
        controller: 'AlumController',
        resolve:{
          resolvedAlum: ['Alum', function (Alum) {
            return Alum.query();
          }],
		  resolvedSchools: ['School', function(School) {
			return School.query();
		  }]
        }
      })
    }]);
