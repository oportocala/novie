var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementsByClassName('scene-wrapper').item(0).appendChild(renderer.domElement);

var usePerspective = true;

if (usePerspective) {
	var camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 1000 );
	camera.position.x = 60;
	camera.position.y = 80;
	camera.position.z = 0;

	camera.lookAt(scene.position);
} else {
	var aspect = window.innerWidth / window.innerHeight;
	var d = 20;
	camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
	camera.position.x = d;
	camera.position.y = d;
	camera.position.z = 0;

	camera.lookAt(scene.position);
}


var updateFcts = [];
var worldX = new THREEx.CannonWorld().start();

var stoneMaterial = new CANNON.Material('stone');
worldX.world.addContactMaterial(new CANNON.ContactMaterial(
	stoneMaterial,
	stoneMaterial,
	0.1, // friction
	0.1	// Restitution
));


var generateSphere = function (color, y, name) {
	var geometry = new THREE.SphereGeometry(1, 10, 10);
	var material = new THREE.MeshBasicMaterial({color: color || 0x00000, wireframe: true});
	var mesh = new THREE.Mesh(geometry, material);

	mesh.position.y = y;
	mesh.isSphere = true;
	scene.add(mesh);


	var physicsBody = new THREEx.CannonBody({
		mesh: mesh,
		material: stoneMaterial,
		mass: 100
	}).addTo(worldX);

	mesh.name = physicsBody.name = name;

	physicsBody.body.addEventListener("collide", function (e) {
		if (e.with.userData.object3d.isSphere) {
			console.log(e.with.userData.object3d.name, 'collided with', name);
			sound.play('impact');
		}
	});

	updateFcts.push(function (delta, now) {
		physicsBody.update(delta, now)
	});

	//physicsBody.body.angularVelocity.set(0,0,20);


	return physicsBody;
};


var plane = function generatePlane() {


	var planeSize = 50;
	var geometry = new THREE.CubeGeometry(planeSize, 1, planeSize, 1, 1, 1);
	var material = new THREE.MeshBasicMaterial({color: 0xffffff});

	var mesh = new THREE.Mesh(geometry, material);

	mesh.position.y = -.5;

	scene.add(mesh);


	var physicsBody = new THREEx.CannonBody({
		mesh: mesh,
		material: stoneMaterial,
		mass: 0
	})
		.addTo(worldX);


	updateFcts.push(function (delta, now) {
		physicsBody.update(delta, now);
	});

	physicsBody.body.addEventListener("collide", function (e) {
		if (e.with.userData.object3d.isSphere) {
			console.log(e.with.userData.object3d.name, 'collided with', name);
			//sound.play('impact');
		}
	});

	return physicsBody;
}();

var token = function () {
	var geometry = new THREE.CubeGeometry(2, 2, 2, 2, 2, 2);
	var material = new THREE.MeshBasicMaterial({color: 0x000000, wireframe: true});
	var mesh = new THREE.Mesh(geometry, material);

	mesh.position.y = 1.5;
	mesh.position.x = 5;
	mesh.position.z = 5;

	scene.add(mesh);


	var physicsBody = new THREEx.CannonBody({
		mesh: mesh,
		mass: 0
	})
		.addTo(worldX);


	updateFcts.push(function (delta, now) {
		//physicsBody.update(delta, now);
		mesh.rotation.y += .1;
	});
	var name = 'token';
	mesh.name = physicsBody.name = name;
	physicsBody.body.addEventListener("collide", function (e) {
		if (e.with.userData.object3d.isSphere) {
			console.log(e.with.userData.object3d.name, 'collided with', name);
			sound.play('token');
		}
	});

	return physicsBody;
}();

var cameraTarget = token;

var keyboard = new THREEx.KeyboardState(renderer.domElement);
renderer.domElement.setAttribute("tabIndex", "0");
renderer.domElement.focus();

var generateControls = function (target, keys) {
	return function () {
		var speed = 20;
		if (keyboard.pressed(keys.left)) {
			target.body.angularVelocity.x = speed;
		} else if (keyboard.pressed(keys.right)) {
			target.body.angularVelocity.x = -speed;
		} else {
			target.body.angularVelocity.x = 0;
		}

		if (keyboard.pressed(keys.up)) {
			target.body.angularVelocity.z = speed;
		} else if (keyboard.pressed(keys.down)) {
			target.body.angularVelocity.z = -speed;
		} else {
			target.body.angularVelocity.z = 0;
		}
	}
};

var redSphere;
var blueSphere;

var initScene = function () {
	redSphere = generateSphere(0xff0000, 5, 'red');
	blueSphere = generateSphere(0x0000ff, 2, 'blue');

	updateFcts.push(generateControls(redSphere, {left: 'left', right: 'right', up: 'up', down: 'down'}));
	updateFcts.push(generateControls(blueSphere, {left: 'a', right: 'd', up: 'w', down: 's'}));
};


initScene();




var sphereDied = function (target) {
	target.isDead = true;
	console.log(target.name, 'died');
	sound.play('death');
	resetScene();
};

var resetScene = function () {
	resetSphere(redSphere);
	resetSphere(blueSphere);
};

var resetSphere = function (target) {
	target.body.position.x = target.body.initPosition.x;
	target.body.position.y = target.body.initPosition.y;
	target.body.position.z = target.body.initPosition.z;

	target.body.velocity.x = 0;
	target.body.velocity.y = 0;
	target.body.velocity.z = 0;
};


var deathY = -30;

updateFcts.push(function () {

	if (blueSphere.body.position.y < deathY && !blueSphere.isDead) {
		sphereDied(blueSphere);
	}

	if (redSphere.body.position.y < deathY && !redSphere.isDead) {
		sphereDied(redSphere);
	}

});


updateFcts.push(function () {

	if (cameraTarget) {
		//camera.lookAt(cameraTarget.mesh.position);
	}

	renderer.render(scene, camera);
});

// only on keyup
keyboard.domElement.addEventListener('keyup', function (event) {
	if (keyboard.eventMatches(event, 'r')) {
		document.location = '?';
	}
});

var animate = function animate(nowMs) {
	// keep looping
	requestAnimationFrame(animate);

	// measure time
	lastTimeMs = lastTimeMs || nowMs - 1000 / 60;
	var deltaMs = Math.min(200, nowMs - lastTimeMs);
	lastTimeMs = nowMs;


	// call each update function
	updateFcts.forEach(function (updateFn) {
		updateFn(deltaMs / 1000, nowMs / 1000);
	})
};

var lastTimeMs = null;
requestAnimationFrame(animate);