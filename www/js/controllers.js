angular
	.module("minder.controllers", ["ionic", "minder.services"])
	/*
Controller for the discover page
*/
	.controller("DiscoverCtrl", function(
		$scope,
		$ionicLoading,
		$timeout,
		User,
		Recommendations
	) {
		//helper functions for loading & hiding
		var showLoading = function() {
			$ionicLoading.show({
				template: '<i class="ion-loading-c"></i>',
				noBackdrop: true
			});
		};

		var hideLoading = function() {
			$ionicLoading.hide();
		};

		// set loading to true first time while we retrieve songs from server
		showLoading();

		//init song
		Recommendations.init()
			.then(function() {
				$scope.currentSong = Recommendations.queue[0];
				return Recommendations.playCurrentSong();
			})
			.then(function() {
				// turn loading off
				hideLoading();
				$scope.currentSong.loaded = true;
			});

		// fired when we favorite/skip a song
		$scope.sendFeedback = function(bool) {
			// Add to favorites if they are favorited
			if (bool) User.addSongToFavorites($scope.currentSong);

			// set variable for correct animation sequence
			$scope.currentSong.rated = bool;
			$scope.currentSong.hide = true;

			// prepare the next song
			Recommendations.nextSong();

			// update current song in scope
			$timeout(function() {
				$scope.currentSong = Recommendations.queue[0];
				$scope.currentSong.loaded = false;
			}, 250);

			Recommendations.playCurrentSong().then(function() {
				$scope.currentSong.loaded = true;
			});
		};

		// used for retrieving the next albulm image
		// if there isn't any albulm image available next, return an empty string
		$scope.nextAlbumImg = function() {
			if (Recommendations.queue.length > 1) {
				return Recommendations.queue[1].image_large;
			}

			return "";
		};
	})
	/*
Controller for the favorites page
*/
	.controller("FavoritesCtrl", function($scope, $window, User) {
		// get list of our favorites from user service
		$scope.favorites = User.favorites;

		// Remove song from favorites
		$scope.removeSong = function(song, index) {
			User.removeSongFromFavorites(song, index);
		};

		// Open song from favorites [Spotify]
		$scope.openSong = function(song) {
			$window.open(song.open_url, "_system");
		};
	})
	/*
Controller for our tab bar
*/
	.controller("TabsCtrl", function($scope, User, Recommendations) {
		// stop audio when going to favorites page
		$scope.enteringFavorites = function() {
			User.newFavorites = 0; // reset new favorites to 0 when fav tab clicked
			Recommendations.haltAudio();
		};

		$scope.leavingFavorites = function() {
			Recommendations.init();
		};

		// Number of new favorites
		$scope.favCount = User.favoriteCount;
	});
