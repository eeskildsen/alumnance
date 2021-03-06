// Declare app level module which depends on filters, and services
angular.module('alumnance', ['ngResource', 'ngRoute', 'ngAnimate', 'ngCookies', 'angularUtils.directives.dirPagination', 'ui.bootstrap', 'ui.date', 'angularFileUpload'])
  .config(['$httpProvider', function($httpProvider) {
    
    $httpProvider.interceptors.push('loadingInterceptor');
    
    $httpProvider.defaults.transformRequest.push(function(data, headersGetter) {
        $('#loading').fadeIn();
        return data;
    });
    
  }])
  .factory('loadingInterceptor', ['$q', function($q) {
    return {
        'response': function(response) {
            $('#loading').fadeOut();
            return response;
        },
        'responseError': function(rejection) {
            $('#loading').fadeOut();
            return $q.reject(rejection);
        }
    };
  }])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/home/home.html', 
        controller: 'HomeController',
		resolve: { auth: ['Auth', function(Auth) { return Auth.doRouteAuthentication(); }] }
	  })
	  .when('/login', {
		templateUrl: 'views/login/login.html',
		controller: 'LoginController',
		resolve: { auth: ['Auth', function(Auth) { return Auth.doRouteAuthentication(); }] }
      })
      .otherwise({redirectTo: '/'});
  }])
  .directive('slideToggleParentsNextSibling', function() {
	return {
		restrict: 'A',
		replace: false,
		link: function(scope, element, attrs) {
			$(element).css({'cursor': 'pointer'});
			$(element).click(function() {
				$(element).parent().next().slideToggle();
			});
		}
	}
  });