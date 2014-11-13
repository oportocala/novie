var sound = function () {
	var base = 'http://vladgoran.ro/games/novie/';
	var sounds = {
		impact: new Howl({
			urls: [base + 'sounds/impact.mp3'],
			volume: 0.5
		}),
		death: new Howl({
			urls: [base + 'sounds/death.mp3'],
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