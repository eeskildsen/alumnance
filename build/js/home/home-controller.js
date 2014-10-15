angular.module('alumnance')
  .controller('HomeController', ['$scope', '$upload', function ($scope, $upload) {
    
	$scope.progress = 0;
	$scope.state = 0; // 0 = normal, 1 = uploading, 2 = finished
	$scope.isFinished = false;
	$scope.message = '';
	$scope.isErrorMessage = false;
	
	$scope.onFileSelect = function($files) {
		$scope.state = 1;
		$scope.upload = $upload.upload({
			'url': '/alumnance/upload',
			file: $files[0]
		})
		.progress(function(evt) {
			$scope.progress = 100 * evt.loaded / evt.total;
		})
		.success(function(data, status, headers, config) {
			$scope.message = data.message;
			$scope.isErrorMessage = false;
			$scope.state = 2;
		})
		.error(function(data, status, headers, config) {
			$scope.message = data.message;
			$scope.isErrorMessage = true;
			$scope.state = 2;
		});
	}
  }]);
