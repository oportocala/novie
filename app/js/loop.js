var render = function () {
	requestAnimationFrame( render );

	/*GEOM.plane.position.y = 0;
	GEOM.shpere.position.y = -10;*/

	GEOM.update();

	renderer.render(scene, camera);
};

render();