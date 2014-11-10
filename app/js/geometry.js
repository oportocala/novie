var GEOM = (function (cam) {



	var sphere = function () {
		var geometry = new THREE.SphereGeometry(1, 1, 1)
		var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
		var sphere = new THREE.Mesh( geometry, material );
		scene.add( sphere );

		return sphere;
	}();


	var plane = function () {

		var geom = new THREE.PlaneGeometry(1000, 1000, 1, 1);
		var material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
		var plane = new THREE.Mesh( geom, material );


		scene.add(plane);
		return plane;
	}();




	cam.position.z = 5;


	return {
		update: function () {
			sphere.rotation.x += .1;
		},
		plane: plane,
		sphere: sphere
	}
})(camera);