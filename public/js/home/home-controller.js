angular.module('alumnance')
  .controller('HomeController', ['$scope', '$upload', function ($scope, $upload) {
    $scope.progress = 0;
	$scope.onFileSelect = function($files) {
		$scope.upload = $upload.upload({
			'url': '/alumnance/upload',
			file: $files[0]
		})
		.progress(function(evt) {
			$scope.progress = 100 * evt.loaded / evt.total;
		})
		.success(function(data, status, headers, config) {
		});
	}
  }]);
