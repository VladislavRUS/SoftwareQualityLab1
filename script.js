var maxChildren = 6,
    N = 200,
    R = 100,
    constantAmount = false;

var trees = [];
var network;

function Tree(layers) {
    this.layers = layers;
}

Tree.prototype.countAlpha = function() {
    return (this.getVertexes() / this.getLeaves()).toFixed(2);
};

Tree.prototype.getLeaves = function() {
    var leaves = 0;
    this.layers.forEach(function(layer) {
        layer.vertices.forEach(function(v) {
            leaves += v.childrenAmount > 0 ? 0 : 1;
        });
    });
    return leaves;
};

Tree.prototype.getVertexes = function() {
    var vertexes = 0;
    this.layers.forEach(function(layer) {
        layer.vertices.forEach(function() {
            vertexes++;
        });
    });
    return vertexes;
};

Tree.prototype.getLayers = function() {
    return this.layers.length;
};

Tree.prototype.makeHistogram = function() {
    var histogram = [];

    for (var i = 0; i < maxChildren; i++) {
        histogram[i] = 0;
    }

    this.layers.forEach(function(layer) {
        layer.vertices.forEach(function(v) {
            histogram[v.childrenAmount]++;
        });
    });
    return histogram;
};

Tree.prototype.getAverageEdgeAmount = function() {
    var vertexesWithChildren = 0;
    this.layers.forEach(function(layer) {
        layer.vertices.forEach(function(v) {
            vertexesWithChildren += v.childrenAmount > 0 ? 1 : 0;
        });
    });

    var allEdges = this.getVertexes() - 1;
    return allEdges / vertexesWithChildren;
};

Tree.prototype.fillTable = function() {
    var verticesDiv = document.getElementById('vertices');
    var leavesDiv = document.getElementById('leaves');

    verticesDiv.innerHTML += '<h2> Количество: ' + this.getVertexes() + '</h2>';
    leavesDiv.innerHTML += '<h2> Количество: ' + this.getLeaves() + '</h2>';

    this.layers.forEach(function(layer, ind) {

        verticesDiv.innerHTML += '<h3> Уровень: ' + ind + '</h3>';
        leavesDiv.innerHTML += '<h3> Уровень: ' + ind + '</h3>';

        layer.vertices.forEach(function(vertex) {

            verticesDiv.innerHTML += vertex.name + '; ';

            if (vertex.childrenAmount == 0) {
                leavesDiv.innerHTML += vertex.name + '; ';
            }
        });

    });
};

Tree.prototype.fillNetwork = function() {
    if (network != null || network!= undefined) {
        network.destroy();
        network = null;
    }

    var nodesDataSet = [];
    var edgesDataSet = [];
    var nodeCnt = 0;

    here:
        for (var i = 0; i < this.layers.length; i++) {
            var vertices = this.layers[i].vertices;
            for (var j = 0; j < vertices.length; j++) {
                var v = vertices[j];

                nodesDataSet.push({
                    id: v.index,
                    label: v.name
                });
                edgesDataSet.push({
                    from: v.index,
                    to: v.parent
                });
                nodeCnt++;
                if (nodeCnt == 20) {
                    break here;
                }
            }
        }

    var container = document.getElementById('mynetwork');
    container.width = window.innerWidth;

    var data = {
        nodes: new vis.DataSet(nodesDataSet),
        edges: new vis.DataSet(edgesDataSet)
    };

    var options = {
        layout: {
            randomSeed: 1,
            hierarchical: {
                enabled: true,
                levelSeparation: 150,
                nodeSpacing: 100,
                treeSpacing: 200,
                parentCentralization: true,
                sortMethod: 'directed',
                direction: 'DU',
                blockShifting: false
            }
        }
    };
    network = new vis.Network(container, data, options);
};

function Vertex(parent, index) {
    this.parent = parent;
    this.index = index;
    this.name = this.index + ' - ' + this.parent;
    this.childrenAmount = 0;
}

Vertex.prototype.generateChildren = function (vCnt) {
    var childrenAmount = constantAmount ? maxChildren - 1 : Math.floor(Math.random() * maxChildren);
    this.childrenAmount = childrenAmount;

    var children = [];
    for (var i = 0; i < childrenAmount; i++) {
        var v = new Vertex(this.index, ++vCnt.cnt);
        children.push(v);
    }
    return children;
};

function Layer() {
    this.vertices = [];
}

function createTree(treeNumber) {
    var layers = [];
    var firstLayer = new Layer();
    firstLayer.vertices.push(new Vertex(0, 1));
    layers.push(firstLayer);

    var numberExceed = false;
    var interrupted = false;
    var layerCnt = 0;

    var globalCnt = 0;

    var vertexCounter = {
        cnt: 1
    };

    var tree = new Tree();

    console.log('Starting constructing...');
    do {
        var prevLayer = layers[layerCnt++];
        var nextLayer = new Layer();

        console.log('Took layer: ' + (layerCnt - 1));

        if (prevLayer.vertices.length == 0) {
            console.log('No vertices in last layer');

            if (globalCnt < 10) {
                console.log('Interrupt!');
                interrupted = true;

            } else {
                layers.splice(layers.length - 1, 1);
                tree.layers = layers;
                trees.push(tree);
                interrupted = true;
            }

        } else {
            console.log('It contains : ' + prevLayer.vertices.length + ' vertices');
            prevLayer.vertices.forEach(function (vertex) {
                var children = vertex.generateChildren(vertexCounter);
                console.log('Generated children: ' + children.length);
                nextLayer.vertices = nextLayer.vertices.concat(children);
                globalCnt += children.length;
            });
            layers.push(nextLayer);
            console.log('Global cnt: ' + globalCnt);
            if (globalCnt > N) {
                numberExceed = true;
            }
        }

    } while (!(numberExceed || interrupted));

    if (!interrupted) {
        console.log('Finished tree with index: ' + treeNumber);
        tree.layers = layers;
        trees.push(tree);

    } else {
        console.log('Tree was interrupted at first stage')
    }
}

function start() {
    document.getElementById('total').innerHTML = '';
    document.getElementById('info').innerHTML = '';
    document.getElementById('vertices').innerHTML = '<h1>Вершины</h1>';
    document.getElementById('leaves').innerHTML = '<h1>Висячие вершины</h1>';
    document.getElementById('all').innerHTML = '<h1>Вывод деревьев</h1>';
    document.getElementById('histogram').innerHTML = '<h1> Гистограмма ребер </h1>';

    var localR = document.getElementById('R').value;
    var localN = document.getElementById('N').value;
    var localM = document.getElementById('m').value;

    constantAmount = document.getElementById('random').checked;

    if (localR && localN && localM) {
        R = localR;
        N = localN;
        maxChildren = localM;
    }

    document.getElementById('info').innerHTML = 'Параметры генерации: N = ' + N + ', R = ' + R + ', m = ' + maxChildren;

    trees = [];

    for (var i = 0; i < R; i++) {
        createTree(i);
    }

    console.log("Amount of trees generated: " + trees.length);

    if (trees.length == 0) {
        alert('Ни одно дерево не было сгенерировано!');

    } else {
        var mathExp = (trees.map(function(tree) {
                return parseFloat(tree.countAlpha());

            }).reduce(function(sum, current) {
                return sum + current;

            })) / trees.length;

        var averageLeaves = trees.map(function(tree) {
                return tree.getLeaves();

            }).reduce(function(sum, current) {
                return sum + current;
            }) / trees.length;


        console.log('Average alpha: ' + mathExp);
        console.log('Average leaves: ' + averageLeaves);

        var randomTree = Math.floor(Math.random() * trees.length);
        document.getElementById('tree').innerHTML = '<h2> Количество деревьев, которые смогли: ' + trees.length + '. Вывод для дерева с индексом: ' + randomTree + '</h2>';
        trees[randomTree].fillNetwork();
        trees[randomTree].fillTable();

        var histogram = trees[randomTree].makeHistogram();
        histogram.forEach(function(val, ind) {
            document.getElementById('histogram').innerHTML += ' <br> Количество ребер: ' + ind + ', значение: ' + val;
        });

/*
        var edges = trees[randomTree].getVertexes() - 1;

        histogram = histogram.map(function(val, ind) {
            var possibility = (val / edges).toFixed(2);
            console.log(possibility);
            return (ind * possibility);
        });
*/

        document.getElementById('histogram').innerHTML += '<br> Среднее количество исходящих ребер: ' + (trees[randomTree].getAverageEdgeAmount()).toFixed(2);

        trees.forEach(function(tree, ind) {
            document.getElementById('all').innerHTML += '<br> <span> Дерево: ' + ind + ', альфа: ' + tree.countAlpha() + ', количество вершин: ' + tree.getVertexes() + ', висячих: ' + tree.getLeaves() + ', высота: ' + tree.getLayers() + '</span> <br>';
        });
        document.getElementById('total').innerHTML = '<h2> Среднее альфа: ' + mathExp.toFixed(2) + '. Среднее количество висячих листьев: ' + Math.floor(averageLeaves) + '</h2>';
        document.getElementById('total').innerHTML += '<h2> Альфа по формуле (m - 1) / (m - 2): ' + ((maxChildren - 1) / (maxChildren - 2)).toFixed(2) + '</h2>';
    }
}