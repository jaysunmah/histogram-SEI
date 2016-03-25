
var w = 700;
var h = 500;
var toggle = true;
var rectHeight = 400;
var botMargin = 70;
var leftMargin = 50;

var svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

var totalData = {};
var buckets = 10;
var selected = "bots";
var selected_sub = "User number";
var linear_data = true;

var dataLabels = ["User number", "Per-user mean of inserts", "Per-user mean of deletes", "Per-user mean of changes", "Per-user std dev of inserts",   "Per-user std dev of deletes",   "Per-user std dev of changes",   "Per-user-per-page mean of inserts", "Per-user-per-page mean of deletes", "Per-user-per-page mean of changes", "Per-user-per-page std dev of inserts" , "Per-user-per-page std dev of deletes" , "Per-user-per-page std dev of changes",  "Per-user largest single add",   "Per-user largest single delete",    "Per-user largest single change",    "Per-user most frequent hour edited",    "Per-user std dev of most frequent hour edited", "Per-user total edits",  "Per-user total unique pages edited",    "Per-user avg total edits per page", "Per-user std dev total edits per page", "Per-user avg minor revisions",  "Per-user std dev minor revisions",  "Per-user avg time between edits",   "Per-user std dev time between edits",   "Per-user mean time edit from last rev", "Per-user std time edit from last rev",  "a"
];

    
d3.tsv("user_bot_data_small_part1.tsv", function(d) {
    d3.tsv("bots.tsv", function(d1) {
        d3.tsv("bots_part2.tsv", function(d2) {
    var map = d.map( function(i) { return i; })
    var map2 = d1.map( function(i) { return i;})
    var map3 = d2.map( function(i) { return i;})
    var dataset1 = parseData(map);
    var dataset2 = parseData(map2);
    var dataset3 = parseData(map3);
    totalData["user_bot_data_small_part1"] = dataset1;
    totalData["bots"] = dataset2;
    totalData["bots_part2"] = dataset3;
            
    loadDropDown();   
    loadDataMenu();
    drawRects(totalData[selected][selected_sub]["scaled_data"]);
        });
    });
});

function parseData(map) {
    var bucketedData = {};
    for (var i = 0; i < map.length; i++) { //object: {"a": 8083354, "b": 23, "c": 23 }
        for (key in map[i]) {
            if (!isNaN(parseFloat(map[i][key]))) {
                map[i][key] = parseFloat(map[i][key]);
            }
            if (key in bucketedData) {
                bucketedData[key].push(map[i][key])
            } else {
                bucketedData[key] = [map[i][key]];
            }
        }
    }
    return loadLinearHistogram(bucketedData);
}

function loadLinearHistogram(bucketedData) {
    result = {};
    var sortedData = [];
    var currentIndex = 0;
    for (key in bucketedData) {
        var original_data = bucketedData[key];
        currentResult = {}
        sortedData.push(Array.apply(null, Array(buckets)).map(Number.prototype.valueOf,0));
        //accessing individual arrays
        var current = bucketedData[key];
        var curMin = current[0];
        var curMax = current[0];
        for (var i = 0; i < current.length; i++) {
            if (current[i] < curMin) {
                curMin = current[i];
            } else if (current[i] > curMax){
                curMax = current[i];
            }
        }
        var delta = (curMax - curMin) / (buckets - 1);
        for (j = 0; j < current.length; j++) {
            var tempIndex = 0;
            if (delta != 0) {
                tempIndex = Math.floor((current[j] - curMin) / delta);
            }
            sortedData[currentIndex][tempIndex] += 1;
        }
        
        var bucketMin = sortedData[currentIndex][0];
        var bucketMax = sortedData[currentIndex][0];
        
        for (var j = 0; j < sortedData[currentIndex].length; j++) {
            if (sortedData[currentIndex][j] < bucketMin) {
                bucketMin = sortedData[currentIndex][j];
            } else if (sortedData[currentIndex][j] > bucketMax){
                bucketMax = sortedData[currentIndex][j];
            }
        }
        var scalar = bucketMax / rectHeight;
        var scaledData = []
        for (j = 0; j < sortedData[currentIndex].length; j++) {
            scaledData[j] = Math.floor(sortedData[currentIndex][j] / scalar);
        }

        currentResult["data"] = sortedData[currentIndex];
        currentResult["scale"] = scalar;
        currentResult["scaled_data"] = scaledData;
        currentResult["data_max"] = curMax;
        currentResult["data_min"] = curMin;
        currentResult["original"] = original_data;
        currentResult["scaled_max"] = bucketMax / scalar;
        currentResult["scaled_min"] = bucketMin / scalar;
        currentResult["delta"] = delta;
        
        var actualKey = dataLabels[currentIndex];
        
        result[actualKey] = currentResult;
        currentIndex += 1;
    }
    return result;
}

// draws initial rectangles
function drawRects(inputData) {
    var margin = {top: 10, right: 30, bottom: 50, left: 60};
    
    svg.selectAll("rect")
    .data(inputData)
    .enter()
    .append("rect")
    //rect attributes
    .attr("width", ((w - leftMargin) / buckets) - 5)
    .attr("height", 0)
    .attr("x", function(d, i) { return ((w - leftMargin)/buckets) * i + leftMargin;})
    .attr("y", h - botMargin)
    .attr("fill", "steelblue")
    //transitions  <3
    .on("mouseover", setOpacity)
    .on("mouseout", resetOpacity)
    .transition()
    .attr("y", function(d) { return h - d - botMargin; })
    .attr("height", function(d) { return d;} )
    .duration(1200)
    .ease("elastic")
    .delay(function(d, i) { return i * 20})
    
    var dat = totalData[selected][selected_sub];
    
    svg.append("text")
    .attr("class", "x_axis_title")
    .style("font-size", "20px")
    .text(selected_sub)
    .attr("x",w/2)
    .attr("y",h - 5)
    
    svg.append("line")
        .attr("x1", leftMargin)
        .attr("y1", h - botMargin)
        .attr("x2", w)
        .attr("y2", h - botMargin)
        .attr("stroke-width", 1)
        .attr("stroke", "black");
    
    svg.selectAll("text.amount")
        .data(inputData)
        .enter()
        .append("text")
        .attr("class", "amount")
        .attr("x", function(d,i) { return i * (((w - leftMargin)/buckets)) + leftMargin + (((w - leftMargin)/buckets)/2); } )
        .attr("y", h - 45)
        .text(function(d) { return d; })
        .attr("font-family", "sans-serif")
        .attr("text-anchor", "middle")
        .attr("font-size", "300px")
       .transition()
        .attr("y", function(d) { return h - d - botMargin - 5; })
        .duration(1200)
        .ease("elastic")
        .delay(function(d, i) { return i * 20})

    for (var i = 0; i < buckets; i++) {
        //drawing ticks
        svg.append("line")
        .attr("class", "tick" + i)
        .attr("x1", i * (((w - leftMargin)/buckets)) + leftMargin)
        .attr("y1", h - botMargin)
        .attr("x2", i * (((w - leftMargin)/buckets)) + leftMargin)
        .attr("y2", h - botMargin + 5)
        .attr("stroke-width", 1.5)
        .attr("stroke", "black");

        //axis labels
        svg.append("text")
        .attr("class", "num" + i)
        .style("fill", "black")
        .style("font-size", "12px")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .attr("transform", "translate("+(i * (((w - leftMargin)/buckets)) + leftMargin)+","+(h - 45)+") rotate(30)")
        .text(Math.floor(totalData[selected][selected_sub]["delta"] * (i)));
    }
    
    updateHeader(selected);
}

function setOpacity(d,i) {
    d3.select(this).attr({
              opacity: 0.5
            });
}

function resetOpacity(d,i) {
    d3.select(this).attr({
              opacity: 1
            });
}

//animates bar graph transition
function updateData(a) {
    selected_sub = a;
    curdata = totalData[selected][selected_sub]["scaled_data"];
    draw_data(selected, selected_sub, 10,true);
}

//creates initial drop down
function loadDropDown() {
    var selectedDataSet = totalData[selected]
    var s1 = document.getElementById('slct2');
    for (var key in selectedDataSet) {
        var newOption = document.createElement("option");
        newOption.value = key;
        newOption.innerHTML = key;
        s1.options.add(newOption);  
    }
}

function updateHeader(input) {
    var header = document.getElementById('selected');
    if (header.childNodes.length > 0) {
        header.removeChild(header.childNodes[0]);
    }
    header.appendChild(document.createTextNode(input));
}

function loadDataMenu() {
    var selectedDataSet = totalData[selected][selected_sub]["original"];
    var table = document.getElementById('tableset');
    table.innerHTML = "";
    table.border = '1';
    var table_body = document.createElement('TBODY');
    table.appendChild(table_body);
    
    for (var i = 0; i < selectedDataSet.length; i++) {
        var tr = document.createElement('TR');
        tr.appendChild(document.createTextNode(selectedDataSet[i]));
        table_body.appendChild(tr);
    }
    var dataset_div = document.getElementById('dataset');
    dataset_div.appendChild(table);
}

//updates the second drop down list
function populate(s1, s2) {
    //updates second selection menu
    var s1 = document.getElementById(s1);
    var s2 = document.getElementById(s2);
    s2.innerHTML = "";
    var selectedDataSet = totalData[s1.value];
    selected = s1.value;
    for (var key in selectedDataSet) {
        var newOption = document.createElement("option");
        newOption.value = key;
        newOption.innerHTML = key;
        s2.options.add(newOption);  
    }
    
    var currentDataSet = totalData[selected];
    var tempKeys = []
    for (var currentKey in currentDataSet) {
        tempKeys.push(currentKey);
    }
    //sets the first key arbitrarily to display data
    selected_sub = tempKeys[0];
    draw_data(selected, selected_sub, 10, true);
}


function draw_data(sel, sub_sel, buck, linear) {
    curdata = totalData[sel][sub_sel]["scaled_data"]; //change it to get all the normal data, and scale that however we want?
    svg.selectAll('rect').data(curdata)
        .transition()
        .attr("height", function(d) { return d;} )
        .attr("y", function(d) { return h - d - botMargin; })
        .duration(800)
        .delay(function(d, i) { return i * 20})
    
    svg.selectAll('text.amount').data(curdata)
        .attr("x", function(d,i) { return i * (((w - leftMargin)/buckets)) + leftMargin + (((w - leftMargin)/buckets)/2); } )
        .text(function(d) { return d; })
        .transition()
        .attr("y", function(d) { return h - d - botMargin - 5; })
        .duration(800)
        .delay(function(d, i) { return i * 20})
    
    svg.selectAll("text.x_axis_title")
        .text(selected_sub)
    
    for (var i = 0; i < curdata.length; i++) {
        svg.selectAll("text.num" + i).text(Math.floor(totalData[selected][selected_sub]["delta"] * (i)));;
    }
    loadDataMenu();
    updateHeader(selected);
}

// when the input range changes update the angle 
d3.select("#nAngle").on("input", function() {
  update(+this.value);
});

d3.select("#c_button").on("change", function(){
   linear_data = !linear_data;
    console.log(linear_data);
});
// Initial starting angle of the text 
update(10);

// update the element
function update(nAngle) {
  console.log(nAngle);
  // adjust the text on the range slider
  d3.select("#nAngle-value").text(nAngle);
  d3.select("#nAngle").property("value", nAngle);

}