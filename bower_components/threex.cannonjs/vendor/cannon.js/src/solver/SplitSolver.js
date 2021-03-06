CANNON.SplitSolver = function(subsolver){
    CANNON.Solver.call(this);
    this.subsolver = subsolver;
};
CANNON.SplitSolver.prototype = new CANNON.Solver();

// Returns the number of subsystems
var SplitSolver_solve_nodes = []; // All allocated node objects
var SplitSolver_solve_eqs = [];   // Temp array
var SplitSolver_solve_bds = [];   // Temp array
var SplitSolver_solve_dummyWorld = {bodies:null}; // Temp object
CANNON.SplitSolver.prototype.solve = function(dt,world){
    var nodes=SplitSolver_solve_nodes,
        bodies=world.bodies,
        equations=this.equations,
        Neq=equations.length,
        Nbodies=bodies.length,
        subsolver=this.subsolver;
    // Create needed nodes, reuse if possible
    for(var i=nodes.length; i!==Nbodies; i++){
        nodes.push({ body:bodies[i], children:[], eqs:[], visited:false });
    }

    // Reset node values
    for(var i=0; i!==Nbodies; i++){
        var node = nodes[i];
        node.body = bodies[i];
        node.children.length = 0;
        node.eqs.length = 0;
        node.visited = false;
    }
    for(var k=0; k!==Neq; k++){
        var eq=equations[k],
            i=bodies.indexOf(eq.bi),
            j=bodies.indexOf(eq.bj),
            ni=nodes[i],
            nj=nodes[j];
        ni.children.push(nj);
        ni.eqs.push(eq);
        nj.children.push(ni);
        nj.eqs.push(eq);
    }

    var STATIC = CANNON.Body.STATIC;
    function getUnvisitedNode(nodes){
        var Nnodes = nodes.length;
        for(var i=0; i!==Nnodes; i++){
            var node = nodes[i];
            if(!node.visited && !(node.body.motionstate & STATIC)){
                return node;
            }
        }
        return false;
    }

    function bfs(root,visitFunc){
        var queue = [];
        queue.push(root);
        root.visited = true;
        visitFunc(root);
        while(queue.length) {
            var node = queue.pop();
            // Loop over unvisited child nodes
            var child;
            while((child = getUnvisitedNode(node.children))) {
                child.visited = true;
                visitFunc(child);
                queue.push(child);
            }
        }
    }

    var child, n=0, eqs=SplitSolver_solve_eqs, bds=SplitSolver_solve_bds;
    function visitFunc(node){
        bds.push(node.body);
        var Neqs = node.eqs.length;
        for(var i=0; i!==Neqs; i++){
            var eq = node.eqs[i];
            if(eqs.indexOf(eq) === -1){
                eqs.push(eq);
            }
        }
    }
    var dummyWorld = SplitSolver_solve_dummyWorld;
    while((child = getUnvisitedNode(nodes))){
        eqs.length = 0;
        bds.length = 0;
        bfs(child,visitFunc);

        var Neqs = eqs.length;
        for(var i=0; i!==Neqs; i++){
            subsolver.addEquation(eqs[i]);
        }

        dummyWorld.bodies = bds;
        var iter = subsolver.solve(dt,dummyWorld);
        subsolver.removeAllEquations();
        n++;
    }

    return n;
};
