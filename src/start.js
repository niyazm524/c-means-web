const d3 = require('d3')

// Setup data
var dataset = []; // Initialize empty array
var numDataPoints = 400; // Number of dummy data points
var maxRange = /*Math.random() * */ 1000; // Max range of new values
var xScale;
var yScale;
var svg;
var xAxis;
var yAxis;
var centroidRadius = 7;
var pointRadius = 2;
var m = 2; //fuziness control
var thresh = .5; //threshold
var distFunc = 1;
// Setup settings for graphic
var canvas_width = 420;
var canvas_height = 420;
var padding = 30; // for chart edges
var animspeed = 250;
//  Setup C-means
var c = 3; //No. of clusters
var u = []; //Membership function
var V = []; //Cluster centres
var choosefile = 0;

export function initCmeans() {
    u = [];
    V = [];
    dataset = [];
    if (choosefile == 0) {
        //random dataset
        for (var i = 0; i < numDataPoints; i++) {
            var newNumber1 = Math.floor(Math.random() * maxRange); // New random integer
            var newNumber2 = Math.floor(Math.random() * maxRange); // New random integer
            dataset.push([newNumber1, newNumber2]); // Add new number to array
        }

        //Generate u
        for (var i = 0; i < dataset.length; i++) {
            var tempRandom = [];
            var tempTotal = 0;
            for (var noOfClusters = 0; noOfClusters < c; noOfClusters++) {
                tempRandom[noOfClusters] = Math.random(); //Randomly assign u
                tempTotal += tempRandom[noOfClusters]; //Keep a tab of the total sum
            }
            for (var noOfClusters = 0; noOfClusters < c; noOfClusters++) {
                tempRandom[noOfClusters] /= tempTotal; //Normalize so that sum of all membership values = 1
            }
            u[i] = tempRandom; //push value to u
        }
    } else {
        //getfromimage
        for (var t = 0; t < picD.length; t++) {
            u[t] = [picU[t][0], picU[t][1], picU[t][2]];
            dataset[t] = [picD[t][0], picD[t][1]];
        }
    }

    //Generate cluster centres
    for (var i = 0; i < c; i++) {
        V[i] = [Math.floor(Math.random() * maxRange), Math.floor(Math.random() * maxRange)]; //Randomly initialize cluster centers
    }
}

export function initGraph() {
    document.getElementById("objStat").style.display = "none";
    var graphdata = V.concat(dataset);

    // Create scale functions
    xScale = d3.scale.linear() // xScale is width of graphic
        .domain([0, d3.max(graphdata, function (d) {
            return d[0]; // input domain
        })])
        .range([padding, canvas_width - padding /** 2*/]); // output range

    yScale = d3.scale.linear() // yScale is height of graphic
        .domain([0, d3.max(graphdata, function (d) {
            return d[1]; // input domain
        })])
        .range([canvas_height - padding, padding]); // remember y starts on top going down so we flip

    // Define X axis
    xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(maxRange / 200 + 5);

    // Define Y axis
    yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .ticks(maxRange / 200 + 5);

    // Create SVG element
    svg = d3.select("#plot") // This is where we put our vis
        .append("svg")
        .attr("width", canvas_width)
        .attr("height", canvas_height)

    // Create Circles
    svg.selectAll("circle")
        .data(graphdata)
        .enter()
        .append("circle") // Add circle svg
        .attr("cx", function (d) {
            return xScale(d[0]); // Circle's X
        })
        .attr("cy", function (d) { // Circle's Y
            return yScale(d[1]);
        })
        .attr("r", function (d, i) {
            return i < c ? centroidRadius : pointRadius;
        }) // radius
        .attr("fill", function (d, i) {
            return i == 0 ? "#f00" : (i == 1 ? "#0f0" : (i == 2 ? "#00f" : "rgb(" + Math.ceil(255 * u[i - 3][0]) + "," + Math
                .ceil(255 * u[i - 3][1]) + "," + Math.ceil(255 * u[i - 3][2]) + ")"));
        });

    // Add to X axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (canvas_height - padding) + ")")
        .call(xAxis);

    // Add to Y axis
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis);

}

export function dist(vec1, vec2, indexdata, indexcentroid, choice) {
    if (choice == 1) {
        //Euclidean distance
        var N = vec1.length;
        var d = 0;
        for (var i = 0; i < N; i++)
            d += Math.pow(vec1[i] - vec2[i], 2);
        d = Math.sqrt(d);
        return d;
    } else if (choice == 2) {
        //phasor difference
        var r = Math.abs(Math.sqrt(Math.pow(vec1[0], 2) + Math.pow(vec1[1], 2)) - Math.sqrt(Math.pow(vec2[0], 2) + Math.pow(
            vec2[1], 2)));
        var theta = Math.abs(Math.atan(vec1[1] / vec1[0]) - Math.atan(vec2[1] / vec2[0]));
        return r + theta;
    } else if (choice == 3) {
        //city block distance
        return Math.abs(vec1[0] - vec2[0]) + Math.abs(vec1[1] - vec2[1]);
    } else if (choice == 4) {
        //chromatic
        return 1 - u[indexdata][indexcentroid] + u[indexdata][(indexcentroid + 1) % 3] + u[indexdata][(indexcentroid + 2) %
            3
        ];
        /*var factor = 10;
        if(indexcentroid==0)
            if(Math.abs(1-u[indexdata][0]) > 0)
                return factor*Math.abs(10*(1-u[indexdata][0] + u[indexdata][1] + u[indexdata][2]));
            else return 0;
        else if(indexcentroid==1)
            if(Math.abs(1-u[indexdata][1]) > 0)
                return factor*Math.abs((1-u[indexdata][1] + u[indexdata][0] + u[indexdata][2]));
            else return 0;
        else if(indexcentroid==2)
            if(Math.abs(1-u[indexdata][2]) > 0)
                return factor*Math.abs(1-u[indexdata][2] + u[indexdata][0] + u[indexdata][1]);
            else return 0;
        */
    }
}

export function cmeansLoop() {
    //update V - Cluster Centres
    var num = 0.0;
    var den = 0.0;
    var oldV = [];

    for (var t = 0; t < V.length; t++)
        oldV[t] = [V[t][0], V[t][1]];

    for (var i = 0; i < c; i++) {
        num = 0.0;
        den = 0.0;
        for (var k = 0; k < dataset.length; k++) {
            num += Math.pow(u[k][i], m) * dataset[k][0];
            den += Math.pow(u[k][i], m);
        }
        //if(!isNan(num/den))
        V[i][0] = num / den;

        num = 0.0;
        den = 0.0;
        for (var k = 0; k < dataset.length; k++) {
            num += Math.pow(u[k][i], m) * dataset[k][1];
            den += Math.pow(u[k][i], m);
        }
        //if(!isNan(num/den))
        V[i][1] = num / den;
    }

    //update u - membership values

    for (var i = 0; i < c; i++) {
        for (var k = 0; k < dataset.length; k++) {
            num = 0.0;
            den = 0.0;
            num = Math.pow(dist(dataset[k], V[i], k, i, distFunc), 2 / (m - 1));
            for (var j = 0; j < c; j++)
                den += 1.0 / (Math.pow(dist(dataset[k], V[j], k, j, distFunc), 2 / (m - 1)));
            if (!(isNaN(Math.pow(num * den, -1)))) u[k][i] = Math.pow(num * den, -1);
            //if(isNaN(u[k][i])) u[k][i]=0;
        }
    }

    // calculate obj. func. value
    var J = 0;
    for (var i = 0; i < c; i++)
        for (var k = 0; k < dataset.length; k++) {
            J += (Math.pow(u[k][i], m) * Math.pow(dist(dataset[k], V[i], k, i, distFunc), 2));
            //console.log("d" + k +" c " + i + " " + dist(dataset[k],V[i],k,i,distFunc));
        }

    var tempT = 0;
    for (var count = 0; count < c; count++)
        tempT += dist(oldV[count], V[count], count, count, (distFunc == 4) ? 1 : distFunc);

    if (tempT < thresh)
        document.getElementById("Jval").innerHTML = "Objective function value: " + J +
            "<br>Change in cluster location: <span style='color:red'>" + tempT +
            "</span><br><span style='color:green'>Converged!</span>";
    else
        document.getElementById("Jval").innerHTML = "Objective function value: " + J +
            "<br>Change in cluster location: <span style='color:red'>" + tempT + "</span>";
    document.getElementById("objStat").style.display = "block";
    /*	
    //addition
    memNew = [];
    //update membership loc
    for(var i=0; i<numDataPoints; i++)
        memNew.push([xMem(i), yMem(i)]);
    //end of addition
    //*/
}

export function animate() {
    // Update scale domain

    //addition
    //var graphdata = V.concat(memNew);
    var graphdata = V.concat(dataset);

    xScale.domain([0, d3.max(graphdata, function (d) {
        return d[0];
    })]);
    yScale.domain([0, d3.max(graphdata, function (d) {
        return d[1];
    })]);

    var temp = -1;
    var temp2 = -1;
    // Update circles
    svg.selectAll("circle")
        .data(graphdata) // Update with new data
        .transition() // Transition from old to new
        .duration(animspeed) // Length of animation
        .each("start", function () { // Start animation
            d3.select(this) // 'this' means the current element
                // .attr("fill", "red")  // Change color
                .attr("r", function (d, i) {
                    ++temp2;
                    return temp2 < c ? centroidRadius + 1 : pointRadius;
                }); // Change size
        })
        .delay(function (d, i) {
            return 0; /* i / graphdata.length * (animspeed/5); */ // Dynamic delay (i.e. each item delays a little longer)
        })
        //.ease("linear")  // Transition easing - default 'variable' (i.e. has acceleration), also: 'circle', 'elastic', 'bounce', 'linear'
        .attr("cx", function (d) {
            return xScale(d[0]); // Circle's X
        })
        .attr("cy", function (d) {
            return yScale(d[1]); // Circle's Y
        })
        .each("end", function () { // End animation

            d3.select(this) // 'this' means the current element
                .transition()
                .duration(150)
                .attr("fill", function (d, i) {
                    ++temp;
                    if (isNaN(d3.select(this).attr("cx"))) return "rgba(0,0,0,0)";
                    //if(isNaN($(this).cx) || isNaN($(this).cy)) return "rgba(0,0,0,0)";
                    return (temp == 0) ? "#f00" : (temp == 1 ? "#0f0" : (temp == 2 ? "#00f" : "rgb(" + Math.ceil(255 * u[temp - 3]
                    [0]) + "," + Math.ceil(255 * u[temp - 3][1]) + "," + Math.ceil(255 * u[temp - 3][2]) + ")"));
                }) // Change color
                .attr("r", function (d, i) {
                    return (temp < c) ? centroidRadius : pointRadius
                }); // Change size
            if (temp == numDataPoints + c - 1) {
                document.getElementById("lblStatus").innerHTML = "Rendering complete";
                setTimeout(function () {
                    document.getElementById("lblStatus").style.display = "none";
                }, 100);
            }
        });

    // Update X Axis
    svg.select(".x.axis")
        .transition()
        .duration(animspeed)
        .call(xAxis);

    // Update Y Axis
    svg.select(".y.axis")
        .transition()
        .duration(animspeed)
        .call(yAxis);
}

export {
    dataset,
    numDataPoints,
    maxRange,
    xScale,
    yScale,
    svg,
    xAxis,
    yAxis,
    centroidRadius,
    pointRadius,
    m,
    thresh,
    distFunc,
    canvas_width,
    canvas_height,
    padding,
    animspeed,
    c,
    u,
    V,
    choosefile
}