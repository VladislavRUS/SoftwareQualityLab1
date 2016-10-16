var maxChildren = 6,
    N = 200,
    R = 100,
    constantAmount = false,
    aVariant = false;

var trees = [];
var network;

function Tree(layers) {
    this.layers = layers;
}

Tree.prototype.countAlpha = function () {
    return (this.getVertexes() / this.getLeaves()).toFixed(2);
};

Tree.prototype.getLeaves = function () {
    var leaves = 0;
    this.layers.forEach(function (layer) {
        layer.vertices.forEach(function (v) {
            leaves += v.childrenAmount > 0 ? 0 : 1;
        });
    });
    return leaves;
};

Tree.prototype.getLeavesArray = function () {
    var leaves = [];
    this.layers.forEach(function (layer) {
        layer.vertices.forEach(function (v) {
            if (v.childrenAmount == 0) {
                leaves.push(v);
            }
        });
    });
    return leaves;
};


Tree.prototype.getVertexes = function () {
    var vertexes = 0;
    this.layers.forEach(function (layer) {
        layer.vertices.forEach(function () {
            vertexes++;
        });
    });
    return vertexes;
};

Tree.prototype.getVertexesArray = function () {
    var vertexes = [];
    this.layers.forEach(function (layer) {
        layer.vertices.forEach(function (vertex) {
            vertexes.push(vertex);
        });
    });
    return vertexes;
};

Tree.prototype.getLayers = function () {
    return this.layers.length;
};

Tree.prototype.makeHistogram = function () {
    var self = this.layers;

    var histogram = [];

    for (var i = 0; i < maxChildren; i++) {
        histogram[i] = 0;
    }

    for (var i = 0; i < this.layers.length; i++) {
        var vertices = this.layers[i].vertices;

        for (var j = 0; j < vertices.length; j++) {
            if (vertices[j].processed) {
                histogram[vertices[j].childrenAmount]++;
            }
        }
    }
    return histogram;
};

Tree.prototype.getAverageEdgeAmount = function () {
    var allEdges = 0;
    var vertices = 0;

    for (var i = 0; i < this.layers.length - 1; i++) {
        var layer = this.layers[i];
        console.log(layer);
        for (var j = 0; j < layer.vertices.length; j++) {
            if (layer.vertices[j].processed) {
                vertices++;
                allEdges += layer.vertices[j].childrenAmount;
            }
        }
    }
    console.log('ahtung');
    console.log(allEdges);
    console.log(vertices);

    return allEdges / vertices;
};

Tree.prototype.fillTable = function () {
    var verticesDiv = document.getElementById('vertices');
    var leavesDiv = document.getElementById('leaves');

    verticesDiv.innerHTML += '<h2> Количество: ' + this.getVertexes() + '</h2>';
    leavesDiv.innerHTML += '<h2> Количество: ' + this.getLeaves() + '</h2>';

    this.layers.forEach(function (layer, ind) {

        verticesDiv.innerHTML += '<h3> Уровень: ' + ind + '</h3>';
        leavesDiv.innerHTML += '<h3> Уровень: ' + ind + '</h3>';

        layer.vertices.forEach(function (vertex) {

            verticesDiv.innerHTML += vertex.name + '; ';

            if (vertex.childrenAmount == 0) {
                leavesDiv.innerHTML += vertex.name + '; ';
            }
        });

    });
};

Tree.prototype.fillTableWithAllVertices = function () {
    var verticesDiv = document.getElementById('vertices');
    var table = document.createElement('table');

    var vertices = this.getVertexesArray();

    var div = document.createElement('div');
    div.innerHTML = 'Количество вершин: ' + vertices.length;
    verticesDiv.appendChild(div);

    while (vertices.length > 0) {
        var tr = document.createElement('tr');
        var isLonger = vertices.length > 10;
        for (var i = 0; i < (isLonger ? 10 : vertices.length); i++) {
            var td = document.createElement('td');
            var v = vertices.shift();
            td.innerHTML = v.name;
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    verticesDiv.appendChild(table);
};

Tree.prototype.fillTableWithAllLeaves = function () {
    var leavesDiv = document.getElementById('leaves');
    var table = document.createElement('table');

    var leaves = this.getLeavesArray();

    var div = document.createElement('div');
    div.innerHTML = 'Количество вершин: ' + leaves.length;
    leavesDiv.appendChild(div);

    while (leaves.length > 0) {
        var tr = document.createElement('tr');
        var isLonger = leaves.length > 10;
        for (var i = 0; i < (isLonger ? 10 : leaves.length); i++) {
            var td = document.createElement('td');
            var v = leaves.shift();
            td.innerHTML = v.name;
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    leavesDiv.appendChild(table);
};

Tree.prototype.fillNetwork = function () {
    if (network != null || network != undefined) {
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
    this.processed = false;
}

function Layer() {
    this.vertices = [];
}

function createTree(treeNumber, randomTreeIndex) {
    var layers = [];
    var firstLayer = new Layer();
    firstLayer.vertices.push(new Vertex(0, 1));
    layers.push(firstLayer);

    var numberExceed = false;
    var interrupted = false;
    var layerCnt = 0;
    var globalCnt = 1;

    var tree = new Tree();
    tree.layers = layers;

    console.log('Starting constructing...');
    do {
        var prevLayer = layers[layerCnt++];
        var nextLayer = new Layer();
        layers.push(nextLayer);

        //console.log('Took layer: ' + (layerCnt - 1));

        if (prevLayer.vertices.length == 0) {
            console.log('No vertices in last layer');

            if (globalCnt < 10) {
                console.log('Interrupt!');
                interrupted = true;

            } else {
                layers.splice(layers.length - 1, 1);
                //tree.layers = layers;
                trees.push(tree);
                interrupted = true;
            }

        } else {
            //console.log('It contains : ' + prevLayer.vertices.length + ' vertices');

            for (var i = 0; i < prevLayer.vertices.length; i++) {
                if (!numberExceed) {
                    var vertex = prevLayer.vertices[i];
                    vertex.childrenAmount = 0;
                    vertex.processed = true;

                    var childrenAmount = constantAmount ? maxChildren - 1 : Math.floor(Math.random() * maxChildren);
                    //var children = [];

                    for (var j = 0; j < childrenAmount; j++) {
                        if (aVariant) {
                            if (globalCnt == N) {
                                numberExceed = true;
                                break;
                            }
                        }

                        var childVertex = new Vertex(vertex.index, ++globalCnt);
                        vertex.childrenAmount++;
                        nextLayer.vertices.push(childVertex);

                        if (treeNumber == randomTreeIndex) {
                            console.log(JSON.parse(JSON.stringify(tree)));
                            console.log(tree.getVertexes());
                            console.log(tree.getLeaves());
                            console.log(tree.countAlpha());
                            var alpha = tree.countAlpha();
                            document.getElementById('lim').innerHTML += (globalCnt + ';' + alpha) + '<br>';
                        }
                    }
                }
            }
            if (globalCnt > N) {
                numberExceed = true;
            }
        }

    } while (!(numberExceed || interrupted));

    if (!interrupted) {
        console.log('Finished tree with index: ' + treeNumber);
        //tree.layers = layers;
        trees.push(tree);

    } else {
        console.log('Tree was interrupted at first stage')
    }
}

function getAllLeavesAmount(trees) {
    var sum = 0;
    trees.forEach(function (tree) {
        sum += tree.getLeaves();
    });

    return sum;
}

function getAllVerticesAmount(trees) {
    var sum = 0;
    trees.forEach(function (tree) {
        sum += tree.getVertexes();
    });

    return sum;
}

function getAllLayersAmount(trees) {
    return trees.map(function (tree) {
        return tree.layers.length;
    }).reduce(function (sum, curr) {
        return parseFloat(sum) + parseFloat(curr);
    });
}

function getAllAlpha(trees) {
    return trees.map(function (tree) {
        var alpha = tree.countAlpha();
        return alpha;
    }).reduce(function (sum, curr) {
        return parseFloat(sum) + parseFloat(curr);
    });
}

function getDispersion(trees, what) {
    switch (what) {
        case 'vertices':
        {
            return getVerticesDispersion(trees);
        }
        case 'leaves':
        {
            return getLeavesDispersion(trees);
        }
        case 'alpha':
        {
            return getAlphaDispersion(trees);
        }
        case 'layers':
        {
            return getLayersDispersion(trees);
        }
        default:
        {
            return 0;
        }
    }
}

function getVerticesDispersion(trees) {
    var all = getAllVerticesAmount(trees);
    var average = (all / trees.length).toFixed(2);

    var squaredSum = 0;
    trees.forEach(function (tree) {
        var diff = tree.getVertexes() - average;
        squaredSum += diff * diff;
    });

    return Math.floor(squaredSum / all);
}

function getLeavesDispersion(trees) {
    var all = getAllLeavesAmount(trees);

    var average = (all / trees.length).toFixed(2);


    var squaredSum = 0;
    trees.forEach(function (tree) {
        var diff = tree.getLeaves() - average;
        squaredSum += diff * diff;
    });

    return Math.floor(squaredSum / all);
}

function getAlphaDispersion(trees) {
    var all = getAllAlpha(trees);
    console.log('ALL getAllAlpha: ' + all);
    var average = (all / trees.length).toFixed(2);
    console.log('AVERAGE: ' + average);
    var squaredSum = 0;
    trees.forEach(function (tree) {
        var diff = tree.countAlpha() - average;
        squaredSum += diff * diff;
    });

    return squaredSum / all;
}

function getLayersDispersion(trees) {
    var all = getAllLayersAmount(trees);
    var average = (all / trees.length).toFixed(2);

    var squaredSum = 0;
    trees.forEach(function (tree) {
        var diff = tree.layers.length - average;
        squaredSum += diff * diff;
    });

    return squaredSum / all;
}

function makeAlphaDiagram(tree) {
    var observedTree = new Tree();
    var observedTreeLayers = [];

    observedTree.layers = observedTreeLayers;

    for (var i = 0; i < tree.layers.length; i++) {
        var layer = new Layer();
        observedTreeLayers.push(layer);

        var treeLayer = tree.layers[i];
        for (var j = 0; j < treeLayer.vertices.length; j++) {
            layer.vertices.push(treeLayer.vertices[j]);
            console.log(JSON.parse(JSON.stringify(observedTree)));
            console.log(observedTree.countAlpha());
        }
    }
}

function start() {
    document.getElementById('total').innerHTML = '';
    document.getElementById('info').innerHTML = '';
    document.getElementById('lim').innerHTML = '';
    document.getElementById('vertices').innerHTML = '<h1>Вершины</h1>';
    document.getElementById('leaves').innerHTML = '<h1>Висячие вершины</h1>';
    document.getElementById('all').innerHTML = '<h1>Вывод деревьев</h1>';
    document.getElementById('histogram').innerHTML = '<h1> Гистограмма ребер </h1>';

    var localR = document.getElementById('R').value;
    var localN = document.getElementById('N').value;
    var localM = document.getElementById('m').value;

    aVariant = document.getElementById('v').checked;
    constantAmount = document.getElementById('random').checked;

    if (localR && localN && localM) {
        R = localR;
        N = localN;
        maxChildren = localM;
    }

    document.getElementById('info').innerHTML = 'Параметры генерации: N = ' + N + ', R = ' + R + ', m = ' + maxChildren;

    trees = [];

    var randomTreeIndex = Math.floor(Math.random() * R);
    while (trees.length < R) {
        createTree(trees.length, randomTreeIndex);
    }

    trees[randomTreeIndex].fillNetwork();
    console.log("Amount of trees generated: " + trees.length);

    if (trees.length == 0) {
        alert('Ни одно дерево не было сгенерировано!');

    } else {

        var mathExp = (trees.map(function (tree) {
                return parseFloat(tree.countAlpha());
            }).reduce(function (sum, current) {
                return sum + current;
            })) / trees.length;

        var averageLeaves = trees.map(function (tree) {
                return tree.getLeaves();

            }).reduce(function (sum, current) {
                return sum + current;
            }) / trees.length;

        var theoreticalAlpha = ((maxChildren - 1) / (maxChildren - 2)).toFixed(2);

        console.log('Exp: ' + mathExp);
        console.log('Theor: ' + theoreticalAlpha);

        /* if (constantAmount) {
         if (Math.abs(theoreticalAlpha - mathExp) > 0.1) {
         throw new Error('Практичесое не равно теоретическому!');
         }
         } else {
         if (mathExp < theoreticalAlpha) {
         throw new Error('Практическое значение меньше теоретического!');
         }
         }*/

        console.log('Average alpha: ' + mathExp);
        console.log('Average leaves: ' + averageLeaves);

        document.getElementById('tree').innerHTML = '<h2> Вывод для дерева с индексом: ' + randomTreeIndex + '</h2>';
        trees[randomTreeIndex].fillTableWithAllVertices();
        trees[randomTreeIndex].fillTableWithAllLeaves();
        document.getElementById('tree').innerHTML += '<h3> Его альфа: ' + trees[randomTreeIndex].countAlpha() + '</h3>';
        document.getElementById('tree').innerHTML += '<h3> Его высота: ' + trees[randomTreeIndex].layers.length + '</h3>';

        var histogram = trees[randomTreeIndex].makeHistogram();
        histogram.forEach(function (val, ind) {
            document.getElementById('histogram').innerHTML += ' <br> Количество ребер: ' + ind + ', значение: ' + val;
        });

        var averageEdges = (trees[randomTreeIndex].getAverageEdgeAmount());

        document.getElementById('histogram').innerHTML += '<br> Среднее количество исходящих ребер: ' + averageEdges.toFixed(2);

        trees.forEach(function (tree, ind) {
            document.getElementById('all').innerHTML += '<br> <span> Дерево: ' + ind + ', альфа: ' + tree.countAlpha() + ', количество вершин: ' + tree.getVertexes() + ', висячих: ' + tree.getLeaves() + ', высота: ' + tree.getLayers() + '</span> <br>';
        });

        document.getElementById('total').innerHTML += '<h2> Среднее количество вершин: ' + Math.floor(getAllVerticesAmount(trees) / trees.length) + '</h2>';
        document.getElementById('total').innerHTML += '<h2> Дисперсия вершин: ' + getDispersion(trees, 'vertices') + '</h2>';
        document.getElementById('total').innerHTML += '<h2> СКО вершин: ' + Math.sqrt(getDispersion(trees, 'vertices')).toFixed(2) + '</h2> <br>';

        document.getElementById('total').innerHTML += '<h2> Среднее количество листьев: ' + Math.floor(getAllLeavesAmount(trees) / trees.length) + '</h2>';
        document.getElementById('total').innerHTML += '<h2> Дисперсия листьев: ' + getDispersion(trees, 'leaves') + '</h2>';
        document.getElementById('total').innerHTML += '<h2> СКО листьев: ' + Math.sqrt(getDispersion(trees, 'leaves')).toFixed(2) + '</h2> <br>';

        document.getElementById('total').innerHTML += '<h2> Средняя высота: ' + Math.floor(getAllLayersAmount(trees) / trees.length) + '</h2>';
        document.getElementById('total').innerHTML += '<h2> Дисперсия высоты: ' + getDispersion(trees, 'layers').toFixed(2) + '</h2>';
        document.getElementById('total').innerHTML += '<h2> СКО высоты: ' + Math.sqrt(getDispersion(trees, 'layers')).toFixed(2) + '</h2> <br>';

        document.getElementById('total').innerHTML += '<h2> Среднее альфа: ' + mathExp.toFixed(2) + '</h2>';
        document.getElementById('total').innerHTML += '<h2> Дисперсия альфы: ' + getDispersion(trees, 'alpha').toFixed(5) + '</h2>';
        document.getElementById('total').innerHTML += '<h2> СКО альфы: ' + Math.sqrt(getDispersion(trees, 'alpha')).toFixed(2) + '</h2> <br>';

        document.getElementById('total').innerHTML += '<h2> Альфа по формуле (m - 1) / (m - 2): ' + ((maxChildren - 1) / (maxChildren - 2)).toFixed(2) + '</h2>';
        /*
         var randomTree = JSON.parse(JSON.stringify(trees[randomTreeIndex]));
         makeAlphaDiagram(randomTree);*/

        if (averageEdges < ((maxChildren - 1) / 2 - 1) || averageEdges > (maxChildren - 1) / 2 + 1) {
            if (!constantAmount) {
                console.log(Math.floor(((maxChildren - 1) / 2 - 1)));
                console.log(Math.ceil((maxChildren - 1) / 2 + 1));
                var str = 'Среднее количество ребер вышло за допустимое значение! ' + averageEdges;
                alert(str);
                throw new Error(str);
            }
        }
    }
}