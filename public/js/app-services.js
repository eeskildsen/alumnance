angular.module('alumnance')
	.factory('Auth', ['Base64', '$cookieStore', '$http', '$location', '$q', function (Base64, $cookieStore, $http, $location, $q) {
			
			var Auth = function() {
				// Set defaults
				this.loginState = 0; // 0 = initialized, 1 = logged in, 2 = logged out, 3 = wrong credentials, 4 = error
				this.user = null;
				
				var credentials = $cookieStore.get('AlumnanceAuthData');
				if (typeof credentials !== 'undefined') {
					$http.defaults.headers.common.Authorization = 'Basic ' + credentials;
					this.loginState = 1;
				}
			};
			
			Auth.prototype.doRouteAuthentication = function() {
				
				var deferred = $q.defer();
				
				if (typeof $cookieStore.get('AlumnanceAuthData') !== 'undefined') {
					deferred.resolve();
				} else {
					deferred.reject();
					$location.path('/login');
				}
				
				return deferred;
			};
			
			Auth.prototype.logIn = function(username, password) {
				this.loginState = 0;
				var self = this;
				
				// Ask the server whether these credentials are valid
				var request = $http.post('alumnance/login', {username: username, password: password});
				request.success(function(data) {
					// Server returns success: true for good credentials
					if (data.success) {
						// Remember that the user is logged in, then redirect
						self.loginState = 1;
						self.setCredentials(username, password);
						$location.path('/');
					} else {
						self.loginState = 3;
					}
				})
				.error(function() {
					self.loginState = 4;
					if (this.loginCallback) {
						this.loginCallback(self.loginState);
					}
				});
				return request.$promise;
			};
			
			Auth.prototype.logOut = function() {
				this.loginState = 2;
				this.user = null;
				this.clearCredentials();
				$location.path('/login');
			};
			
			// Based on code by Stefan Singer
			Auth.prototype.setCredentials = function(username, password) {
				var encoded = Base64.encode(username + ':' + password);
				$http.defaults.headers.common.Authorization = 'Basic ' + encoded;
				$cookieStore.put('AlumnanceAuthData', encoded);
			};
			
			Auth.prototype.clearCredentials = function() {
				document.execCommand("ClearAuthenticationCache");
				$cookieStore.remove('AlumnanceAuthData');
				$http.defaults.headers.common.Authorization = 'Basic ';
			};
			
			Auth.prototype.hasCredentials = function() {
				return $http.defaults.headers.common.Authorization !== 'Basic ';
			};
			
			return new Auth();
		}])
	.factory('Base64', function() {
		// Code by tieTYT
		var keyStr = 'ABCDEFGHIJKLMNOP' +
				'QRSTUVWXYZabcdef' +
				'ghijklmnopqrstuv' +
				'wxyz0123456789+/' +
				'=';
		return {
			encode: function (input) {
				var output = "";
				var chr1, chr2, chr3 = "";
				var enc1, enc2, enc3, enc4 = "";
				var i = 0;

				do {
					chr1 = input.charCodeAt(i++);
					chr2 = input.charCodeAt(i++);
					chr3 = input.charCodeAt(i++);

					enc1 = chr1 >> 2;
					enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
					enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
					enc4 = chr3 & 63;

					if (isNaN(chr2)) {
						enc3 = enc4 = 64;
					} else if (isNaN(chr3)) {
						enc4 = 64;
					}

					output = output +
							keyStr.charAt(enc1) +
							keyStr.charAt(enc2) +
							keyStr.charAt(enc3) +
							keyStr.charAt(enc4);
					chr1 = chr2 = chr3 = "";
					enc1 = enc2 = enc3 = enc4 = "";
				} while (i < input.length);

				return output;
			},

			decode: function (input) {
				var output = "";
				var chr1, chr2, chr3 = "";
				var enc1, enc2, enc3, enc4 = "";
				var i = 0;

				// remove all characters that are not A-Z, a-z, 0-9, +, /, or =
				var base64test = /[^A-Za-z0-9\+\/\=]/g;
				if (base64test.exec(input)) {
					alert("There were invalid base64 characters in the input text.\n" +
							"Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
							"Expect errors in decoding.");
				}
				input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

				do {
					enc1 = keyStr.indexOf(input.charAt(i++));
					enc2 = keyStr.indexOf(input.charAt(i++));
					enc3 = keyStr.indexOf(input.charAt(i++));
					enc4 = keyStr.indexOf(input.charAt(i++));

					chr1 = (enc1 << 2) | (enc2 >> 4);
					chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
					chr3 = ((enc3 & 3) << 6) | enc4;

					output = output + String.fromCharCode(chr1);

					if (enc3 != 64) {
						output = output + String.fromCharCode(chr2);
					}
					if (enc4 != 64) {
						output = output + String.fromCharCode(chr3);
					}

					chr1 = chr2 = chr3 = "";
					enc1 = enc2 = enc3 = enc4 = "";

				} while (i < input.length);

				return output;
			}
		};
	});