// Declare app level module which depends on filters, and services
angular.module('alumnance', ['ngResource', 'ngRoute', 'ngAnimate', 'angularUtils.directives.dirPagination', 'ui.bootstrap', 'ui.date', 'angularFileUpload'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/home/home.html', 
        controller: 'HomeController'})
      .otherwise({redirectTo: '/'});
  }])
  .directive('slideToggleNextSibling', function() {
	return {
		restrict: 'A',
		replace: false,
		link: function(scope, element, attrs) {
			$(element).css({'cursor': 'pointer'});
			$(element).click(function() {
				$(element).next().slideToggle();
			});
		}
	}
  });