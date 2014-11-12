var sound = function () {
	var sounds = {
		impact: new Howl({
			urls: ['sounds/impact.mp3'],
			volume: 0.5
		}),
		death: new Howl({
			urls: ['sounds/death.mp3'],
			volume: 0.5
		}),
		token: new Howl({
			urls: ['sounds/token.mp3'],
			volume: 0.5
		})
	};

	return {
		play: function (id) {
			if (sounds[id]) {
				return sounds[id].play();
			}
			return false;
		}
	};
}();